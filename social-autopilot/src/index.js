import { assertAdmin, bufferPostMetadata, gqlString, modelText, nextEditorialDate, parisLocalToUtc, parseJsonObject, selectChannels, toParisLocalInput } from "./core.js";

const NEIGHBORHOODS = ["La Joliette", "Notre-Dame-du-Mont", "Sainte-Anne", "Cinq-Avenues"];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true, service: "111-social-autopilot" });
    if (url.pathname === "/favicon.svg" || url.pathname === "/favicon.ico") return favicon();
    const media = url.pathname.match(/^\/media\/([a-zA-Z0-9.-]+)$/);
    if (media) return serveMedia(env, `proposals/${media[1]}`);
    if (url.pathname === "/login" && request.method === "POST") return login(request, env);
    const denied = assertAdmin(request, env);
    if (denied) return url.pathname === "/" && request.method === "GET" ? loginPage() : denied;

    try {
      if (url.pathname === "/api/buffer/channels") return json(await getBufferChannels(env));
      if (url.pathname === "/api/sync" && request.method === "POST") return actionResponse(request, await syncBufferStatuses(env));
      if (url.pathname === "/api/generate" && request.method === "POST") {
        const form = await optionalFormData(request);
        const job = await queueGeneration(env, generationOptions(form));
        if (job.created) ctx.waitUntil(runGenerationJob(env, job.id));
        const result = { ok: true, status: job.created ? "queued" : "already_running", jobId: job.id };
        return form ? new Response(null, { status: 303, headers: { location: "/" } }) : json(result, 202);
      }
      const approve = url.pathname.match(/^\/api\/proposals\/([^/]+)\/approve$/);
      if (approve && request.method === "POST") return actionResponse(request, await saveAndApprove(request, env, approve[1]));
      const reject = url.pathname.match(/^\/api\/proposals\/([^/]+)\/reject$/);
      if (reject && request.method === "POST") return actionResponse(request, await rejectProposal(env, reject[1]));
      const save = url.pathname.match(/^\/api\/proposals\/([^/]+)\/save$/);
      if (save && request.method === "POST") return actionResponse(request, await saveProposal(request, env, save[1]));
      const image = url.pathname.match(/^\/api\/proposals\/([^/]+)\/image$/);
      if (image && request.method === "POST") return actionResponse(request, await replaceProposalImage(request, env, image[1]));
      const duplicate = url.pathname.match(/^\/api\/proposals\/([^/]+)\/duplicate$/);
      if (duplicate && request.method === "POST") return actionResponse(request, await duplicateProposal(env, duplicate[1]));
      if (url.pathname === "/api/library" && request.method === "POST") return actionResponse(request, await saveLibraryItem(request, env), "/?view=library");
      const updateLibrary = url.pathname.match(/^\/api\/library\/([^/]+)\/save$/);
      if (updateLibrary && request.method === "POST") return actionResponse(request, await updateLibraryItem(request, env, updateLibrary[1]), "/?view=library");
      const archiveLibrary = url.pathname.match(/^\/api\/library\/([^/]+)\/(archive|restore)$/);
      if (archiveLibrary && request.method === "POST") return actionResponse(request, await setLibraryItemActive(env, archiveLibrary[1], archiveLibrary[2] === "restore"), `/?view=library${archiveLibrary[2] === "restore" ? "&library=archived" : ""}`);
      if (url.pathname === "/" && request.method === "GET") return dashboard(env, url);
      return new Response("Introuvable", { status: 404 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      if (request.headers.get("content-type")?.includes("form")) {
        const referer = request.headers.get("referer");
        let returnUrl = new URL("/", request.url);
        if (referer) {
          const candidate = new URL(referer);
          if (candidate.origin === new URL(request.url).origin) returnUrl = candidate;
        }
        returnUrl.searchParams.set("action_error", message);
        return new Response(null, { status: 303, headers: { location: `${returnUrl.pathname}${returnUrl.search}` } });
      }
      return json({ ok: false, error: message }, 500);
    }
  },

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(queueScheduledGeneration(env));
  },
};

async function queueScheduledGeneration(env) {
  await syncBufferStatuses(env);
  const pending = await env.DB.prepare("SELECT id FROM proposals WHERE status='pending' LIMIT 1").first();
  if (pending) return;
  const job = await queueGeneration(env, {});
  if (job.created) await runGenerationJob(env, job.id);
}

