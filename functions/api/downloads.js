/* ============================================================
   /api/downloads
   GET               -> 全部下载
   POST （需登录）    -> 新建或更新（按 id）
   DELETE ?id= （需登录） -> 删除
   ============================================================ */
import { json, readJson, requireAuth } from "./_utils.js";

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM downloads ORDER BY created_at DESC"
  ).all();
  return json({ downloads: results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未登录" }, 401);
  let b;
  try {
    b = await readJson(request, 512 * 1024);
  } catch (e) {
    return json({ error: "请求过大或格式错误" }, 400);
  }
  const name = (b.name || "").trim();
  if (!name) return json({ error: "文件名必填" }, 400);
  const id = (b.id || "").trim() || ("d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
  await env.DB.prepare(
    `INSERT INTO downloads (id, name, size, description, href, date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, size=excluded.size, description=excluded.description,
       href=excluded.href, date=excluded.date`
  )
    .bind(id, name, Number(b.size) || 0, b.description || "", b.href || "#", b.date || "", Date.now())
    .run();
  return json({ ok: true, id });
}

export async function onRequestDelete({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未登录" }, 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "缺少 id" }, 400);
  await env.DB.prepare("DELETE FROM downloads WHERE id = ?").bind(id).run();
  return json({ ok: true });
}
