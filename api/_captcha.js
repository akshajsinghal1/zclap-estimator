const { loadLocalEnvFallback } = require("./_env");

function getTurnstileSecret() {
  loadLocalEnvFallback();
  return (
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
    process.env.TURNSTILE_SECRET_KEY ||
    ""
  ).trim();
}

function shouldBypassCaptchaForHost(host) {
  const enforceLocal = String(process.env.CAPTCHA_ENFORCE_LOCALHOST || "").toLowerCase() === "true";
  if (enforceLocal) return false;
  const value = String(host || "").toLowerCase();
  return (
    value.includes("localhost") ||
    value.includes("127.0.0.1") ||
    value.includes("[::1]")
  );
}

async function verifyTurnstileToken(token, remoteIp) {
  const secret = getTurnstileSecret();
  if (!secret) {
    const allowWithoutSecret = process.env.NODE_ENV !== "production";
    return {
      ok: allowWithoutSecret,
      code: allowWithoutSecret ? "captcha_not_configured_dev" : "captcha_not_configured",
      message: allowWithoutSecret
        ? "CAPTCHA skipped in development because secret key is not configured."
        : "CAPTCHA is not configured on the server.",
    };
  }

  if (!token) {
    return {
      ok: false,
      code: "captcha_missing",
      message: "Please complete CAPTCHA verification.",
    };
  }

  try {
    const payload = new URLSearchParams({
      secret,
      response: String(token),
    });
    if (remoteIp) payload.set("remoteip", String(remoteIp));

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload,
    });

    const result = await response.json();
    if (result && result.success) {
      return { ok: true, code: "ok", message: "CAPTCHA verified." };
    }

    const errorCodes = Array.isArray(result["error-codes"]) ? result["error-codes"].join(",") : "";
    return {
      ok: false,
      code: "captcha_invalid",
      message: errorCodes
        ? `CAPTCHA verification failed (${errorCodes}).`
        : "CAPTCHA verification failed.",
    };
  } catch (err) {
    return {
      ok: false,
      code: "captcha_error",
      message: "Unable to verify CAPTCHA right now. Please try again.",
    };
  }
}

module.exports = {
  verifyTurnstileToken,
  getTurnstileSecret,
  shouldBypassCaptchaForHost,
};
