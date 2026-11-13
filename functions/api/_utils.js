/* ============================================================
   functions/api/_utils.js — 公共工具
   Cloudflare Pages Functions 运行在 Workers 环境（Web Crypto 可用）
   ============================================================ */

/* ---- JSON 响应 ---- */
export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}

/* ---- 读取 JSON body（带大小上限，防滥用） ---- */
export async function readJson(request, maxBytes = 1024 * 1024) {
  const text = await request.text();
  if (text.length > maxBytes) {
    throw new Error("payload too large");
  }
  if (!text) return {};
  return JSON.parse(text);
}

/* ============================================================
   会话（登录凭证）
   服务端无状态：cookie = base64(payload).hmacSHA256(payload)
   payload = { exp: 过期毫秒时间戳 }
   密钥来自环境变量 SESSION_SECRET
   ============================================================ */

const COOKIE_NAME = "blog_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 天

function b64url(bytes) {
  let s = "";
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
function strToB64url(s) {
  return b64url(new TextEncoder().encode(s));
}
function b64urlToStr(bytes) {
  return new TextDecoder().decode(bytes);
}

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return b64url(sig);
}

/* 生成签名 cookie 值 */
export async function signSession(env) {
  const secret = env.SESSION_SECRET || "please-set-SESSION_SECRET";
  const payload = strToB64url(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS }));
  const sig = await hmac(secret, payload);
  return payload + "." + sig;
}

/* 校验 cookie 值，返回 true/false */
export async function verifySession(env, value) {
  if (!value || typeof value !== "string" || value.indexOf(".") < 0) return false;
  const [payload, sig] = value.split(".");
  const secret = env.SESSION_SECRET || "please-set-SESSION_SECRET";
  const expect = await hmac(secret, payload);
  if (!timingSafeEqual(sig, expect)) return false;
  try {
    const data = JSON.parse(b64urlToStr(b64urlDecode(payload)));
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch (e) {
    return false;
  }
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

/* 从请求 Cookie 头里取某个 cookie */
export function getCookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  const parts = raw.split(/;\s*/);
  for (const p of parts) {
    const idx = p.indexOf("=");
    if (idx > 0 && p.slice(0, idx) === name) {
      return decodeURIComponent(p.slice(idx + 1));
    }
  }
  return null;
}

/* 构造写操作要用的 Set-Cookie */
export function sessionCookie(value, maxAgeSec) {
  return (
    `${COOKIE_NAME}=` +
    encodeURIComponent(value) +
    `; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`
  );
}
export function clearCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

/* 校验请求是否已登录（写操作专用） */
export async function requireAuth(request, env) {
  const token = getCookie(request, COOKIE_NAME);
  return verifySession(env, token);
}

/* 校验密码：与 env.ADMIN_PASSWORD 做恒定时间比较 */
export async function checkPassword(env, input) {
  const expected = env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  if (typeof input !== "string") return false;
  // 长度不一直接 false（避免泄露长度信息意义不大，这里简单处理）
  const a = new TextEncoder().encode(input);
  const b = new TextEncoder().encode(expected);
  if (a.length !== b.length) {
    // 仍然消耗一点时间，降低时序特征
    let dummy = 0;
    for (let i = 0; i < b.length; i++) dummy |= b[i] ^ 0;
    return false;
  }
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a[i] ^ b[i];
  return out === 0;
}

export { COOKIE_NAME };
