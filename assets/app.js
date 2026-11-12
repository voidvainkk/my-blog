/* ============================================================
   app.js — 全站共享：左侧栏 / 页脚 / 音乐播放器 / 社交弹窗
   要改站点信息、导航、社交账号、歌单，改下面 SITE 和 SONGS 即可
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 站点配置：改这里 ---------- */
  window.SITE = {
    name: "你的名字",                            // 头像下面那一行名字
    bigTitle: "我的博客",                        // 大标题
    nav: [
      ["首页", "index.html"],
      ["归档", "archive.html"],
      ["下载", "downloads.html"],
      ["关于", "about.html"],
      ["留言板", "footprints.html"],
      ["管理", "admin.html"],
    ],
    socials: [                                   // [平台名, 显示值]
      ["GitHub", "yourname"],
      ["Bilibili", "yourname"],
      ["SoundCloud", "yourname"],
      ["Dizzylab", "-"],
      ["Bandcamp", "yourname"],
      ["微信", "your-id"],
      ["QQ", "your-qq"],
    ],
    footer: "i'm the greatest trendsurfer",
  };

  /* ---------- 歌单：可选，填本地音频或在线链接 ----------
     例：{ name: "曲名", artist: "作者", src: "assets/songs/xxx.mp3" }
  */
  window.SONGS = [];

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

    aside.innerHTML =
      '<div class="sidebar-info">' +
        '<div class="avatar-row single">' +
          '<div class="av solo">' + initial + "</div>" +
        "</div>" +
        '<div class="names">' +
          '<p class="nm-main">' + (S.name || "") + "</p>" +
        "</div>" +
        '<div class="big-title">' + S.bigTitle + "</div>" +
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

  /* ---------- 音乐播放器 ---------- */
  function renderMusic() {
    var wrap = document.createElement("div");
    wrap.className = "music-player";
    wrap.id = "music-player";
    wrap.innerHTML =
      '<div class="mp-head">' +
        '<span id="music-header">音乐播放器</span>' +
        '<button id="music-toggle">展开</button>' +
      "</div>" +
      '<div class="mp-body" id="music-body">' +
        '<div class="mp-now">' +
          '<div class="mp-cover">🎵</div>' +
          "<div style=\"flex:1;min-width:0\">" +
            '<div id="music-title">未在播放</div>' +
            '<div id="music-artist">--</div>' +
          "</div>" +
        "</div>" +
        '<audio id="audio-player" controls></audio>' +
        '<div class="mp-list" id="playlist"></div>' +
      "</div>";
    document.body.appendChild(wrap);

    var audio = wrap.querySelector("#audio-player");
    var titleEl = wrap.querySelector("#music-title");
    var artistEl = wrap.querySelector("#music-artist");
    var toggle = wrap.querySelector("#music-toggle");
    var body = wrap.querySelector("#music-body");
    var listEl = wrap.querySelector("#playlist");
    var headerEl = wrap.querySelector("#music-header");
    var songs = window.SONGS || [];

    audio.volume = 0.5;

    function renderList() {
      if (!songs.length) {
        listEl.innerHTML =
          '<p style="color:var(--muted);font-size:0.72rem;text-align:center;padding:0.6rem 0;">暂无音乐</p>';
        return;
      }
      listEl.innerHTML = songs
        .map(function (s, i) {
          return (
            '<div class="pl-item" data-idx="' + i + '">' +
              '<span class="pl-num">' + (i + 1) + "</span>" +
              '<span class="pl-name">' + s.name + "</span>" +
              (s.artist ? '<span class="pl-num">' + s.artist + "</span>" : "") +
            "</div>"
          );
        })
        .join("");
      listEl.querySelectorAll(".pl-item").forEach(function (row) {
        row.addEventListener("click", function () {
          play(parseInt(row.dataset.idx, 10));
        });
      });
    }

    function play(i) {
      var s = songs[i];
      if (!s) return;
      audio.src = s.src;
      titleEl.textContent = s.name;
      artistEl.textContent = s.artist || "";
      headerEl.textContent = s.artist ? s.name + " - " + s.artist : s.name;
      listEl.querySelectorAll(".pl-item").forEach(function (r, k) {
        r.classList.toggle("playing", k === i);
      });
      audio.play().catch(function () {});
    }

    toggle.addEventListener("click", function () {
      var open = body.style.display === "block";
      body.style.display = open ? "none" : "block";
      toggle.textContent = open ? "展开" : "收起";
    });

    audio.addEventListener("ended", function () {
      titleEl.textContent = "播放完毕";
      headerEl.textContent = "音乐播放器";
    });

    renderList();
  }

  /* ---------- 启动 ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderSidebar();
    renderFooter();
    renderModal();
    renderMusic();
  });
})();
