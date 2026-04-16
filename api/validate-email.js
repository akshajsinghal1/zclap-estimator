const { validateEmailAddress } = require("./_emailValidation");

function getEmailFromRequest(req) {
  if (req.method === "GET") {
    if (req.query && typeof req.query.email === "string") return req.query.email;
    try {
      const url = new URL(req.url, "http://localhost");
      return url.searchParams.get("email") || "";
    } catch (err) {
      return "";
    }
  }
  return (req.body && req.body.email) || "";
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const email = getEmailFromRequest(req);
  const result = validateEmailAddress(email);
  res.status(200).json(result);
};
