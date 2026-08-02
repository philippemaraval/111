export const CONTACT_EMAIL = "111wear.sunmedia@gmail.com";

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
  { label: "Facebook", href: "https://www.facebook.com/111marseille" },
  { label: "TikTok", href: "https://www.tiktok.com/@111marseille" }
];
