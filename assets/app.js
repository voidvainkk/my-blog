/* ============================================================
   app.js — 全站共享：左侧栏 / 页脚 / 社交弹窗
   要改站点信息、导航、社交账号，改下面 SITE 即可
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 站点配置：改这里 ---------- */
  window.SITE = {
    name: "vainvoidkk",                          // 头像下面那一行名字（像素风显示）
    avatar: "assets/images/background.jpg",       // 头像图片；留空则用名字首字
    bigTitle: "",                                // 名字下方的副标题，留空则不显示
    nav: [
      ["首页", "index.html"],
      ["归档", "archive.html"],
      ["下载", "downloads.html"],
      ["关于", "about.html"],
      ["留言板", "footprints.html"],
      ["管理", "admin.html"],
    ],
    socials: [                                   // [平台名, 显示值]
      ["GitHub", "voidvainkk"],
      ["Bilibili", "yourname"],
      ["SoundCloud", "yourname"],
      ["Dizzylab", "-"],
      ["Bandcamp", "yourname"],
      ["微信", "your-id"],
      ["QQ", "your-qq"],
    ],
    footer: "从小我就发誓要杀掉比我忧郁的人 可至今我的剑从未出鞘",
  };

  var S = window.SITE;

  function currentPage() {
    var p = location.pathname.split("/").pop();
    return p || "index.html";
  }

  /* ---------- 左侧栏 ---------- */
  function renderSidebar() {
    var aside = document.getElementById("sidebar");
    if (!aside) return;
    var page = currentPage();
    var initial = (S.name || "A").trim().charAt(0) || "A";

    var navHTML = S.nav.map(function (item) {
      var active = item[1] === page ? ' class="active"' : "";
      return '<a href="' + item[1] + '"' + active + ">" + item[0] + "</a>";
    }).join("");

    var socialHTML = S.socials.map(function (s) {
      return (
        '<button class="social-btn" data-platform="' +
        s[0] +
        '" data-id="' +
        s[1] +
        '">' +
        s[0] +
        "</button>"
      );
    }).join("");

    var avatarHTML = S.avatar
      ? '<div class="av solo has-img"><img src="' + S.avatar + '" alt="' + (S.name || "") + '"></div>'
      : '<div class="av solo">' + initial + "</div>";

    aside.innerHTML =
      '<div class="sidebar-info">' +
        '<div class="avatar-row single">' +
          avatarHTML +
        "</div>" +
        '<div class="names">' +
          '<p class="nm-main pixel-name" data-text="' + (S.name || "") + '">' + (S.name || "") + "</p>" +
        "</div>" +
        (S.bigTitle ? '<div class="big-title">' + S.bigTitle + "</div>" : "") +
      "</div>" +
      "<nav>" + navHTML + "</nav>" +
      '<div class="sidebar-social">' + socialHTML + "</div>";
  }

  /* ---------- 页脚 ---------- */
  function renderFooter() {
    var main = document.getElementById("main");
    if (!main || main.querySelector(".site-footer")) return;
    var f = document.createElement("footer");
    f.className = "site-footer";
    f.innerHTML = "<p>" + S.footer + "</p>";
    main.appendChild(f);
  }

  /* ---------- 社交弹窗 ---------- */
  function renderModal() {
    var div = document.createElement("div");
    div.className = "info-modal";
    div.id = "info-modal";
    div.innerHTML =
      '<div class="info-box">' +
        '<h3 id="info-title"></h3>' +
        '<p id="info-text"></p>' +
        '<button class="btn" id="info-close">关闭</button>' +
      "</div>";
    document.body.appendChild(div);

    div.addEventListener("click", function (e) {
      if (e.target === div) div.classList.remove("show");
    });
    div.querySelector("#info-close").addEventListener("click", function () {
      div.classList.remove("show");
    });

    document.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest(".social-btn");
      if (!btn) return;
      document.getElementById("info-title").textContent = btn.dataset.platform;
      document.getElementById("info-text").textContent = btn.dataset.id;
      div.classList.add("show");
    });
  }


  /* ---------- 启动 ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderSidebar();
    renderFooter();
    renderModal();
  });
})();
