/* ============================================================
   /api/site
   GET              -> { about, friends }
   POST （需登录）   -> 保存 about / friends（分别可选）
   site_config 表按 key 存 JSON 字符串：
     key="about"   -> { html: "..." }
     key="friends" -> [ { name, url, desc } ]
   ============================================================ */
import { json, readJson, requireAuth } from "./_utils.js";

async function getVal(env, key, fallback) {
  const row = await env.DB.prepare("SELECT value FROM site_config WHERE key = ?").bind(key).first();
  if (!row) return fallback;
  try {
    return JSON.parse(row.value);
  } catch (e) {
    return fallback;
  }
}

export async function onRequestGet({ env }) {
  const about = await getVal(env, "about", { html: "" });
  const friends = await getVal(env, "friends", []);
  return json({ about, friends });
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未登录" }, 401);
  let b;
  try {
    b = await readJson(request, 256 * 1024);
  } catch (e) {
    return json({ error: "请求过大或格式错误" }, 400);
  }
  if (b.about !== undefined) {
    await env.DB.prepare(
      "INSERT INTO site_config (key, value) VALUES ('about', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
    )
      .bind(JSON.stringify(b.about || { html: "" }))
      .run();
  }
  if (b.friends !== undefined) {
    const list = Array.isArray(b.friends) ? b.friends : [];
    await env.DB.prepare(
      "INSERT INTO site_config (key, value) VALUES ('friends', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
    )
      .bind(JSON.stringify(list))
      .run();
  }
  return json({ ok: true });
}
