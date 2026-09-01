import Script from "next/script";

export function CloudflareAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN
    ?? "f58e3cf01387484dbf664ba031d479bc";

  if (!token) return null;

  return (
    <Script
      type="module"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
