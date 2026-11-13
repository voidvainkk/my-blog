/* ============================================================
   effects.js — 视觉特效（可整段删掉，站点功能不受影响）
   1) 卡片聚光跟随光标   2) 滚动淡入   3) 玻璃噪点
   4) 像素名 glitch 微动  5) 头像 hover 抖动
   全部尊重「减少动效」系统设置，触摸/小屏自动降级
   ============================================================ */

(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  /* ---------- 1) 卡片聚光跟随光标 ---------- */
  function initSpotlight() {
    if (reduce || coarse) return;
    var selector = ".post-card, .dl-card";
    document.addEventListener(
      "pointermove",
      function (e) {
        var el = e.target && e.target.closest && e.target.closest(selector);
        if (!el) return;
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", e.clientX - r.left + "px");
        el.style.setProperty("--my", e.clientY - r.top + "px");
      },
      { passive: true }
    );
  }

  /* ---------- 2) 滚动淡入 ---------- */
  function initReveal() {
    if (reduce) return;
    var targets = document.querySelectorAll(
      ".post-card, .dl-card, .year-block, .fp-card, .prose, main > h1, main > .page-note"
    );
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      // 老浏览器：直接全部显示，不做淡入
      targets.forEach(function (el) { el.classList.add("reveal", "in"); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (el, i) {
      // 已经在首屏内的，下一个帧再加过渡，避免闪一下
      el.classList.add("reveal");
      el.style.transitionDelay = Math.min(i % 6, 5) * 55 + "ms";
      io.observe(el);
    });

    // 兜底：3 秒后还在隐藏的（极少数被 IO 漏掉），强制显示
    window.setTimeout(function () {
      document.querySelectorAll(".reveal:not(.in)").forEach(function (el) {
        el.classList.add("in");
      });
    }, 3000);
  }

  /* ---------- 启动（延后一帧，等页面脚本把卡片渲染出来） ---------- */
  // 暴露给页面：异步渲染完内容后，页面再调一次即可给新元素加特效
  window.initSpotlight = initSpotlight;
  window.initReveal = initReveal;

  document.addEventListener("DOMContentLoaded", function () {
    window.setTimeout(function () {
      try { initSpotlight(); } catch (e) {}
      try { initReveal(); } catch (e) {}
      document.documentElement.classList.add("fx-ready");
    }, 0);
  });
})();
