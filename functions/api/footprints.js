/* ============================================================
   /api/footprints  （留言板，公开：谁都能留言，但需审核通过才展示）
   审核状态不额外加表/加列，而是存在 site_config 的 key='fp_approved'
   （一个 JSON 字符串数组，元素是「已通过展示」的留言 id）。
   这样旧库无需任何迁移，直接可用。

   GET                 -> 仅返回已审核通过的留言（按时间倒序）
   GET ?all=1 （需登录）-> 返回全部留言，并带 approved 布尔（后台审核用）
   POST （公开）        -> 新增留言（默认不展示，等待审核）
   PATCH ?id=  （需登录）-> 审核：{ approved: true/false }
   DELETE ?id= （需登录）-> 删除留言
   ============================================================ */
import { json, readJson, requireAuth } from "./_utils.js";

const APPROVED_KEY = "fp_approved";

async function getApprovedIds(env) {
  const row = await env.DB.prepare(
    "SELECT value FROM site_config WHERE key = ?"
  )
    .bind(APPROVED_KEY)
    .first();
  if (!row) return [];
  try {
    const arr = JSON.parse(row.value);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

async function setApprovedIds(env, ids) {
  await env.DB.prepare(
    "INSERT INTO site_config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  )
    .bind(APPROVED_KEY, JSON.stringify(ids))
    .run();
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const approvedIds = await getApprovedIds(env);

  // 后台审核用：带 ?all=1 且已登录，返回全部（含待审核）
  if (url.searchParams.get("all") === "1") {
    if (!(await requireAuth(request, env))) return json({ error: "未登录" }, 401);
    const { results } = await env.DB.prepare(
      "SELECT id, name, text, color, avatar, created_at FROM footprints ORDER BY created_at DESC"
    ).all();
    const set = new Set(approvedIds);
    const list = (results || []).map((r) => ({ ...r, approved: set.has(r.id) }));
    return json({ footprints: list });
  }

  // 公开：只给已审核通过的
  const { results } = await env.DB.prepare(
    "SELECT id, name, text, color, avatar, created_at FROM footprints ORDER BY created_at DESC"
  ).all();
  const set = new Set(approvedIds);
  const list = (results || []).filter((r) => set.has(r.id));
  return json({ footprints: list });
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
  return json({ ok: true, id, approved: false });
}

// 审核：通过 / 取消展示（需登录）
export async function onRequestPatch({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未登录" }, 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "缺少 id" }, 400);
  let b;
  try {
    b = await readJson(request, 16 * 1024);
  } catch (e) {
    return json({ error: "请求过大或格式错误" }, 400);
  }
  const set = new Set(await getApprovedIds(env));
  if (b.approved) set.add(id);
  else set.delete(id);
  await setApprovedIds(env, Array.from(set));
  return json({ ok: true, id, approved: !!b.approved });
}

export async function onRequestDelete({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未登录" }, 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "缺少 id" }, 400);
  await env.DB.prepare("DELETE FROM footprints WHERE id = ?").bind(id).run();
  // 顺手把它从审核白名单里移除
  const set = new Set(await getApprovedIds(env));
  if (set.has(id)) {
    set.delete(id);
    await setApprovedIds(env, Array.from(set));
  }
  return json({ ok: true });
}
