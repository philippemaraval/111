export const CONTACT_EMAIL = "111wear.sunmedia@gmail.com";

export const LEGAL_INFORMATION = {
  tradeName: "111",
  ownerName: "Philippe Maraval",
  legalForm: "Entrepreneur individuel — micro-entrepreneur",
  address: "106 rue de la République, 13002 Marseille, France",
  phoneDisplay: "+33 7 67 65 27 45",
  phoneHref: "+33767652745",
  siren: "901 896 126",
  siret: "901 896 126 00033",
  registration: "RNE et RCS de Marseille",
  vatNotice: "TVA non applicable, article 293 B du Code général des impôts"
} as const;

export const HOST_INFORMATION = {
  name: "Cloudflare, Inc.",
  address: "101 Townsend Street, San Francisco, CA 94107, États-Unis",
  phoneDisplay: "+1 650 319 8930",
  phoneHref: "+16503198930",
  website: "https://www.cloudflare.com"
} as const;

type SocialLink = {
  label: string;
  handle?: string;
  href: string;
};

export const socialLinks: readonly SocialLink[] = [
  {
    label: "Instagram",
    handle: "sunmedia.111",
    href: "https://www.instagram.com/sunmedia.111?igsh=emFvZXNxd3F5Y3No&utm_source=qr"
  },
  {
    label: "X",
    handle: "@SunMedia111",
    href: "https://x.com/sunmedia111?s=11"
  },
  { label: "Vinted", handle: "111wear", href: "https://www.vinted.fr/member/3181567325-111wear" },
  { label: "TikTok", href: "https://www.tiktok.com/@111marseille" }
];
