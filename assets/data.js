/* ============================================================
   data.js — 数据层（纯前端模拟后端）
   已清空示例内容：文章、下载、留言初始都是空的，
   一切从你添加的第一条开始。
     · 文章 / 下载：管理页里增删，存在 localStorage
     · 留言：完全存 localStorage（只在本浏览器可见）
   以后想多人共享，把这里换成 fetch('/api/...') 即可无缝迁移。
   ============================================================ */

(function () {
  "use strict";

  var LS = {
    posts: "blog.posts.v1",
    downloads: "blog.downloads.v1",
    footprints: "blog.footprints.v1",
  };

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------------- 种子：文章（已清空） ---------------- */
  var SEED_POSTS = [];

  /* ---------------- 种子：下载（已清空） ---------------- */
  var SEED_DOWNLOADS = [];

  /* ---------------- 文章 ---------------- */
  function getPosts() {
    var override = load(LS.posts, null);
    return override || SEED_POSTS;
  }
  function setPosts(list) { save(LS.posts, list); }
  function getPost(slug) {
    return getPosts().filter(function (p) { return p.slug === slug; })[0] || null;
  }

  /* ---------------- 下载 ---------------- */
  function getDownloads() {
    var override = load(LS.downloads, null);
    return override || SEED_DOWNLOADS;
  }
  function setDownloads(list) { save(LS.downloads, list); }

  /* ---------------- 留言 ---------------- */
  function getFootprints() { return load(LS.footprints, []); }
  function addFootprint(fp) {
    var list = getFootprints();
    fp.id = uid();
    fp.time = Date.now();
    list.unshift(fp);
    save(LS.footprints, list);
    return fp;
  }
  function delFootprint(id) {
    save(LS.footprints, getFootprints().filter(function (f) { return f.id !== id; }));
  }

  /* ---------------- 工具 ---------------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fmtSize(b) {
    if (b < 1024) return b + " B";
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
    return (b / 1024 / 1024).toFixed(1) + " MB";
  }

  window.DB = {
    getPosts, setPosts, getPost,
    getDownloads, setDownloads,
    getFootprints, addFootprint, delFootprint,
    esc, fmtSize,
    LS,
  };
})();
