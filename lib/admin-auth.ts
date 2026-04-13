import crypto from "crypto";

const ADMIN_COOKIE = "admin_session";

function getSecret() {
  return process.env.ADMIN_SECRET || "change_me_admin_secret";
}

export function createAdminSessionValue() {
  const login = process.env.ADMIN_LOGIN || "";
  const payload = `${login}|admin`;
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  return `${payload}|${signature}`;
}

export function verifyAdminSessionValue(value?: string | null) {
  if (!value) return false;

  const parts = value.split("|");
  if (parts.length !== 3) return false;

  const [login, role, signature] = parts;
  if (!login || role !== "admin") return false;
  if (login !== (process.env.ADMIN_LOGIN || "")) return false;

  const payload = `${login}|${role}`;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  );
}

export function getAdminCookieName() {
  return ADMIN_COOKIE;
}