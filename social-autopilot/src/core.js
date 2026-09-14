export const REQUIRED_SERVICES = ["instagram", "tiktok", "twitter"];

export function gqlString(value) {
  return JSON.stringify(String(value));
}

export function bufferPostMetadata(service, text, format = "post") {
  if (service === "instagram") return `metadata: { instagram: { type: ${format}, shouldShareToFeed: true } }`;
  if (service === "tiktok") return format === "video" ? "metadata: { tiktok: { isAiGenerated: false } }" : `metadata: { tiktok: { title: ${gqlString(String(text).slice(0, 90))} } }`;
  return "";
}

export function parseJsonObject(value) {
  const text = String(value).trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Réponse IA sans objet JSON");
  return JSON.parse(text.slice(start, end + 1));
}

export function modelText(result) {
  const response = result?.response || result?.choices?.[0]?.message?.content || "";
  return typeof response === "object" && response !== null ? JSON.stringify(response) : response;
}

export function selectChannels(channels) {
  const selected = {};
  for (const channel of channels) {
    if (REQUIRED_SERVICES.includes(channel.service) && !selected[channel.service]) {
      selected[channel.service] = channel;
    }
  }
  const missing = REQUIRED_SERVICES.filter((service) => !selected[service]);
  if (missing.length) throw new Error(`Canaux Buffer manquants : ${missing.join(", ")}`);
  return selected;
}

export function nextEditorialDate(now = new Date()) {
  const local = dateParts(now, "Europe/Paris");
  const day = new Date(Date.UTC(local.year, local.month - 1, local.day + 1));
  while (![2, 4, 6].includes(day.getUTCDay())) day.setUTCDate(day.getUTCDate() + 1);
  return localTimeToUtc({
    year: day.getUTCFullYear(),
    month: day.getUTCMonth() + 1,
    day: day.getUTCDate(),
    hour: 19,
    minute: 15,
  }, "Europe/Paris").toISOString();
}

export function parisLocalToUtc(value) {
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) throw new Error("Date de publication invalide");
  const [, year, month, day, hour, minute] = match.map(Number);
  const result = localTimeToUtc({ year, month, day, hour, minute }, "Europe/Paris");
  if (!Number.isFinite(result.getTime())) throw new Error("Date de publication invalide");
  return result.toISOString();
}

export function toParisLocalInput(value) {
  const parts = dateParts(new Date(value), "Europe/Paris");
  const pad = (number) => String(number).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

function localTimeToUtc(parts, timeZone) {
  const guess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  const represented = dateParts(new Date(guess), timeZone);
  const representedAsUtc = Date.UTC(represented.year, represented.month - 1, represented.day, represented.hour, represented.minute);
  return new Date(guess - (representedAsUtc - guess));
}

function dateParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return Object.fromEntries(formatter.formatToParts(date)
    .filter((part) => part.type !== "literal")
    .map((part) => [part.type, Number(part.value)]));
}

export function assertAdmin(request, env) {
  if (!env.ADMIN_TOKEN) throw new Error("ADMIN_TOKEN absent");
  const url = new URL(request.url);
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const cookie = request.headers.get("cookie")?.split(";")
    .map((part) => part.trim().split("="))
    .find(([name]) => name === "admin_session")?.[1];
  const token = bearer || cookie || url.searchParams.get("token");
  if (token !== env.ADMIN_TOKEN) return new Response("Non autorisé", { status: 401 });
  return null;
}
