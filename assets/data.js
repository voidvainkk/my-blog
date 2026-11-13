/* ============================================================
   data.js — 数据层（对接 Cloudflare Pages Functions + D1）
   所有读写都走 /api/*，数据存在云端数据库，全站共享。
   页面用法（异步）：
     var posts = await DB.getPosts();
     var p     = await DB.getPost(slug);
     var list  = await DB.getDownloads();
     var fps   = await DB.getFootprints();
     var site  = await DB.getSite();     // { about:{html}, friends:[...] }
   管理页写操作（需先登录）：
     await DB.login(pwd) / DB.logout() / DB.me()
     await DB.savePost(obj) / DB.deletePost(slug)
     await DB.saveDownload(obj) / DB.deleteDownload(id)
     await DB.saveSite({about, friends})
     await DB.delFootprint(id)
   esc / fmtSize 仍是同步工具函数。
   ============================================================ */

(function () {
  "use strict";

  async function req(url, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ "content-type": "application/json" }, opts.headers || {});
    if (opts.body && typeof opts.body !== "string") opts.body = JSON.stringify(opts.body);
    var res = await fetch(url, opts);
    var data = null;
    try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) {
      var msg = (data && data.error) || ("请求失败 (" + res.status + ")");
      var err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return data || {};
  }

  /* ---------------- 文章 ---------------- */
  async function getPosts() {
    var d = await req("/api/posts");
    return d.posts || [];
  }
  async function getPost(slug) {
    var d = await req("/api/posts?slug=" + encodeURIComponent(slug));
    return d.post || null;
  }
  async function savePost(p) {
    return req("/api/posts", { method: "POST", body: p });
  }
  async function deletePost(slug) {
    return req("/api/posts?slug=" + encodeURIComponent(slug), { method: "DELETE" });
  }

  /* ---------------- 下载 ---------------- */
  async function getDownloads() {
    var d = await req("/api/downloads");
    return d.downloads || [];
  }
  async function saveDownload(x) {
    return req("/api/downloads", { method: "POST", body: x });
  }
  async function deleteDownload(id) {
    return req("/api/downloads?id=" + encodeURIComponent(id), { method: "DELETE" });
  }

  /* ---------------- 留言 ---------------- */
  async function getFootprints() {
    var d = await req("/api/footprints");
    return d.footprints || [];
  }
  async function getAllFootprints() {
    var d = await req("/api/footprints?all=1");
    return d.footprints || [];
  }
  async function setFootprintApproval(id, approved) {
    return req("/api/footprints?id=" + encodeURIComponent(id), {
      method: "PATCH",
      body: { approved: !!approved },
    });
  }
  async function addFootprint(fp) {
    return req("/api/footprints", { method: "POST", body: fp });
  }
  async function delFootprint(id) {
    return req("/api/footprints?id=" + encodeURIComponent(id), { method: "DELETE" });
  }

  /* ---------------- 站点配置（简介/友链） ---------------- */
  async function getSite() {
    var d = await req("/api/site");
    return { about: d.about || { html: "" }, friends: d.friends || [] };
  }
  async function saveSite(obj) {
    return req("/api/site", { method: "POST", body: obj });
  }

  /* ---------------- 登录 ---------------- */
  async function login(password) {
    return req("/api/login", { method: "POST", body: { password: password } });
  }
  async function logout() {
    return req("/api/logout", { method: "POST" });
  }
  async function me() {
    var d = await req("/api/me");
    return !!(d && d.authed);
  }

  /* ---------------- 工具 ---------------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fmtSize(b) {
    b = Number(b) || 0;
    if (b < 1024) return b + " B";
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
    return (b / 1024 / 1024).toFixed(1) + " MB";
  }
  function fmtDate(ms) {
    try { return new Date(Number(ms)).toLocaleString("zh-CN"); } catch (e) { return ""; }
  }

  window.DB = {
    getPosts, getPost, savePost, deletePost,
    getDownloads, saveDownload, deleteDownload,
    getFootprints, getAllFootprints, setFootprintApproval, addFootprint, delFootprint,
    getSite, saveSite,
    login, logout, me,
    esc, fmtSize, fmtDate,
  };
})();
