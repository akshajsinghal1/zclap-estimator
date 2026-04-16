const { getSupabaseAdminClient } = require("./_supabase");
const { validateEmailAddress } = require("./_emailValidation");
const {
  verifyTurnstileToken,
  shouldBypassCaptchaForHost,
  getTurnstileSecret,
} = require("./_captcha");

function buildEstimateText(outputs) {
  if (!outputs || typeof outputs !== "object") {
    return "Estimate captured and pending internal review.";
  }

  const low = outputs.lowFmt || outputs.low || "n/a";
  const high = outputs.highFmt || outputs.high || "n/a";
  const totalWks = outputs.totalWks || "n/a";
  const risk = outputs.risk || "unknown";
  return `${low} - ${high} | ${totalWks} weeks | ${risk} complexity`;
}

function normalizeSource(req, body) {
  const source = (body && body.source) || {};
  return {
    utm_source: source.utm_source || body.utm_source || null,
    utm_medium: source.utm_medium || body.utm_medium || null,
    utm_campaign: source.utm_campaign || body.utm_campaign || null,
    landing_path: source.landing_path || body.landing_path || null,
    referrer: req.headers.referer || req.headers.referrer || null,
    user_agent: req.headers["user-agent"] || null,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const data = req.body || {};
  if (!data.email || !data.firstName || !data.company) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const emailValidation = validateEmailAddress(data.email);
  if (!emailValidation.ok) {
    res.status(400).json({ error: emailValidation.message, code: emailValidation.code });
    return;
  }
  const host = req.headers.host || "";
  const captchaConfigured = !!getTurnstileSecret();
  if (!shouldBypassCaptchaForHost(host) && captchaConfigured) {
    const remoteIp = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
    const captcha = await verifyTurnstileToken(data.captchaToken, remoteIp);
    if (!captcha.ok) {
      res.status(400).json({ error: captcha.message, code: captcha.code });
      return;
    }
  }

  try {
    const supabase = getSupabaseAdminClient();
    const insertPayload = {
      status: "pending",
      estimator_type: data.estimatorType || "implementation",
      first_name: data.firstName || "",
      last_name: data.lastName || "",
      email: data.email,
      company: data.company || "",
      role: data.role || "",
      source: normalizeSource(req, data),
      inputs: data.inputs || {},
      outputs: data.outputs || {},
      estimate_text: buildEstimateText(data.outputs),
    };

    const { data: inserted, error } = await supabase
      .from("estimator_requests")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      res.status(500).json({ error: "Failed to create request" });
      return;
    }

    res.status(200).json({
      ok: true,
      status: "pending",
      requestId: inserted.id,
      message: "Request submitted for internal review.",
    });
  } catch (err) {
    console.error("Submit API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
