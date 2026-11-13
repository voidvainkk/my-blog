/* GET /api/me -> { authed: bool } 判断当前是否已登录 */
import { json, requireAuth } from "./_utils.js";

export async function onRequestGet({ request, env }) {
  const authed = await requireAuth(request, env);
  return json({ authed });
}
