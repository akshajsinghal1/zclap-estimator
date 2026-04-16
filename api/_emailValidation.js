const fs = require("fs");
const path = require("path");

let cachedDomains = null;
const DEFAULT_BLOCKED_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "icloud.com",
  "aol.com",
];

function getBlocklistPath() {
  const projectRoot = path.join(__dirname, "..");
  const candidates = [
    path.join(projectRoot, "email-domain-blocklist (1).txt"),
    path.join(projectRoot, "email-domain-blocklist.txt"),
    path.join(process.cwd(), "email-domain-blocklist (1).txt"),
    path.join(process.cwd(), "email-domain-blocklist.txt"),
    path.join(process.cwd(), "..", "email-domain-blocklist (1).txt"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function loadBlockedDomainSet() {
  if (cachedDomains) return cachedDomains;
  const filePath = getBlocklistPath();
  const set = new Set();
  if (!filePath) {
    for (const domain of DEFAULT_BLOCKED_DOMAINS) set.add(domain);
    cachedDomains = set;
    return set;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    if (!trimmed || trimmed.startsWith("#")) continue;
    set.add(trimmed);
  }
  cachedDomains = set;
  return set;
}

function parseDomain(email) {
  const normalized = String(email || "").trim().toLowerCase();
  const parts = normalized.split("@");
  if (parts.length !== 2) return "";
  return parts[1].trim();
}

function validateEmailAddress(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) {
    return { ok: false, code: "missing_email", message: "Email is required.", domain: "" };
  }

  const isFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  if (!isFormatValid) {
    return { ok: false, code: "invalid_format", message: "Please enter a valid work email address.", domain: "" };
  }

  const domain = parseDomain(normalized);
  const blockedDomains = loadBlockedDomainSet();
  if (blockedDomains.has(domain)) {
    return {
      ok: false,
      code: "blocked_domain",
      message: "Please use your company email address.",
      domain,
    };
  }

  return { ok: true, code: "ok", message: "Email looks good.", domain };
}

module.exports = {
  validateEmailAddress,
  loadBlockedDomainSet,
};
