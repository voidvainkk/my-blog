/* POST /api/logout  -> 清除登录 cookie */
import { json, clearCookie } from "./_utils.js";

export async function onRequestPost() {
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
}

export async function onRequest({ request }) {
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);
}
