/* ============================================================
   /api/footprints  （留言板，公开：谁都能留言）
   GET              -> 全部留言（按时间倒序）
   POST （公开）     -> 新增留言（有长度/频率上的基本限制）
   DELETE ?id= （需登录） -> 删除留言
   ============================================================ */
import { json, readJson, requireAuth } from "./_utils.js";

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, name, text, color, avatar, created_at FROM footprints ORDER BY created_at DESC"
  ).all();
  return json({ footprints: results || [] });
}

export async function onRequestPost({ request, env }) {
  let b;
  try {
    b = await readJson(request, 256 * 1024);
  } catch (e) {
    return json({ error: "请求过大或格式错误" }, 400);
  }
  const name = (b.name || "").trim();
  const text = (b.text || "").trim();
  if (!name) return json({ error: "昵称必填" }, 400);
  if (!text) return json({ error: "留言内容必填" }, 400);
  if (name.length > 40) return json({ error: "昵称太长" }, 400);
  if (text.length > 1000) return json({ error: "留言太长（1000 字以内）" }, 400);
  const color = /^#[0-9a-fA-F]{6}$/.test(b.color || "") ? b.color : "#58a6ff";
  let avatar = b.avatar || null;
  // 头像是 base64 data URL 才接受，且限制在 ~80KB 内
  if (avatar && !(typeof avatar === "string" && avatar.indexOf("data:image/") === 0 && avatar.length < 110000)) {
    avatar = null;
  }
  const id = "f" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await env.DB.prepare(
    "INSERT INTO footprints (id, name, text, color, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(id, name, text, color, avatar, Date.now())
    .run();
  return json({ ok: true, id });
}

export async function onRequestDelete({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未登录" }, 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "缺少 id" }, 400);
  await env.DB.prepare("DELETE FROM footprints WHERE id = ?").bind(id).run();
  return json({ ok: true });
}
