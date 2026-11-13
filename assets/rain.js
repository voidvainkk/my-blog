/* 背景：蓝色电子雨（缓慢竖直下落）
   - 单独一层 canvas，画在背景之上、正文之下，不挡点击
   - 尊重「减少动效」：系统开启时整层不启动
   - 页面切到后台时暂停，回来继续
*/
(function () {
  if (window.__rainInit) return;
  window.__rainInit = true;

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return; // 不启动

  var canvas = document.createElement("canvas");
  canvas.id = "rain";
  canvas.setAttribute("aria-hidden", "true");

  var ctx = canvas.getContext ? canvas.getContext("2d") : null;
  if (!ctx) return;

  var W = 0,
    H = 0,
    dpr = 1,
    fontSize = 16,
    colW = 22,
    cols = [],
    raf = 0,
    last = 0,
    interval = 1000 / 30; // 约 30fps，够用又省电

  // 半角片假名 + 0/1，接近电子雨质感；不依赖任何外部字体
  var GLYPHS = "01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }
  function pickChars(n) {
    var s = "";
    for (var i = 0; i < n; i++) {
      s += GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
    }
    return s;
  }

  function makeCol(i) {
    var len = Math.floor(rand(6, 15));
    return {
      x: i * colW + colW * 0.2,
      y: rand(-H * 0.9, 0),
      speed: rand(0.28, 0.85), // 像素/帧，慢
      len: len,
      chars: pickChars(len),
      flick: rand(0, 1),
    };
  }

  function setup() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textBaseline = "top";

    fontSize = W < 640 ? 13 : 16;
    colW = fontSize * 1.5;
    ctx.font = fontSize + "px ui-monospace, Menlo, Consolas, monospace";

    var n = Math.max(1, Math.ceil(W / colW));
    cols = [];
    for (var i = 0; i < n; i++) cols.push(makeCol(i));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < cols.length; i++) {
      var c = cols[i];
      c.y += c.speed;

      // 拖尾：头部亮、往上逐渐变暗
      for (var k = 0; k < c.len; k++) {
        var y = c.y - k * fontSize;
        if (y < -fontSize || y > H) continue;
        var t = 1 - k / c.len;
        var ch = c.chars.charAt(k % c.chars.length);
        if (k === 0) {
          ctx.fillStyle = "rgba(214,238,255,1)"; // 头部偏白蓝，最亮
        } else {
          // 拖尾：整体更亮、衰减更慢，中段仍清晰可见
          var a = Math.max(0.12, t * 0.95);
          ctx.fillStyle = "rgba(122,192,255," + a.toFixed(3) + ")";
        }
        ctx.fillText(ch, c.x, y);
      }

      // 偶发闪变：让字符有点跳动的味道
      c.flick += 0.02;
      if (c.flick > 1) {
        c.flick = 0;
        var idx = Math.floor(Math.random() * c.chars.length);
        c.chars =
          c.chars.substring(0, idx) +
          GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length)) +
          c.chars.substring(idx + 1);
      }

      // 完全落出屏幕后从顶部重生
      if (c.y - c.len * fontSize > H) {
        var col = makeCol(i);
        col.y = rand(-H * 0.4, -fontSize);
        cols[i] = col;
      }
    }
  }

  function loop(ts) {
    raf = requestAnimationFrame(loop);
    if (!last) last = ts;
    if (ts - last < interval) return;
    last = ts;
    draw();
  }

  function start() {
    if (raf) return;
    last = 0;
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  var resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      setup();
      draw();
    }, 160);
  }

  function mount() {
    document.body.appendChild(canvas);
    setup();
    draw();
    start();
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
  }

  if (document.body) mount();
  else
    document.addEventListener("DOMContentLoaded", function () {
      mount();
    });
})();
