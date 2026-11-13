/* ============================================================
   demo-data.js — 本地预览兜底（仅本地打开时生效）
   线上（vvkkblog.pages.dev 等）绝不会加载本文件的逻辑：
   当且仅当用 file:// 双击打开、或跑在 localhost/127.0.0.1 时，
   给 window.DB 套一层只读演示数据，让页面能正常显示。
   写操作会抛出提示「本地预览无法保存，请到线上后台操作」。
   ============================================================ */
(function () {
  "use strict";

  var isLocal =
    location.protocol === "file:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "0.0.0.0";
  if (!isLocal || !window.DB) return;

  var DEMO_POSTS = [
    {
      slug: "hello-world",
      title: "第一篇：你好，世界",
      description: "在本地预览里看到的这篇是演示文章，线上后台写的才真正保存。",
      uploader: "vainvoidkk",
      date: "2026-11-13",
      content:
        "<p>这是<strong>本地预览</strong>用的演示内容。</p>" +
        "<p>线上站点（vvkkblog.pages.dev）里，所有文章都通过后台保存进数据库，全站共享。</p>" +
        "<blockquote>从小我就发誓要杀掉比我忧郁的人 可至今我的剑从未出鞘</blockquote>",
    },
    {
      slug: "pixel-blue",
      title: "像素 · 蓝",
      description: "关于这次主题改造：蓝色玻璃、像素名字、电子雨。",
      uploader: "vainvoidkk",
      date: "2026-11-12",
      content:
        "<p>背景改成缓缓下落的蓝色电子雨，名字用了像素字体，整体是深夜蓝的玻璃质感。</p>",
    },
  ];

  var DEMO_DOWNLOADS = [
    {
      id: "demo-1",
      name: "示例文件.zip",
      size: 204800,
      description: "演示用的下载条目（本地预览不会真的下载）。",
      href: "#",
      date: "2026-11-13",
    },
  ];

  var DEMO_FOOTPRINTS = [
    {
      id: "demo-fp-1",
      name: "路过的朋友",
      text: "本地预览里的演示留言，线上留言会保存到数据库。",
      color: "#58a6ff",
      avatar: null,
      approved: 1,
      created_at: 1794552445766,
    },
  ];

  var DEMO_SITE = {
    about: {
      html:
        "<p>这里是<strong>本地预览</strong>的演示简介。</p>" +
        "<blockquote>i'm the greatest trendsurfer</blockquote>",
    },
    friends: [
      { name: "示例友链", url: "https://example.com", desc: "本地预览演示" },
    ],
  };

  function delay(v) {
    return new Promise(function (res) {
      setTimeout(function () {
        res(v);
      }, 60);
    });
  }
  function readonly() {
    var e = new Error("本地预览不能保存，请到线上后台（vvkkblog.pages.dev/admin.html）操作");
    e.status = 0;
    return Promise.reject(e);
  }

  var real = window.DB;

  window.DB = Object.assign({}, real, {
    getPosts: function () {
      return delay(DEMO_POSTS.slice());
    },
    getPost: function (slug) {
      var p = null;
      for (var i = 0; i < DEMO_POSTS.length; i++) {
        if (DEMO_POSTS[i].slug === slug) {
          p = DEMO_POSTS[i];
          break;
        }
      }
      return delay(p);
    },
    getDownloads: function () {
      return delay(DEMO_DOWNLOADS.slice());
    },
    getFootprints: function () {
      return delay(DEMO_FOOTPRINTS.slice());
    },
    getAllFootprints: function () {
      return delay(DEMO_FOOTPRINTS.slice());
    },
    setFootprintApproval: readonly,
    getSite: function () {
      return delay(DEMO_SITE);
    },
    savePost: readonly,
    deletePost: readonly,
    saveDownload: readonly,
    deleteDownload: readonly,
    addFootprint: readonly,
    delFootprint: readonly,
    saveSite: readonly,
    login: function () {
      return Promise.reject(new Error("本地预览不能登录，请到线上后台操作"));
    },
    logout: function () {
      return Promise.resolve({});
    },
    me: function () {
      return delay(false);
    },
  });

  // 顶部提示条（让用户知道现在是本地演示）
  function banner() {
    var bar = document.createElement("div");
    bar.textContent = "本地预览模式 · 演示数据 · 线上请访问 vvkkblog.pages.dev";
    bar.style.cssText =
      "position:fixed;left:0;right:0;bottom:0;z-index:9999;padding:8px 12px;" +
      "font:12px/1.5 -apple-system,'Microsoft YaHei',sans-serif;text-align:center;" +
      "color:#dbe7ff;background:rgba(15,32,58,.92);border-top:1px solid rgba(96,138,210,.4);" +
      "letter-spacing:.04em;pointer-events:none;";
    document.body.appendChild(bar);
  }
  if (document.body) banner();
  else
    document.addEventListener("DOMContentLoaded", function () {
      banner();
    });
})();
