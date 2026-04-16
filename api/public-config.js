const { getTurnstileSecret, shouldBypassCaptchaForHost } = require("./_captcha");
const { loadLocalEnvFallback } = require("./_env");

function getTurnstileSiteKey() {
  loadLocalEnvFallback();
  return (
    process.env.CLOUDFLARE_TURNSTILE_SITE_KEY ||
    process.env.TURNSTILE_SITE_KEY ||
    ""
  ).trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const siteKey = getTurnstileSiteKey();
  const hasSecret = !!getTurnstileSecret();
  const host = req.headers.host || "";
  const bypassForHost = shouldBypassCaptchaForHost(host);
  const configured = !!siteKey && hasSecret && !bypassForHost;
  const devOptional = !!siteKey && !hasSecret && process.env.NODE_ENV !== "production";

  res.status(200).json({
    turnstileSiteKey: configured ? siteKey : "",
    captchaRequired: configured,
    captchaMode: configured ? "required" : bypassForHost ? "disabled_localhost" : devOptional ? "optional_dev" : "disabled",
  });
};
