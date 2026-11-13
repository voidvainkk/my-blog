/* ============================================================
   /api/posts
   GET             -> 全部文章（按日期倒序）
   GET ?slug=xxx   -> 单篇文章
   POST （需登录）  -> 新建或更新（按 slug）
   DELETE ?slug=  （需登录） -> 删除
   ============================================================ */
import { json, readJson, requireAuth } from "./_utils.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (slug) {
    const row = await env.DB.prepare("SELECT * FROM posts WHERE slug = ?").bind(slug).first();
    return json({ post: row || null });
  }
  const { results } = await env.DB.prepare(
    "SELECT * FROM posts ORDER BY date DESC, created_at DESC"
  ).all();
  return json({ posts: results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未登录" }, 401);
  let b;
  try {
    b = await readJson(request, 2 * 1024 * 1024);
  } catch (e) {
    return json({ error: "请求过大或格式错误" }, 400);
  }
  const slug = (b.slug || "").trim();
  const title = (b.title || "").trim();
  if (!slug || !title) return json({ error: "slug 和标题必填" }, 400);
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO posts (slug, title, description, uploader, date, content, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       title=excluded.title, description=excluded.description,
       uploader=excluded.uploader, date=excluded.date, content=excluded.content`
  )
    .bind(slug, title, b.description || "", b.uploader || "", b.date || "", b.content || "", now)
    .run();
  return json({ ok: true, slug });
}

export async function onRequestDelete({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未登录" }, 401);
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return json({ error: "缺少 slug" }, 400);
  await env.DB.prepare("DELETE FROM posts WHERE slug = ?").bind(slug).run();
  return json({ ok: true });
}