async function queueGeneration(env, options = {}) {
  const active = await env.DB.prepare("SELECT id FROM generation_jobs WHERE status IN ('queued','running') ORDER BY created_at DESC LIMIT 1").first();
  if (active) {
    const staleBefore = new Date(Date.now() - 120_000).toISOString();
    const stale = await env.DB.prepare("SELECT id FROM generation_jobs WHERE id=? AND updated_at<?").bind(active.id, staleBefore).first();
    if (!stale) return { id: active.id, created: false };
    await env.DB.prepare("UPDATE generation_jobs SET status='failed',updated_at=?,error='Tâche interrompue avant sa finalisation' WHERE id=?").bind(new Date().toISOString(), active.id).run();
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare("INSERT INTO generation_jobs (id,created_at,updated_at,status,neighborhood,objective,subject_type,brief,variant_count,tone,audience,call_to_action) VALUES (?,?,?,'queued',?,?,?,?,?,?,?,?)")
    .bind(id, now, now, options.subject || null, options.objective || "engagement", options.subjectType || "auto", options.brief || null, options.variantCount || 1, options.tone || null, options.audience || null, options.callToAction || null).run();
  return { id, created: true };
}

async function runGenerationJob(env, jobId) {
  await env.DB.prepare("UPDATE generation_jobs SET status='running',updated_at=? WHERE id=?").bind(new Date().toISOString(), jobId).run();
  try {
    const job = await env.DB.prepare("SELECT neighborhood AS subject,objective,subject_type AS subjectType,brief,variant_count AS variantCount,tone,audience,call_to_action AS callToAction FROM generation_jobs WHERE id=?").bind(jobId).first();
    const count = Math.min(3, Math.max(1, Number(job?.variantCount) || 1));
    const groupId = count > 1 ? crypto.randomUUID() : null;
    let sharedMedia = null;
    for (let index = 1; index <= count; index += 1) {
      const generated = await generateProposal(env, { ...(job || {}), variantGroupId: groupId, variantIndex: index, variantCount: count, sharedMedia });
      sharedMedia ||= generated.media;
    }
    await env.DB.prepare("UPDATE generation_jobs SET status='complete',updated_at=?,error=NULL WHERE id=?").bind(new Date().toISOString(), jobId).run();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de génération";
    await env.DB.prepare("UPDATE generation_jobs SET status='failed',updated_at=?,error=? WHERE id=?").bind(new Date().toISOString(), message, jobId).run();
    throw error;
  }
}

async function generateProposal(env, options = {}) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const subject = options.subject || randomSubject();
  const subjectType = options.subjectType || inferSubjectType(subject);
  const objective = options.objective || "engagement";
  const brief = options.brief || "";
  const creativeAngle = variantAngle(options.variantIndex || 1);
  const content = await generateCopy(env, { subject, subjectType, objective, brief, tone: options.tone, audience: options.audience, callToAction: options.callToAction, creativeAngle });
  const visualPrompt = `Affiche streetwear carrée premium pour la marque 111 à Marseille. Sujet : ${subject}. Angle créatif : ${creativeAngle}. Objectif : ${objective}. ${brief ? `Consignes : ${brief}.` : ""} Bleu méditerranéen, jaune solaire, blanc cassé, composition graphique éditoriale, sans faux monument, sans texte autre que 111.`;
  let mediaKey = options.sharedMedia?.mediaKey;
  let mediaUrl = options.sharedMedia?.mediaUrl;
  if (!mediaKey || !mediaUrl) {
    const image = await generateImage(env, visualPrompt);
    mediaKey = `proposals/${id}.jpg`;
    await env.MEDIA.put(mediaKey, image, { httpMetadata: { contentType: "image/jpeg", cacheControl: "public, max-age=31536000, immutable" } });
    mediaUrl = `${env.MEDIA_PUBLIC_BASE_URL.replace(/\/$/, "")}/media/${id}.jpg`;
  }
  const publishAt = nextEditorialDate();
  await env.DB.prepare(`INSERT INTO proposals
    (id,created_at,updated_at,status,neighborhood,hook,instagram_text,tiktok_text,x_text,visual_prompt,media_key,media_url,proposed_publish_at,objective,subject_type,brief,variant_group_id,variant_index,creative_angle,tone,audience,call_to_action,instagram_alt_text,instagram_carousel,tiktok_script,tiktok_overlay,x_thread)
    VALUES (?,?,?,'pending',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(id, createdAt, createdAt, subject, content.hook, content.instagram, content.tiktok, content.x, visualPrompt, mediaKey, mediaUrl, publishAt, objective, subjectType, brief || null, options.variantGroupId || null, options.variantIndex || 1, creativeAngle, options.tone || null, options.audience || null, options.callToAction || null, content.instagramAlt, content.instagramCarousel, content.tiktokScript, content.tiktokOverlay, content.xThread)
    .run();
  return { ok: true, id, status: "pending", proposedPublishAt: publishAt, media: { mediaKey, mediaUrl } };
}

async function generateCopy(env, { subject, subjectType, objective, brief, tone, audience, callToAction, creativeAngle }) {
  const fallback = fallbackCopy(subject, subjectType, objective);
  const prompt = `MISSION PRIORITAIRE : respecte fidèlement toutes les CONSIGNES UTILISATEUR ci-dessous. Le sujet est "${subject}" (${subjectType}), l'objectif est "${objective}" et l'angle de cette variante est "${creativeAngle}".\n\nCONSIGNES UTILISATEUR :\n${brief || "Aucune consigne supplémentaire."}\n\nTON : ${tone || "direct, chaleureux et précis"}\nAUDIENCE : ${audience || "communauté marseillaise"}\nAPPEL À L'ACTION : ${callToAction || "adapté au contenu"}\n\nÉcris pour 111, une marque marseillaise streetwear. Chaque texte doit traiter explicitement le sujet et couvrir tous les points demandés dans les consignes. N'ajoute aucun fait, lieu, date, produit ou promotion absent des consignes. Adapte réellement chaque livrable au réseau. instagramCarousel décrit jusqu'à 5 slides, tiktokScript un script vidéo court, tiktokOverlay les textes à l'écran et xThread 1 à 3 posts numérotés. Instagram max 1200 caractères, TikTok max 500, X max 280.`;
  const fields = ["hook", "instagram", "instagramAlt", "instagramCarousel", "tiktok", "tiktokScript", "tiktokOverlay", "x", "xThread"];
  const responseFormat = { type: "json_schema", json_schema: { type: "object", properties: Object.fromEntries(fields.map(field => [field, { type: "string" }])), required: fields } };
  const errors = [];
  for (const model of ["@cf/meta/llama-3.3-70b-instruct-fp8-fast", "@cf/meta/llama-3.1-8b-instruct-fast"]) {
    try {
      const result = await env.AI.run(model, { messages: [{ role: "system", content: "Tu suis les consignes utilisateur sans les remplacer par un texte générique." }, { role: "user", content: prompt }], response_format: responseFormat, max_tokens: 1200, temperature: 0.45 });
      const parsed = parseJsonObject(modelText(result));
      for (const field of ["hook", "instagram", "tiktok", "x"]) if (!String(parsed[field] || "").trim()) throw new Error(`Champ ${field} absent`);
      return {
        hook: cleanGeneratedText(parsed.hook, 180, fallback.hook), instagram: cleanGeneratedText(parsed.instagram, 2200, fallback.instagram), tiktok: cleanGeneratedText(parsed.tiktok, 2200, fallback.tiktok), x: cleanGeneratedText(parsed.x, 280, fallback.x),
        instagramAlt: cleanGeneratedText(parsed.instagramAlt, 500, `Visuel 111 consacré à ${subject}.`), instagramCarousel: cleanGeneratedText(parsed.instagramCarousel, 1200, ""), tiktokScript: cleanGeneratedText(parsed.tiktokScript, 1600, fallback.tiktok), tiktokOverlay: cleanGeneratedText(parsed.tiktokOverlay, 500, fallback.hook), xThread: cleanGeneratedText(parsed.xThread, 1200, fallback.x),
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "erreur inconnue");
    }
  }
  throw new Error(`La génération rédactionnelle a échoué, aucune proposition générique n'a été créée : ${errors.join(" | ")}`);
}

function fallbackCopy(subject, subjectType, objective) {
  const hook = subjectType === "brand" ? "111, Marseille à porter." : `${subject}, côté 111.`;
  const angle = {
    lancement: "Un nouveau quartier entre dans la collection.",
    produit: "Un quartier, une identité, un design à porter.",
    histoire: "Marseille se raconte aussi par celles et ceux qui vivent ses quartiers.",
    engagement: "Quel souvenir te relie à ce quartier ?",
  }[objective] || objective;
  const tag = hashtag(subject);
  return {
    hook,
    instagram: `${hook}\n\n${angle}\n\n111 raconte Marseille à travers ses identités, ses lieux et celles et ceux qui la font vivre.\n\n#111Marseille #Marseille${tag ? ` #${tag}` : ""}`,
    tiktok: `${hook} ${angle} Marseille, côté 111. #111Marseille${tag ? ` #${tag}` : ""}`,
    x: `${hook}\n\n${angle}\n\nMarseille, côté 111. #111Marseille${tag ? ` #${tag}` : ""}`.slice(0, 280),
    instagramAlt: `Visuel 111 consacré à ${subject}.`, instagramCarousel: "", tiktokScript: `${hook} ${angle}`, tiktokOverlay: hook, xThread: `${hook}\n\n${angle}`,
  };
}

function variantAngle(index) {
  return ["émotion et identité", "histoire et contexte", "impact visuel et appel à l'action"][index - 1] || "identité 111";
}

function cleanGeneratedText(value, limit, fallback) {
  const text = String(value || "").trim();
  return text && text.length <= limit ? text : fallback;
}

function generationOptions(form) {
  if (!form) return {};
  const selectedSubject = limitedText(form.get("subject"), 100);
  const customSubject = limitedText(form.get("custom_subject"), 100);
  const subject = selectedSubject === "__custom__" ? customSubject : selectedSubject || null;
  if (selectedSubject === "__custom__" && !customSubject) throw new Error("Précise le sujet libre");
  const selectedObjective = limitedText(form.get("objective"), 120) || "engagement";
  const customObjective = limitedText(form.get("custom_objective"), 120);
  const objective = selectedObjective === "__custom__" ? customObjective : selectedObjective;
  if (selectedObjective === "__custom__" && !customObjective) throw new Error("Précise l'objectif libre");
  const variantCount = [1, 2, 3].includes(Number(form.get("variant_count"))) ? Number(form.get("variant_count")) : 1;
  return { subject, subjectType: inferSubjectType(subject), objective, brief: limitedText(form.get("brief"), 600), variantCount, tone: limitedText(form.get("tone"), 80), audience: limitedText(form.get("audience"), 120), callToAction: limitedText(form.get("call_to_action"), 160) };
}

function limitedText(value, limit) {
  const text = String(value || "").trim();
  if (text.length > limit) throw new Error(`Le champ dépasse ${limit} caractères`);
  return text;
}

function randomSubject() {
  const subjects = ["La marque 111", "Marseille", ...NEIGHBORHOODS];
  return subjects[Math.floor(Math.random() * subjects.length)];
}

function inferSubjectType(subject) {
  if (!subject) return "auto";
  if (subject === "La marque 111") return "brand";
  if (subject === "Marseille") return "city";
  if (NEIGHBORHOODS.includes(subject)) return "neighborhood";
  return "custom";
}

async function optionalFormData(request) {
  return request.headers.get("content-type")?.includes("form") ? request.formData() : null;
}

function hashtag(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "");
}

async function getBufferChannels(env) {
  const organizations = await buffer(env, `query GetOrganizations { account { organizations { id name } } }`);
  const organization = organizations.account?.organizations?.[0];
  if (!organization) throw new Error("Aucune organisation Buffer trouvée");
  const data = await buffer(env, `query GetChannels { channels(input: { organizationId: ${gqlString(organization.id)} }) { id name displayName service isQueuePaused } }`);
  return { organization: { id: organization.id, name: organization.name }, channels: data.channels || [] };
}

