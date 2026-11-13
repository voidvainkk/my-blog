/* POST /api/login  { password }  -> 设置登录 cookie */
import { json, readJson, checkPassword, signSession, sessionCookie } from "./_utils.js";

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await readJson(request, 8 * 1024);
  } catch (e) {
    return json({ error: "请求格式错误" }, 400);
  }
  const ok = await checkPassword(env, body.password);
  if (!ok) {
    return json({ error: "密码错误" }, 401);
  }
  const token = await signSession(env);
  return json(
    { ok: true },
    200,
    { "Set-Cookie": sessionCookie(token, 60 * 60 * 24 * 7) }
  );
}

export async function onRequest({ request }) {
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);
}
