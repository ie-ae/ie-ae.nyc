// trial index: the open folder decides which drawing is on the field.
// The folders are windows: drag one by its head to move it, tap its head to open it (it comes to the front).
// Wide screen: they start in a row along the bottom. Narrow screen: they start stacked, each head showing
// above the one in front. TIDY puts them back. Where each was left is kept in this browser only.
(function () {
  var field = document.querySelector('.field'), row = document.querySelector('.folders'), fs = row.querySelectorAll('.folder');
  var stage = document.querySelector('.stage'), ims = stage.querySelectorAll('img'), cur = -1, top = 10, KEY = 'ieae-lab-win-1', pos = [];
  function open(i) {
    if (i !== cur) {
      cur = i;
      for (var k = 0; k < fs.length; k++) { fs[k].classList.toggle('on', k === i); ims[k].className = k === i ? 'on' : ''; }
    }
    fs[i].style.zIndex = String(++top);
  }
  function put(i, x, y) {           // keep the head on the field
    var W = field.clientWidth, H = field.clientHeight, w = fs[i].offsetWidth;
    x = Math.max(8 - w + 60, Math.min(W - 60, x)); y = Math.max(4, Math.min(H - 26, y));
    pos[i] = [x, y]; fs[i].style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
  }
  function home() {                 // the starting places
    var W = field.clientWidth, H = field.clientHeight, n = fs.length, w = fs[0].offsetWidth, h = fs[0].offsetHeight, gap = 12, m = Math.max(12, 0.04 * W), out = [], dock;
    if (n * w + (n - 1) * gap + 2 * m <= W) {
      var x0 = (W - (n * w + (n - 1) * gap)) / 2, y = H - h - Math.max(18, 0.03 * H);
      for (var i = 0; i < n; i++) out.push([x0 + i * (w + gap), y]);
      dock = H - y + 12;
    } else {
      var sx = Math.min(18, (W - 2 * m - w) / (n - 1)), sy = 24, yb = H - h - Math.max(16, 0.03 * H);
      for (var j = 0; j < n; j++) out.push([m + j * sx, yb - j * sy]);
      dock = H - (yb - (n - 1) * sy) + 12;
    }
    field.style.setProperty('--dock', dock + 'px');
    return out;
  }
  function save() { try { var W = field.clientWidth, H = field.clientHeight; localStorage.setItem(KEY, JSON.stringify(pos.map(function (p) { return [p[0] / W, p[1] / H]; }))); } catch (e) {} }
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s && s.length === fs.length ? s : null; } catch (e) { return null; } }
  function layout(fresh) {
    var h = home(), s = fresh ? null : load(), W = field.clientWidth, H = field.clientHeight;
    for (var i = 0; i < fs.length; i++) { if (s) put(i, s[i][0] * W, s[i][1] * H); else put(i, h[i][0], h[i][1]); }
    if (!s) for (var k = fs.length - 1; k >= 0; k--) fs[k].style.zIndex = String(++top);   // first one in front
  }
  field.classList.add('win'); row.classList.add('win');
  var tidy = document.createElement('button'); tidy.type = 'button'; tidy.className = 'tidy'; tidy.textContent = 'Tidy'; field.appendChild(tidy);
  tidy.addEventListener('click', function () { try { localStorage.removeItem(KEY); } catch (e) {} layout(true); open(cur < 0 ? 0 : cur); });
  for (var i = 0; i < fs.length; i++) (function (i) {
    var hd = fs[i].querySelector('.hd'), d = null;
    hd.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      d = { id: e.pointerId, x: e.clientX, y: e.clientY, px: pos[i][0], py: pos[i][1], moved: false };
      try { hd.setPointerCapture(e.pointerId); } catch (er) {}
      fs[i].style.zIndex = String(++top); e.preventDefault();
    });
    hd.addEventListener('pointermove', function (e) {
      if (!d || e.pointerId !== d.id) return;
      var dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.moved && Math.abs(dx) + Math.abs(dy) < 6) return;
      if (!d.moved) { d.moved = true; fs[i].classList.add('drag'); }
      put(i, d.px + dx, d.py + dy);
    });
    function end(e) {
      if (!d || e.pointerId !== d.id) return;
      var moved = d.moved; d = null; fs[i].classList.remove('drag');
      if (moved) save(); else open(i);
    }
    hd.addEventListener('pointerup', end); hd.addEventListener('pointercancel', end);
  })(i);
  window.addEventListener('resize', function () { layout(false); });
  layout(false); open(0);
})();