async function approveProposal(env, id) {
  const proposal = await env.DB.prepare("SELECT * FROM proposals WHERE id=?").bind(id).first();
  if (!proposal) throw new Error("Proposition introuvable");
  if (proposal.status !== "pending" && proposal.status !== "failed") throw new Error(`Proposition déjà ${proposal.status}`);
  const { channels } = await getBufferChannels(env);
  const selected = selectChannels(channels);
  const results = {
    instagram: proposal.buffer_instagram_id,
    tiktok: proposal.buffer_tiktok_id,
    twitter: proposal.buffer_x_id,
  };
  try {
    if (proposal.publish_instagram && !results.instagram) {
      results.instagram = await createBufferPost(env, selected.instagram, proposal.instagram_text, platformMedia(proposal, "instagram"), proposal.proposed_publish_at, proposal.instagram_format || "post");
      await saveBufferId(env, id, "buffer_instagram_id", results.instagram);
    }
    if (proposal.publish_tiktok && !results.tiktok) {
      results.tiktok = await createBufferPost(env, selected.tiktok, proposal.tiktok_text, platformMedia(proposal, "tiktok"), proposal.proposed_publish_at, proposal.tiktok_format || "photo");
      await saveBufferId(env, id, "buffer_tiktok_id", results.tiktok);
    }
    if (proposal.publish_x && !results.twitter) {
      results.twitter = await createBufferPost(env, selected.twitter, proposal.x_text, platformMedia(proposal, "x"), proposal.proposed_publish_at, proposal.x_format || "image");
      await saveBufferId(env, id, "buffer_x_id", results.twitter);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur Buffer";
    await env.DB.prepare("UPDATE proposals SET status='failed',updated_at=?,error=? WHERE id=?").bind(new Date().toISOString(), message, id).run();
    throw error;
  }
  const now = new Date().toISOString();
  await env.DB.prepare(`UPDATE proposals SET status='scheduled',updated_at=?,approved_at=?,error=NULL,
    buffer_instagram_id=?,buffer_tiktok_id=?,buffer_x_id=? WHERE id=?`)
    .bind(now, now, results.instagram, results.tiktok, results.twitter, id).run();
  return { ok: true, status: "scheduled", posts: results };
}

async function saveAndApprove(request, env, id) {
  if (request.headers.get("content-type")?.includes("form")) await saveProposal(request, env, id);
  return approveProposal(env, id);
}

async function saveProposal(request, env, id) {
  const proposal = await editableProposal(env, id);
  const form = await request.formData();
  const instagram = cleanText(form.get("instagram_text"), 2200, "Instagram");
  const tiktok = cleanText(form.get("tiktok_text"), 2200, "TikTok");
  const x = cleanText(form.get("x_text"), 280, "X");
  const instagramAlt = limitedText(form.get("instagram_alt_text"), 500);
  const instagramCarousel = limitedText(form.get("instagram_carousel"), 1200);
  const tiktokScript = limitedText(form.get("tiktok_script"), 1600);
  const tiktokOverlay = limitedText(form.get("tiktok_overlay"), 500);
  const xThread = limitedText(form.get("x_thread"), 1200);
  const publishInstagram = form.has("publish_instagram") ? 1 : 0;
  const publishTiktok = form.has("publish_tiktok") ? 1 : 0;
  const publishX = form.has("publish_x") ? 1 : 0;
  if (!publishInstagram && !publishTiktok && !publishX) throw new Error("Choisis au moins une plateforme");
  const publishAt = parisLocalToUtc(form.get("proposed_publish_at"));
  if (new Date(publishAt).getTime() <= Date.now()) throw new Error("Choisis une date de publication future");
  const now = new Date().toISOString();
  const instagramFormat = allowedFormat(form.get("instagram_format"), ["post", "carousel", "reel", "story"], "post");
  const tiktokFormat = allowedFormat(form.get("tiktok_format"), ["photo", "video"], "photo");
  const xFormat = allowedFormat(form.get("x_format"), ["text", "image", "video"], "image");
  const instagramMedia = await uploadedMedia(env, proposal.id, form.getAll("instagram_media"), instagramFormat === "reel" ? "video" : instagramFormat === "story" ? "mixed" : "image");
  const tiktokMedia = await uploadedMedia(env, proposal.id, [form.get("tiktok_media")], tiktokFormat === "video" ? "video" : "image");
  const xMedia = await uploadedMedia(env, proposal.id, [form.get("x_media")], xFormat === "video" ? "video" : "image");
  const instagramUrls = instagramMedia.length ? instagramMedia : parseMediaUrls(proposal.instagram_media_urls);
  if (instagramFormat === "carousel" && instagramUrls.length < 2) throw new Error("Un carrousel Instagram nécessite au moins deux images");
  if (instagramFormat === "reel" && !instagramUrls[0]) throw new Error("Ajoute une vidéo Instagram pour le Reel");
  if (tiktokFormat === "video" && !(tiktokMedia[0] || proposal.tiktok_media_url)) throw new Error("Ajoute une vidéo TikTok");
  if (xFormat === "video" && !(xMedia[0] || proposal.x_media_url)) throw new Error("Ajoute une vidéo pour X");
  await env.DB.prepare(`UPDATE proposals SET instagram_text=?,tiktok_text=?,x_text=?,instagram_alt_text=?,instagram_carousel=?,tiktok_script=?,tiktok_overlay=?,x_thread=?,publish_instagram=?,publish_tiktok=?,publish_x=?,proposed_publish_at=?,instagram_format=?,instagram_media_urls=?,tiktok_format=?,tiktok_media_url=?,x_format=?,x_media_url=?,updated_at=?,error=NULL WHERE id=?`)
    .bind(instagram, tiktok, x, instagramAlt, instagramCarousel, tiktokScript, tiktokOverlay, xThread, publishInstagram, publishTiktok, publishX, publishAt, instagramFormat, instagramUrls.length ? JSON.stringify(instagramUrls) : null, tiktokFormat, tiktokMedia[0] || proposal.tiktok_media_url, xFormat, xMedia[0] || proposal.x_media_url, now, proposal.id).run();
  return { ok: true, status: "saved" };
}

function allowedFormat(value, choices, fallback) {
  return choices.includes(value) ? value : fallback;
}

function parseMediaUrls(value) {
  try { const parsed = JSON.parse(value || "[]"); return Array.isArray(parsed) ? parsed.filter(url => typeof url === "string") : []; } catch { return []; }
}

async function uploadedMedia(env, proposalId, files, expected) {
  const validFiles = files.filter(file => file instanceof File && file.size > 0);
  if (!validFiles.length) return [];
  if (validFiles.length > 10) throw new Error("Maximum 10 médias");
  const urls = [];
  for (const file of validFiles) {
    if (file.size > 50 * 1024 * 1024) throw new Error("Chaque média doit peser moins de 50 Mo");
    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    const isVideo = ["video/mp4", "video/quicktime", "video/webm"].includes(file.type);
    if ((expected === "image" && !isImage) || (expected === "video" && !isVideo) || (expected === "mixed" && !isImage && !isVideo)) throw new Error(`Format de média incompatible (${file.type || "inconnu"})`);
    const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm" }[file.type];
    const filename = `${proposalId}-${crypto.randomUUID()}.${extension}`;
    await env.MEDIA.put(`proposals/${filename}`, new Uint8Array(await file.arrayBuffer()), { httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" } });
    urls.push(`${env.MEDIA_PUBLIC_BASE_URL.replace(/\/$/, "")}/media/${filename}`);
  }
  return urls;
}

function platformMedia(proposal, network) {
  const format = proposal[`${network}_format`] || (network === "instagram" ? "post" : network === "tiktok" ? "photo" : "image");
  if (network === "x" && format === "text") return [];
  const urls = network === "instagram" ? parseMediaUrls(proposal.instagram_media_urls) : [proposal[`${network}_media_url`]].filter(Boolean);
  const resolved = urls.length ? urls : [proposal.media_url];
  const video = format === "reel" || format === "video";
  return resolved.map(url => ({ url, kind: video || (format === "story" && /\.(mp4|mov|webm)(?:$|\?)/i.test(url)) ? "video" : "image" }));
}

async function replaceProposalImage(request, env, id) {
  const proposal = await editableProposal(env, id);
  const form = await request.formData();
  const action = form.get("image_action");
  const file = form.get("image");
  const prompt = String(form.get("visual_prompt") || "").trim();
  let bytes;
  let contentType;
  let extension;
  let savedPrompt = proposal.visual_prompt;
  if (action === "upload") {
    if (!(file instanceof File) || file.size === 0) throw new Error("Sélectionne une image à importer");
    if (file.size > 10 * 1024 * 1024) throw new Error("L'image dépasse 10 Mo");
    const types = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
    extension = types[file.type];
    if (!extension) throw new Error("Format accepté : JPG, PNG ou WebP");
    contentType = file.type;
    bytes = new Uint8Array(await file.arrayBuffer());
  } else if (action === "regenerate") {
    if (!prompt) throw new Error("Ajoute un prompt ou sélectionne une image");
    bytes = await generateImage(env, prompt);
    contentType = "image/jpeg";
    extension = "jpg";
    savedPrompt = prompt;
  } else {
    throw new Error("Action image invalide");
  }
  const filename = `${proposal.id}-${crypto.randomUUID()}.${extension}`;
  const mediaKey = `proposals/${filename}`;
  await env.MEDIA.put(mediaKey, bytes, { httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" } });
  const mediaUrl = `${env.MEDIA_PUBLIC_BASE_URL.replace(/\/$/, "")}/media/${filename}`;
  await env.DB.prepare("UPDATE proposals SET media_key=?,media_url=?,visual_prompt=?,updated_at=?,error=NULL WHERE id=?")
    .bind(mediaKey, mediaUrl, savedPrompt, new Date().toISOString(), proposal.id).run();
  return { ok: true, status: "image_updated", mediaUrl };
}

async function editableProposal(env, id) {
  const proposal = await env.DB.prepare("SELECT * FROM proposals WHERE id=?").bind(id).first();
  if (!proposal) throw new Error("Proposition introuvable");
  if (proposal.status !== "pending" && proposal.status !== "failed") throw new Error("Cette proposition n'est plus modifiable");
  return proposal;
}

async function duplicateProposal(env, id) {
  const source = await env.DB.prepare("SELECT * FROM proposals WHERE id=?").bind(id).first();
  if (!source) throw new Error("Proposition introuvable");
  const duplicateId = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(`INSERT INTO proposals
    (id,created_at,updated_at,status,neighborhood,hook,instagram_text,tiktok_text,x_text,visual_prompt,media_key,media_url,proposed_publish_at,publish_instagram,publish_tiktok,publish_x,objective,subject_type,brief)
    VALUES (?,?,?,'pending',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(duplicateId, now, now, source.neighborhood, source.hook, source.instagram_text, source.tiktok_text, source.x_text, source.visual_prompt, source.media_key, source.media_url, nextEditorialDate(), source.publish_instagram, source.publish_tiktok, source.publish_x, source.objective || "engagement", source.subject_type || "custom", source.brief || null).run();
  return { ok: true, status: "duplicated", id: duplicateId };
}

async function syncBufferStatuses(env) {
  const scheduled = await env.DB.prepare("SELECT * FROM proposals WHERE status='scheduled'").all();
  if (!scheduled.results.length) return { ok: true, checked: 0, published: 0, failed: 0 };
  const { organization, channels } = await getBufferChannels(env);
  const channelIds = channels.map((channel) => gqlString(channel.id)).join(",");
  const data = await buffer(env, `query SyncPosts { posts(first: 100, input: { organizationId: ${gqlString(organization.id)}, filter: { status: [sent, error], channelIds: [${channelIds}] } }) { edges { node { id status channelId } } } }`);
  const statuses = new Map((data.posts?.edges || []).map(({ node }) => [node.id, node.status]));
  let published = 0;
  let failed = 0;
  for (const proposal of scheduled.results) {
    const ids = [proposal.publish_instagram && proposal.buffer_instagram_id, proposal.publish_tiktok && proposal.buffer_tiktok_id, proposal.publish_x && proposal.buffer_x_id].filter(Boolean);
    if (ids.some((postId) => statuses.get(postId) === "error")) {
      await env.DB.prepare("UPDATE proposals SET status='failed',updated_at=?,error='Buffer signale un échec de publication' WHERE id=?").bind(new Date().toISOString(), proposal.id).run();
      failed += 1;
    } else if (ids.length && ids.every((postId) => statuses.get(postId) === "sent")) {
      const now = new Date().toISOString();
      await env.DB.prepare("UPDATE proposals SET status='published',updated_at=?,published_at=?,error=NULL WHERE id=?").bind(now, now, proposal.id).run();
      published += 1;
    }
  }
  return { ok: true, checked: scheduled.results.length, published, failed };
}

function cleanText(value, maxLength, platform) {
  const text = String(value || "").trim();
  if (!text) throw new Error(`Le texte ${platform} est vide`);
  if (text.length > maxLength) throw new Error(`Le texte ${platform} dépasse ${maxLength} caractères`);
  return text;
}

async function generateImage(env, prompt) {
  if (prompt.length > 2048) throw new Error("Le prompt image dépasse 2 048 caractères");
  const result = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", { prompt, steps: 4 });
  if (!result?.image) throw new Error("Workers AI n'a pas retourné de visuel");
  return Uint8Array.from(atob(result.image), (char) => char.charCodeAt(0));
}

async function saveBufferId(env, proposalId, column, postId) {
  const allowed = new Set(["buffer_instagram_id", "buffer_tiktok_id", "buffer_x_id"]);
  if (!allowed.has(column)) throw new Error("Colonne Buffer invalide");
  await env.DB.prepare(`UPDATE proposals SET ${column}=?,updated_at=? WHERE id=?`)
    .bind(postId, new Date().toISOString(), proposalId).run();
}

async function rejectProposal(env, id) {
  const now = new Date().toISOString();
  const result = await env.DB.prepare("UPDATE proposals SET status='rejected',updated_at=?,rejected_at=? WHERE id=? AND status IN ('pending','failed')").bind(now, now, id).run();
  if (!result.meta.changes) throw new Error("Proposition introuvable ou déjà traitée");
  return { ok: true, status: "rejected" };
}

async function createBufferPost(env, channel, text, media, dueAt, format) {
  const metadata = bufferPostMetadata(channel.service, text, format);
  const assets = media.map(item => `{ ${item.kind}: { url: ${gqlString(item.url)} } }`).join(",");
  const query = `mutation CreateScheduledPost { createPost(input: { text: ${gqlString(text)}, channelId: ${gqlString(channel.id)}, schedulingType: automatic, mode: customScheduled, dueAt: ${gqlString(dueAt)}, assets: [${assets}] ${metadata} }) { ... on PostActionSuccess { post { id text dueAt } } ... on MutationError { message } } }`;
  const data = await buffer(env, query);
  if (data.createPost?.message) throw new Error(`Buffer : ${data.createPost.message}`);
  if (!data.createPost?.post?.id) throw new Error("Buffer n'a pas retourné d'identifiant de publication");
  return data.createPost.post.id;
}

async function buffer(env, query) {
  if (!env.BUFFER_API_KEY) throw new Error("BUFFER_API_KEY absent");
  const response = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${env.BUFFER_API_KEY}` },
    body: JSON.stringify({ query }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Buffer HTTP ${response.status}`);
  if (body.errors?.length) throw new Error(body.errors.map((item) => item.message).join(" | "));
  return body.data;
}

async function dashboard(env, url) {
  const view = ["posts", "calendar", "library", "analytics", "engagements"].includes(url.searchParams.get("view")) ? url.searchParams.get("view") : "posts";
  if (view === "analytics") return analyticsPage(env);
  if (view === "engagements") return engagementsPage(env);
  if (view === "library") return libraryPage(env, url);
  if (view === "calendar") return calendarPage(env);
  const allowedStatuses = new Set(["pending", "scheduled", "published", "rejected", "failed"]);
  const activeStatus = allowedStatuses.has(url.searchParams.get("status")) ? url.searchParams.get("status") : "all";
  const proposals = activeStatus === "all"
    ? await env.DB.prepare("SELECT * FROM proposals ORDER BY created_at DESC LIMIT 50").all()
    : await env.DB.prepare("SELECT * FROM proposals WHERE status=? ORDER BY created_at DESC LIMIT 50").bind(activeStatus).all();
  const job = await env.DB.prepare("SELECT status,error FROM generation_jobs ORDER BY created_at DESC LIMIT 1").first();
  const cards = proposals.results.map(proposalCard).join("");
  const actionError = url.searchParams.get("action_error");
  const actionNotice = actionError ? `<p class="error">La programmation a échoué : ${escapeHtml(actionError)}. La proposition reste disponible dans « Erreurs » pour réessayer.</p>` : "";
  const jobNotice = job?.status === "running" || job?.status === "queued" ? "<p class=\"notice\" data-generation-pending>Génération en cours… Vérification automatique dans quelques secondes.</p>" : job?.status === "failed" ? `<strong class="error">Échec de génération : ${escapeHtml(job.error)}</strong>` : "";
  return page(`${generationPanel()}${actionNotice}${jobNotice}<nav class="filters" aria-label="Filtrer les propositions">${statusFilter("all", "Toutes", activeStatus)}${statusFilter("pending", "À valider", activeStatus)}${statusFilter("scheduled", "Programmées", activeStatus)}${statusFilter("published", "Publiées", activeStatus)}${statusFilter("failed", "Erreurs", activeStatus)}${statusFilter("rejected", "Refusées", activeStatus)}</nav><section class="cards">${cards || "<p class=\"empty\">Aucune proposition dans cette catégorie.</p>"}</section>`, "posts");
}

function page(content, view) {
  return new Response(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>111 Social</title><style>${styles()}${flexibleGenerationStyles()}${v2Styles()}${libraryStyles()}${formatStyles()}</style></head><body><div class="topline">Marseille, quartier par quartier · Validation avant publication</div><main><header>${brand()}<nav class="main-nav"><a class="${view === "posts" ? "active" : ""}" href="/">Publications</a><a class="${view === "calendar" ? "active" : ""}" href="/?view=calendar">Calendrier</a><a class="${view === "library" ? "active" : ""}" href="/?view=library">Bibliothèque</a><a class="${view === "analytics" ? "active" : ""}" href="/?view=analytics">Statistiques</a><a class="${view === "engagements" ? "active" : ""}" href="/?view=engagements">Commentaires</a></nav></header>${content}</main>${confirmationModal()}<script>${mediaFormScripts()}${scripts()}${generationScripts()}</script></body></html>`, htmlHeaders());
}

async function analyticsPage(env) {
  let posts = [];
  let error = "";
  try {
    const { organization, channels } = await getBufferChannels(env);
    const ids = channels.map(channel => gqlString(channel.id)).join(",");
    const data = await buffer(env, `query Performance { posts(first: 50, input: { organizationId: ${gqlString(organization.id)}, filter: { status: [sent], channelIds: [${ids}] } }) { edges { node { id text dueAt channelId metrics { type name value unit } metricsUpdatedAt } } } }`);
    posts = (data.posts?.edges || []).map(edge => edge.node);
  } catch (cause) { error = cause instanceof Error ? cause.message : "Statistiques indisponibles"; }
  const totals = new Map();
  for (const post of posts) for (const metric of post.metrics || []) totals.set(metric.type, (totals.get(metric.type) || 0) + Number(metric.value || 0));
  const cards = [["Publications", posts.length], ["Réactions", totals.get("reactions") || 0], ["Commentaires", totals.get("comments") || 0], ["Portée", totals.get("reach") || 0]];
  const ranked = [...posts].sort((a,b) => metricScore(b) - metricScore(a)).slice(0,5);
  const recommendation = posts.length < 3 ? "Publiez au moins trois contenus pour obtenir des recommandations fiables." : `Le format le plus performant totalise ${Math.round(metricScore(ranked[0]))} interactions. Réutilisez son sujet et son angle dans une nouvelle variante, sans recopier le texte.`;
  return page(`<div class="page-heading"><div><span class="status">Performances Buffer</span><h2>Statistiques</h2></div></div>${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}<section class="metric-grid">${cards.map(([label,value]) => `<article><span>${label}</span><strong>${Number(value).toLocaleString("fr-FR")}</strong></article>`).join("")}</section><section class="recommendation"><span class="status">Recommandation</span><h3>Prochaine décision éditoriale</h3><p>${escapeHtml(recommendation)}</p></section><section class="ranking"><h3>Meilleures publications</h3>${ranked.map(post => `<article><strong>${escapeHtml(String(post.text || "").slice(0,90))}</strong><span>${Math.round(metricScore(post))} interactions</span></article>`).join("") || `<p class="empty">Les résultats apparaîtront après les premières publications.</p>`}</section>`, "analytics");
}

function metricScore(post) {
  return (post.metrics || []).reduce((sum, metric) => sum + (["reactions","comments","reposts","clicks","saves"].includes(metric.type) ? Number(metric.value || 0) : 0), 0);
}

async function engagementsPage(env) {
  let channels = [];
  let error = "";
  try { ({ channels } = await getBufferChannels(env)); } catch (cause) { error = cause instanceof Error ? cause.message : "Canaux indisponibles"; }
  return page(`<div class="page-heading"><div><span class="status">Conversation</span><h2>Commentaires</h2></div></div>${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}<p class="notice">La lecture et la réponse aux commentaires dépendent des capacités Buffer activées pour chaque réseau. Aucune réponse ne sera envoyée sans validation.</p><section class="channel-capabilities">${channels.map(channel => `<article><span class="avatar">${escapeHtml(String(channel.service || "?").slice(0,1).toUpperCase())}</span><div><strong>${escapeHtml(channel.displayName || channel.name)}</strong><small>${escapeHtml(channel.service)} · vérification des commentaires au prochain échange publié</small></div></article>`).join("")}</section><div class="empty-inbox"><strong>Aucun commentaire synchronisable pour le moment</strong><p>La boîte de réception s'activera dès qu'une publication gérée par Buffer recevra un engagement compatible.</p></div>`, "engagements");
}

async function calendarPage(env) {
  const proposals = await env.DB.prepare("SELECT * FROM proposals WHERE status!='rejected' ORDER BY proposed_publish_at ASC LIMIT 100").all();
  const groups = new Map();
  for (const item of proposals.results) {
    const day = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long" }).format(new Date(item.proposed_publish_at));
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day).push(item);
  }
  const content = `<div class="page-heading"><div><span class="status">Planning éditorial</span><h2>Calendrier</h2></div><a class="button-link" href="/">Créer une publication</a></div><div class="calendar">${[...groups].map(([day, items]) => `<section class="calendar-day"><h3>${escapeHtml(day)}</h3>${items.map(item => `<a href="/?status=${item.status}" class="calendar-item"><time>${formatParisDate(item.proposed_publish_at).split(" à ").pop()}</time><img src="${escapeHtml(item.media_url)}" alt=""><span><strong>${escapeHtml(item.neighborhood)}</strong><small>${escapeHtml(item.status)} · ${[item.publish_instagram && "Instagram", item.publish_tiktok && "TikTok", item.publish_x && "X"].filter(Boolean).join(", ")}</small></span></a>`).join("")}</section>`).join("") || `<p class="empty">Aucune publication dans le calendrier.</p>`}</div>`;
  return page(content, "calendar");
}

async function libraryPage(env, url) {
  const archived = url.searchParams.get("library") === "archived";
  const items = await env.DB.prepare("SELECT * FROM content_items WHERE active=? ORDER BY readiness DESC,type,title").bind(archived ? 0 : 1).all();
  const cards = items.results.map(item => libraryCard(item, archived)).join("");
  const actionError = url.searchParams.get("action_error");
  const content = `<div class="page-heading"><div><span class="status">Source de vérité</span><h2>Bibliothèque 111</h2></div><a class="button-link secondary-link" href="/?view=library${archived ? "" : "&library=archived"}">${archived ? "Voir les fiches actives" : "Voir les archives"}</a></div>${actionError ? `<p class="error">${escapeHtml(actionError)}</p>` : ""}<p class="notice">Seuls les éléments actifs marqués « Prêt » seront proposés comme sujets fiables. Chaque fiche peut être enrichie, corrigée ou archivée sans être supprimée.</p><section class="library-grid">${cards || `<p class="empty">Aucune fiche ${archived ? "archivée" : "active"}.</p>`}</section>${archived ? "" : `<details class="library-add"><summary>+ Ajouter une fiche</summary>${libraryForm("/api/library")}</details>`}`;
  return page(content, "library");
}

function libraryCard(item, archived) {
  return `<article class="library-card">${item.media_url ? `<img class="library-image" src="${escapeHtml(item.media_url)}" alt="">` : ""}<div class="library-body"><div class="library-heading"><div><span class="status">${escapeHtml(item.type)}</span><h3>${escapeHtml(item.title)}</h3></div><span class="readiness ${item.readiness}">${item.readiness === "ready" ? "Prêt" : "À compléter"}</span></div><p>${escapeHtml(item.facts).replace(/\n/g, "<br>")}</p>${item.destination_url ? `<a href="${escapeHtml(item.destination_url)}" target="_blank" rel="noreferrer">Voir la source</a>` : ""}${archived ? `<form method="post" action="/api/library/${item.id}/restore"><button>Restaurer la fiche</button></form>` : `<details class="library-edit"><summary>Modifier et enrichir</summary>${libraryForm(`/api/library/${item.id}/save`, item)}</details><form method="post" action="/api/library/${item.id}/archive"><button class="danger">Archiver</button></form>`}</div></article>`;
}

function libraryForm(action, item = {}) {
  return `<form method="post" action="${action}"><label>Type<select name="type">${libraryTypeOptions(item.type)}</select></label><label>Titre<input name="title" maxlength="100" value="${escapeHtml(item.title || "")}" required></label><label class="wide">Faits vérifiés<textarea name="facts" maxlength="1200" rows="5" required>${escapeHtml(item.facts || "")}</textarea></label><label>Lien source<input name="destination_url" type="url" value="${escapeHtml(item.destination_url || "")}" placeholder="https://…"></label><label>Visuel<input name="media_url" type="url" value="${escapeHtml(item.media_url || "")}" placeholder="https://…"></label><label>État<select name="readiness"><option value="draft" ${item.readiness !== "ready" ? "selected" : ""}>À compléter</option><option value="ready" ${item.readiness === "ready" ? "selected" : ""}>Prêt</option></select></label><button>${item.id ? "Enregistrer les modifications" : "Ajouter à la bibliothèque"}</button></form>`;
}

function libraryTypeOptions(selected) {
  return [["product", "Produit"], ["brand", "Marque"], ["city", "Marseille"], ["event", "Événement"], ["campaign", "Campagne"]].map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${label}</option>`).join("");
}

async function saveLibraryItem(request, env) {
  const form = await request.formData();
  const item = libraryItemInput(form);
  const now = new Date().toISOString();
  await env.DB.prepare("INSERT INTO content_items (id,created_at,updated_at,type,title,facts,media_url,destination_url,readiness) VALUES (?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(), now, now, item.type, item.title, item.facts, item.mediaUrl, item.destinationUrl, item.readiness).run();
  return { ok: true };
}

async function updateLibraryItem(request, env, id) {
  const form = await request.formData();
  const item = libraryItemInput(form);
  const result = await env.DB.prepare("UPDATE content_items SET updated_at=?,type=?,title=?,facts=?,media_url=?,destination_url=?,readiness=? WHERE id=? AND active=1").bind(new Date().toISOString(), item.type, item.title, item.facts, item.mediaUrl, item.destinationUrl, item.readiness, id).run();
  if (!result.meta.changes) throw new Error("Fiche introuvable ou archivée");
  return { ok: true };
}

async function setLibraryItemActive(env, id, active) {
  const nextActive = active ? 1 : 0;
  const result = await env.DB.prepare("UPDATE content_items SET active=?,updated_at=? WHERE id=? AND active!=?").bind(nextActive, new Date().toISOString(), id, nextActive).run();
  if (!result.meta.changes) throw new Error("Fiche introuvable ou déjà mise à jour");
  return { ok: true, active };
}

function libraryItemInput(form) {
  const type = ["product", "brand", "city", "event", "campaign"].includes(form.get("type")) ? form.get("type") : "campaign";
  const title = limitedText(form.get("title"), 100);
  const facts = limitedText(form.get("facts"), 1200);
  const readiness = form.get("readiness") === "ready" ? "ready" : "draft";
  const destinationUrl = limitedText(form.get("destination_url"), 500) || null;
  const mediaUrl = limitedText(form.get("media_url"), 500) || null;
  if (!title || !facts) throw new Error("Le titre et les faits vérifiés sont obligatoires");
  if (destinationUrl && !/^https:\/\//.test(destinationUrl)) throw new Error("Le lien doit utiliser HTTPS");
  if (mediaUrl && !/^https:\/\//.test(mediaUrl)) throw new Error("Le visuel doit utiliser une URL HTTPS");
  return { type, title, facts, readiness, destinationUrl, mediaUrl };
}

function proposalCard(p) {
  const editable = p.status === "pending" || p.status === "failed";
  let label = { pending: "À valider", failed: "Erreur", scheduled: "Programmée", published: "Publiée", rejected: "Refusée" }[p.status] || p.status;
  if (p.variant_group_id) label += ` · Variante ${p.variant_index}`;
  const editFormId = `edit-${p.id}`;
  return `<article class="proposal" data-proposal><div class="visual"><img src="${escapeHtml(p.media_url)}" alt="Visuel ${escapeHtml(p.neighborhood)}">${editable ? `<details><summary>Modifier l'image</summary><form class="image-form" method="post" enctype="multipart/form-data" action="/api/proposals/${p.id}/image"><label>Régénérer avec un prompt<textarea name="visual_prompt" rows="4">${escapeHtml(p.visual_prompt)}</textarea></label><button name="image_action" value="regenerate">Régénérer l'image</button><div class="or">ou</div><label>Choisir une autre image<input type="file" name="image" accept="image/jpeg,image/png,image/webp"></label><button class="secondary" name="image_action" value="upload">Importer l'image</button></form></details>` : ""}</div><div class="editor"><div class="eyebrow"><span class="status status-${escapeHtml(p.status)}">${escapeHtml(label)}</span><span>Objectif : ${escapeHtml(p.objective || "engagement")}</span></div><h2>${escapeHtml(p.neighborhood)}</h2>${p.brief ? `<p class="brief"><strong>Consigne :</strong> ${escapeHtml(p.brief)}</p>` : ""}${p.error ? `<p class="error">${escapeHtml(p.error)}</p>` : ""}${editable ? `<form id="${editFormId}" class="edit-form" method="post" action="/api/proposals/${p.id}/save"><div class="settings"><fieldset><legend>Plateformes</legend>${platformToggle("publish_instagram", "Instagram", p.publish_instagram, "instagram")}${platformToggle("publish_tiktok", "TikTok", p.publish_tiktok, "tiktok")}${platformToggle("publish_x", "X", p.publish_x, "x")}</fieldset><label class="date-label">Date et heure (Paris)<input type="datetime-local" name="proposed_publish_at" value="${escapeHtml(toParisLocalInput(p.proposed_publish_at))}" required></label></div>${textEditor("instagram", "Instagram", p.instagram_text, 2200, 7)}${textEditor("tiktok", "TikTok", p.tiktok_text, 2200, 5)}${textEditor("x", "X", p.x_text, 280, 5)}<div class="previews"><div class="preview-tabs" role="tablist"><button type="button" class="preview-tab active" data-preview-tab="instagram">Instagram</button><button type="button" class="preview-tab" data-preview-tab="tiktok">TikTok</button><button type="button" class="preview-tab" data-preview-tab="x">X</button></div>${networkPreview("instagram", p, true)}${networkPreview("tiktok", p)}${networkPreview("x", p)}</div><div class="sticky-actions"><button>Enregistrer</button><button type="submit" class="approve" data-approve formaction="/api/proposals/${p.id}/approve">${p.status === "failed" ? "Enregistrer et réessayer" : "Valider & programmer"}</button></div></form><form class="reject-form" method="post" action="/api/proposals/${p.id}/reject"><button class="danger">Refuser</button></form>` : `<div class="history-copy"><p><strong>Publication prévue :</strong> ${formatParisDate(p.proposed_publish_at)}</p><p>${escapeHtml(p.instagram_text).replace(/\n/g, "<br>")}</p></div><form method="post" action="/api/proposals/${p.id}/duplicate"><button>Dupliquer et modifier</button></form>`}</div></article>`;
}

function formatEditor(network, selected) {
  const options = network === "instagram" ? [["post", "Publication"], ["carousel", "Carrousel"], ["reel", "Reel"], ["story", "Story"]] : network === "tiktok" ? [["photo", "Photo"], ["video", "Vidéo"]] : [["text", "Texte seul"], ["image", "Image"], ["video", "Vidéo"]];
  const accept = network === "instagram" ? "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" : "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm";
  return `<fieldset class="format-card"><legend>Format ${network === "x" ? "X" : network[0].toUpperCase() + network.slice(1)}</legend><select name="${network}_format" data-format="${network}">${options.map(([value,label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${label}</option>`).join("")}</select><label>Média${network === "instagram" ? " (plusieurs pour un carrousel)" : ""}<input type="file" name="${network}_media" accept="${accept}" ${network === "instagram" ? "multiple" : ""}></label></fieldset>`;
}

function platformToggle(name, label, checked, network) {
  return `<label class="platform"><input type="checkbox" name="${name}" data-network="${network}" ${checked ? "checked" : ""}><span>${label}</span></label>`;
}

function textEditor(network, label, value, limit, rows) {
  return `<label>${label} <small><span data-count="${network}">${String(value).length}</span>/${limit}</small><textarea name="${network === "x" ? "x_text" : `${network}_text`}" data-text="${network}" rows="${rows}" maxlength="${limit}">${escapeHtml(value)}</textarea></label>`;
}

function networkPreview(network, p, active = false) {
  const text = network === "x" ? p.x_text : p[`${network}_text`];
  const advanced = network === "instagram" ? advancedField("Texte alternatif", "instagram_alt_text", p.instagram_alt_text, 500, 3) + advancedField("Idée de carrousel", "instagram_carousel", p.instagram_carousel, 1200, 5) : network === "tiktok" ? advancedField("Script vidéo", "tiktok_script", p.tiktok_script, 1600, 6) + advancedField("Texte à l'écran", "tiktok_overlay", p.tiktok_overlay, 500, 3) : advancedField("Mini-thread X", "x_thread", p.x_thread, 1200, 6);
  const selectedFormat = p[`${network}_format`] || (network === "instagram" ? "post" : network === "tiktok" ? "photo" : "image");
  return `<div class="network-preview ${active ? "active" : ""}" data-preview="${network}">${formatEditor(network, selectedFormat)}<div class="preview-post"><div class="preview-account"><span class="avatar">111</span><strong>sunmedia.111</strong></div><img src="${escapeHtml(p.media_url)}" alt=""><p>${escapeHtml(text).replace(/\n/g, "<br>")}</p></div><details class="platform-kit" open><summary>Kit créatif ${network === "x" ? "X" : network[0].toUpperCase() + network.slice(1)}</summary>${advanced}</details></div>`;
}

function advancedField(label, name, value, max, rows) {
  return `<label>${label}<textarea name="${name}" maxlength="${max}" rows="${rows}">${escapeHtml(value || "")}</textarea></label>`;
}

function generationPanel() {
  return `<details class="generate-panel"><summary>+ Générer des variantes adaptées</summary><form method="post" action="/api/generate"><label>Variantes<select name="variant_count"><option value="1">1 proposition</option><option value="2">2 angles</option><option value="3" selected>3 angles</option></select></label><label>Ton<input name="tone" maxlength="80" placeholder="Complice, brut, premium…"></label><label>Audience<input name="audience" maxlength="120" placeholder="Marseillais de 20 à 35 ans…"></label><label>Appel à l'action<input name="call_to_action" maxlength="160" placeholder="Demander leur quartier, visiter la boutique…"></label><label>Sujet<select name="subject" data-choice="subject"><option value="">Laisser 111 choisir</option><optgroup label="111 et Marseille"><option>La marque 111</option><option>Marseille</option></optgroup><optgroup label="Quartiers">${NEIGHBORHOODS.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</optgroup><option value="__custom__">Autre sujet…</option></select></label><label class="conditional" data-custom="subject">Sujet libre<input name="custom_subject" maxlength="100"></label><label>Objectif<select name="objective" data-choice="objective"><option value="engagement">Créer de l'engagement</option><option value="lancement">Faire un lancement</option><option value="produit">Mettre en avant le produit</option><option value="histoire">Raconter une histoire</option><option value="__custom__">Autre objectif…</option></select></label><label class="conditional" data-custom="objective">Objectif libre<input name="custom_objective" maxlength="120"></label><label class="brief-field">Consignes précises<textarea name="brief" rows="3" maxlength="600" placeholder="Message à faire passer, faits à utiliser, éléments à éviter…"></textarea></label><button>Générer les variantes</button></form></details>`;
}

function statusFilter(value, label, active) {
  return `<a href="${value === "all" ? "/" : `/?status=${value}`}" ${value === active ? "aria-current=page" : ""}>${label}</a>`;
}

function confirmationModal() {
  return `<dialog id="confirmation"><form method="dialog"><button class="modal-close" value="cancel" aria-label="Fermer">×</button><span class="modal-kicker">Dernière vérification</span><h2>Programmer cette publication ?</h2><p id="confirmation-summary"></p><div class="modal-actions"><button class="secondary" value="cancel">Revenir aux modifications</button><button class="approve" id="confirmation-submit" value="confirm">Confirmer la programmation</button></div></form></dialog>`;
}

function formatParisDate(value) {
  return new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

async function login(request, env) {
  const form = await request.formData();
  if (form.get("token") !== env.ADMIN_TOKEN) return loginPage("Mot de passe incorrect", 401);
  return new Response(null, {
    status: 303,
    headers: {
      location: "/",
      "set-cookie": `admin_session=${encodeURIComponent(env.ADMIN_TOKEN)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`,
      "cache-control": "no-store",
    },
  });
}

function loginPage(error = "", status = 200) {
  return new Response(`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Connexion — 111 Social</title><style>${styles()}.login{max-width:440px;margin:12vh auto;background:white;padding:34px;border-radius:28px;box-shadow:0 24px 70px #12202f1f}.login .brand{margin-bottom:28px}.login input{width:100%;padding:14px;margin:10px 0;border:1px solid #12202f26;border-radius:14px}</style><div class="topline">Marseille, quartier par quartier</div><section class="login">${brand()}<p>Tableau de validation privé</p>${error ? `<strong class="error">${escapeHtml(error)}</strong>` : ""}<form method="post" action="/login"><label>Mot de passe<input name="token" type="password" required autocomplete="current-password"></label><button>Se connecter</button></form></section></html>`, { ...htmlHeaders(), status });
}

function styles() {
  return `*{box-sizing:border-box}body{margin:0;background:#f5f2eb;color:#12202f;font:16px Inter,"Avenir Next","Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}.topline{background:#12202f;color:#fff;text-align:center;padding:9px 16px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.2em}main{max-width:1180px;margin:auto;padding:28px}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.brand{display:flex;align-items:center;gap:13px}.brand svg{width:54px;height:54px}.brand strong{display:block;font:900 1.65rem/1 "Arial Black","Helvetica Neue",Arial,sans-serif;text-transform:uppercase;letter-spacing:-.04em}.brand small{display:block;margin-top:5px;color:#007da8;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.2em}h2{font:900 2rem/1 "Arial Black","Helvetica Neue",Arial,sans-serif;text-transform:uppercase;letter-spacing:-.04em;margin:.55rem 0 1.3rem}.generate-panel{margin:0 0 18px;background:#12202f;color:#fff;padding:18px 22px}.generate-panel summary{font:900 1.1rem "Arial Black",Arial,sans-serif;text-transform:uppercase}.generate-panel form{display:grid;grid-template-columns:1fr 1fr auto;gap:14px;align-items:end;margin-top:16px}.generate-panel label{font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em}.generate-panel button{background:#ffd43b;color:#12202f;margin:0}.filters{display:flex;gap:8px;overflow:auto;padding:4px 0 10px}.filters a{white-space:nowrap;text-decoration:none;color:#12202f;padding:9px 14px;border-radius:999px;font-weight:700}.filters a[aria-current=page]{background:#007da8;color:white}.notice,.empty{padding:16px;background:#fff;border-radius:16px}.proposal{display:grid;grid-template-columns:minmax(280px,420px) 1fr;gap:32px;background:white;margin:24px 0;padding:20px;border-radius:28px;box-shadow:0 24px 70px #12202f1f}.visual>img{display:block;width:100%;aspect-ratio:1;object-fit:cover;border-radius:24px}.editor label:not(.platform),.image-form label{display:block;font-weight:800;margin:18px 0 6px}.editor small{float:right;color:#12202f73;font-weight:600}textarea,input[type=file],input[type=datetime-local],select{display:block;width:100%;margin-top:7px;padding:13px;border:1px solid #12202f26;border-radius:14px;background:#fff;font:inherit;font-weight:400;color:#12202f;resize:vertical}textarea:focus,input:focus,select:focus{outline:3px solid #007da829;border-color:#007da8}.settings{display:grid;grid-template-columns:1fr minmax(220px,.65fr);gap:18px;align-items:start}.date-label{margin-top:0!important}fieldset{border:0;padding:0;margin:0 0 18px}legend{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.2em;margin-bottom:10px;color:#007da8}.platform{display:inline-flex;align-items:center;gap:8px;margin:0 8px 8px 0;padding:10px 14px;background:#eef8fc;border:1px solid transparent;border-radius:999px;cursor:pointer;font-weight:700}.platform:has(input:checked){border-color:#007da8;background:#dff4fc}.platform input{accent-color:#007da8}.eyebrow{display:flex;justify-content:space-between;gap:12px;color:#12202f73}.status{text-transform:uppercase;font-size:.7rem;font-weight:800;letter-spacing:.18em;color:#007da8}.status-failed{color:#b13229}.status-published{color:#39875a}button,summary{cursor:pointer}button{background:#007da8;color:white;border:0;border-radius:999px;padding:13px 19px;margin-top:10px;font-weight:800;transition:.2s}button:hover{background:#12202f}.secondary{background:#f5f2eb;color:#12202f}.approve{background:#39875a}.approve:hover{background:#2f724c}.danger{background:#ff5c521a;color:#b13229}.reject-form{margin-top:4px}.sticky-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px;padding-top:18px;border-top:1px solid #12202f1a}details{margin-top:14px;background:#f5f2eb;border-radius:20px;padding:14px 16px}summary{font-weight:800}.or{text-align:center;color:#12202f73;margin-top:14px}.error{display:block;background:#ff5c521a;color:#8c261b;padding:12px;border-radius:14px}.previews{margin-top:22px;padding:14px;background:#f5f2eb;border-radius:20px}.preview-tabs{display:flex;gap:4px}.preview-tab{margin:0;padding:8px 12px;background:transparent;color:#12202f}.preview-tab.active{background:#12202f;color:#fff}.network-preview{display:none;margin-top:14px;background:white;border-radius:16px;padding:14px;overflow:hidden}.network-preview.active{display:block}.network-preview>img{width:150px;aspect-ratio:1;object-fit:cover;border-radius:10px;float:left;margin:0 14px 8px 0}.network-preview p{white-space:normal;overflow-wrap:anywhere;margin:.6rem 0;line-height:1.35}.preview-account{display:flex;align-items:center;gap:8px;margin-bottom:10px}.avatar{display:grid;place-items:center;width:30px;height:30px;background:#007da8;color:white;border-radius:50%;font-size:.65rem;font-weight:900}.history-copy{line-height:1.5}dialog{width:min(520px,calc(100% - 32px));border:0;border-radius:28px;padding:28px;color:#12202f;box-shadow:0 30px 100px #12202f55}dialog::backdrop{background:#12202fb3;backdrop-filter:blur(4px)}.modal-close{position:absolute;right:17px;top:10px;background:transparent;color:#12202f;font-size:1.5rem}.modal-kicker{color:#007da8;text-transform:uppercase;font-size:.7rem;font-weight:900;letter-spacing:.18em}.modal-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}.modal-actions button{margin-top:8px}@media(max-width:760px){main{padding:18px 14px 100px}.proposal{grid-template-columns:1fr;padding:15px;gap:20px}header{margin-bottom:20px}.brand svg{width:46px;height:46px}.brand strong{font-size:1.35rem}header .brand small{display:none}.generate-panel form,.settings{grid-template-columns:1fr}.generate-panel{padding:16px}.sticky-actions{position:sticky;bottom:10px;z-index:3;background:#fff;padding:10px;margin:20px -5px 0;border-radius:999px;box-shadow:0 12px 35px #12202f33}.sticky-actions button{flex:1;margin:0;padding:12px 10px}.network-preview>img{width:100%;float:none;margin:0 0 12px}.eyebrow{font-size:.85rem}}`;
}

function flexibleGenerationStyles() {
  return `.proposal{grid-template-columns:minmax(260px,360px) minmax(0,1fr)}.editor,.edit-form,.settings,.previews,.network-preview{min-width:0;max-width:100%}.editor textarea,.editor input,.editor select{max-width:100%}.eyebrow>*{min-width:0;overflow-wrap:anywhere}.preview-post{min-width:0;overflow:hidden}.preview-post>img{width:140px;max-width:28%;aspect-ratio:1;object-fit:cover;border-radius:10px;float:left;margin:0 14px 8px 0}.preview-post:after{content:"";display:block;clear:both}.platform-kit textarea{width:100%}.generate-panel form{grid-template-columns:repeat(2,minmax(0,1fr))}.generate-panel .conditional{display:none}.generate-panel .conditional.visible{display:block}.generate-panel .brief-field{grid-column:1/-1}.generate-panel form>button{justify-self:start}.brief{background:#eef8fc;padding:11px 13px;border-radius:14px;line-height:1.4}@media(max-width:760px){.proposal,.generate-panel form{grid-template-columns:1fr}.preview-post>img{width:110px;max-width:35%}}` + insightsStyles();
}

function insightsStyles() {
  return `.metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.metric-grid article,.recommendation,.ranking,.channel-capabilities,.empty-inbox{background:#fff;border-radius:20px;padding:18px}.metric-grid span{display:block;color:#12202f99;font-weight:700}.metric-grid strong{display:block;margin-top:8px;font:900 2rem "Arial Black",Arial,sans-serif}.recommendation{margin-top:14px;background:#ffd43b}.recommendation h3{margin:8px 0}.ranking{margin-top:14px}.ranking article{display:flex;justify-content:space-between;gap:15px;padding:13px 0;border-top:1px solid #12202f1a}.channel-capabilities{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.channel-capabilities article{display:flex;align-items:center;gap:10px;background:#f5f2eb;padding:12px;border-radius:14px}.channel-capabilities small{display:block;margin-top:4px;color:#12202f99}.empty-inbox{margin-top:14px;text-align:center;padding:40px}.empty-inbox p{color:#12202f99}@media(max-width:760px){.metric-grid{grid-template-columns:1fr 1fr}.channel-capabilities{grid-template-columns:1fr}.ranking article{flex-direction:column}}`;
}

function v2Styles() {
  return `.main-nav{display:flex;gap:6px;background:#fff;padding:5px;border-radius:999px}.main-nav a{padding:10px 14px;border-radius:999px;color:#12202f;text-decoration:none;font-weight:800}.main-nav a.active{background:#12202f;color:#fff}.page-heading{display:flex;align-items:center;justify-content:space-between;margin:28px 0 18px}.page-heading h2{margin:6px 0}.button-link{background:#007da8;color:#fff;padding:12px 16px;border-radius:999px;text-decoration:none;font-weight:800}.calendar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;align-items:start}.calendar-day{background:#fff;border-radius:20px;padding:16px}.calendar-day h3{text-transform:capitalize;margin:0 0 13px}.calendar-item{display:grid;grid-template-columns:auto 48px 1fr;gap:9px;align-items:center;padding:10px 0;border-top:1px solid #12202f14;color:#12202f;text-decoration:none}.calendar-item>img{width:48px;height:48px;object-fit:cover;border-radius:9px}.calendar-item time{font-size:.75rem;font-weight:800;color:#007da8}.calendar-item small{display:block;margin-top:4px;color:#12202f88}.library-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.library-card{display:flex;justify-content:space-between;gap:15px;background:#fff;padding:19px;border-radius:20px}.library-card h3{margin:7px 0}.library-card p{line-height:1.45;color:#12202fc2}.readiness{height:max-content;padding:7px 10px;border-radius:999px;font-size:.72rem;font-weight:900;white-space:nowrap}.readiness.ready{background:#39875a1c;color:#2f724c}.readiness.draft{background:#ffd43b40}.library-add{margin-top:18px}.library-add form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.library-add .wide{grid-column:1/-1}@media(max-width:850px){.calendar{grid-template-columns:1fr 1fr}}@media(max-width:650px){header{align-items:flex-start;gap:15px;flex-direction:column}.main-nav{width:100%;overflow:auto}.calendar,.library-grid,.library-add form{grid-template-columns:1fr}.library-add .wide{grid-column:auto}}`;
}

function libraryStyles() {
  return `.secondary-link{background:#fff;color:#12202f}.library-card{display:block;overflow:hidden}.library-image{display:block;width:calc(100% + 38px);height:180px;object-fit:cover;margin:-19px -19px 18px}.library-body{min-width:0}.library-heading{display:flex;justify-content:space-between;gap:15px}.library-edit{margin-top:18px}.library-edit form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.library-edit .wide{grid-column:1/-1}.library-edit button{justify-self:start}.library-add input,.library-edit input{display:block;width:100%;margin-top:7px;padding:13px;border:1px solid #12202f26;border-radius:14px;background:#fff;font:inherit;font-weight:400;color:#12202f}@media(max-width:650px){.page-heading{align-items:flex-start;flex-direction:column}.library-edit form{grid-template-columns:1fr}.library-edit .wide{grid-column:auto}}`;
}

function formatStyles() {
  return `.format-card{background:#eef8fc;border-radius:14px;padding:14px;margin:0 0 14px}.format-card label{margin-top:10px!important}.format-card input[type=file]{background:#fff}`;
}

function mediaFormScripts() {
  return `document.querySelectorAll('.edit-form').forEach(form=>form.enctype='multipart/form-data');`;
}

function scripts() {
  return `document.querySelectorAll('[data-proposal]').forEach(card=>{const form=card.querySelector('.edit-form');if(!form)return;form.querySelectorAll('[data-text]').forEach(area=>{const network=area.dataset.text;const count=form.querySelector('[data-count="'+network+'"]');const preview=form.querySelector('[data-preview="'+network+'"] p');area.addEventListener('input',()=>{count.textContent=area.value.length;preview.textContent=area.value})});form.querySelectorAll('[data-preview-tab]').forEach(tab=>tab.addEventListener('click',()=>{form.querySelectorAll('[data-preview-tab]').forEach(x=>x.classList.toggle('active',x===tab));form.querySelectorAll('[data-preview]').forEach(x=>x.classList.toggle('active',x.dataset.preview===tab.dataset.previewTab))}));form.querySelectorAll('[data-network]').forEach(box=>box.addEventListener('change',()=>{const tab=form.querySelector('[data-preview-tab="'+box.dataset.network+'"]');tab.hidden=!box.checked}));});const modal=document.querySelector('#confirmation');const confirmButton=document.querySelector('#confirmation-submit');let pendingForm=null;document.querySelectorAll('[data-approve]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();pendingForm=button.form;const networks=[...pendingForm.querySelectorAll('[data-network]:checked')].map(x=>x.parentElement.innerText.trim());const date=pendingForm.proposed_publish_at.value;document.querySelector('#confirmation-summary').textContent='Réseaux : '+networks.join(', ')+' · Publication : '+new Intl.DateTimeFormat('fr-FR',{dateStyle:'long',timeStyle:'short'}).format(new Date(date));modal.showModal()}));confirmButton.addEventListener('click',event=>{event.preventDefault();if(!pendingForm)return;modal.close();const approve=pendingForm.querySelector('[data-approve]');pendingForm.action=approve.formAction;pendingForm.submit()});`;
}

function generationScripts() {
  return `document.querySelectorAll('[data-choice]').forEach(select=>{const custom=document.querySelector('[data-custom="'+select.dataset.choice+'"]');const update=()=>{custom.classList.toggle('visible',select.value==='__custom__');const input=custom.querySelector('input');input.required=select.value==='__custom__';if(select.value!=='__custom__')input.value=''};select.addEventListener('change',update);update()});if(document.querySelector('[data-generation-pending]'))setTimeout(()=>location.reload(),5000);`;
}

function brand() {
  return `<div class="brand"><svg viewBox="0 0 192 192" role="img" aria-label="111"><path fill="#0092cd" d="M104 0C86 1 65 5 50 12 33 20 20 33 12 47 4 62 1 74 1 83c1 11 1 22 2 33 1 17 6 30 14 37 7 8 11 14 19 21 11 9 26 12 42 15 18 4 38 2 52-1 14-3 28-10 37-23 11-12 17-24 21-39 3-14 2-31 2-48 0-14-3-25-9-38-6-13-16-22-30-29-12-6-28-10-34-11Z"/><path fill="#fff" d="m37 83 25-41h7l-2 108-18-4 1-52-13-11Zm43 0 25-41h7l-2 108-18-4 1-52-13-11Zm44 0 24-41h7l-2 108-18-4 1-52-12-11Z"/></svg><span><strong>111 Social</strong><small>Quartier par quartier</small></span></div>`;
}

function favicon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><path fill="#ffd43b" d="M104 0C86 1 65 5 50 12 33 20 20 33 12 47 4 62 1 74 1 83c1 11 1 22 2 33 1 17 6 30 14 37 7 8 11 14 19 21 11 9 26 12 42 15 18 4 38 2 52-1 14-3 28-10 37-23 11-12 17-24 21-39 3-14 2-31 2-48 0-14-3-25-9-38-6-13-16-22-30-29-12-6-28-10-34-11Z"/><path fill="#fff" d="m37 83 25-41h7l-2 108-18-4 1-52-13-11Zm43 0 25-41h7l-2 108-18-4 1-52-13-11Zm44 0 24-41h7l-2 108-18-4 1-52-12-11Z"/></svg>`;
  return new Response(svg, { headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "no-cache" } });
}

function actionResponse(request, result, location = "/") {
  const isForm = request.headers.get("content-type")?.includes("form");
  return isForm ? new Response(null, { status: 303, headers: { location } }) : json(result);
}

function htmlHeaders() {
  return { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-frame-options": "DENY", "referrer-policy": "no-referrer", link: "</favicon.svg?v=yellow-white>; rel=icon; type=image/svg+xml" } };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function json(value, status = 200) {
  return Response.json(value, { status, headers: { "cache-control": "no-store" } });
}

async function serveMedia(env, key) {
  const object = await env.MEDIA.get(key);
  if (!object) return new Response("Introuvable", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
