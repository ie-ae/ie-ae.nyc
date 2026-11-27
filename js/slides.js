// slide shows: swipe works without this. This adds the count and the arrows, and makes each image
// three zones: left = previous, right = next, centre = enlarge. Escape (or Close, or the centre) leaves the enlarged view.
(function () {
  function zone(e, im) { var r = im.getBoundingClientRect(), x = (e.clientX - r.left) / r.width; return x < 0.3 ? -1 : x > 0.7 ? 1 : 0; }
  function hint(im, inside) {
    im.addEventListener('mousemove', function (e) { var z = zone(e, im); im.style.cursor = z < 0 ? 'w-resize' : z > 0 ? 'e-resize' : (inside ? 'zoom-out' : 'zoom-in'); });
  }
  var zoom = document.createElement('div'); zoom.className = 'zoom'; zoom.hidden = true;
  zoom.innerHTML = '<div class="bar"><span class="cap"></span><button type="button" class="x">Close</button></div><img alt="">';
  document.body.appendChild(zoom);
  var zi = zoom.querySelector('img'), zc = zoom.querySelector('.cap'), cur = null;
  function open(list, i) {
    cur = { list: list, i: i }; var f = list[i], im = f.querySelector('img');
    zi.src = im.getAttribute('src'); zi.alt = im.alt;
    zc.textContent = (i + 1) + ' / ' + list.length + '   ' + f.querySelector('figcaption').textContent;
    zoom.hidden = false; zoom.scrollTop = 0; document.documentElement.style.overflow = 'hidden';
  }
  function close() { zoom.hidden = true; zi.removeAttribute('src'); document.documentElement.style.overflow = ''; cur = null; }
  function step(d) { if (cur) open(cur.list, (cur.i + d + cur.list.length) % cur.list.length); }
  zoom.querySelector('.x').addEventListener('click', close);
  zi.addEventListener('click', function (e) { var z = zone(e, zi); if (z) step(z); else close(); });
  hint(zi, true);
  document.addEventListener('keydown', function (e) {
    if (zoom.hidden) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1);
  });

  // index: no controls. left half of a band = previous image, right half = next.
  document.querySelectorAll('.leaf .slides').forEach(function (t) {
    var n = t.children.length, marks = t.parentNode.querySelectorAll('.marks i');
    function at() { var b = 0, bd = 1e9; for (var i = 0; i < n; i++) { var d = Math.abs(t.children[i].offsetLeft - t.offsetLeft - t.scrollLeft); if (d < bd) { bd = d; b = i; } } return b; }
    function upd() { var a = at(); for (var i = 0; i < marks.length; i++) marks[i].className = i === a ? 'on' : ''; }
    function go(d) { var i = (at() + d + n) % n; t.scrollTo({ left: t.children[i].offsetLeft - t.offsetLeft, behavior: 'auto' }); }
    // one image shows at a time (no stack behind it, no strips at the edge; Jayson 11/17). The images sit in a
    // still layer under the scroller (.cards); the scroller only takes the swipe and gives the position, so
    // nothing is pushed one way by the browser and pulled back here. On a swipe the front image slides off
    // to the left and the next one is uncovered in place; it is hidden again whenever it is not moving in.
    var G = null, cards = [];
    function ratio(im) { return (parseFloat(im.getAttribute('width')) || im.naturalWidth || 3) / (parseFloat(im.getAttribute('height')) || im.naturalHeight || 2); }
    function build() {
      var layer = document.createElement('div'); layer.className = 'cards';
      for (var i = 0; i < n; i++) {
        var im = t.children[i].querySelector('img'), c = document.createElement('div');
        c.className = 'card'; c.appendChild(im); layer.appendChild(c);
        cards.push({ el: c, im: im, ar: ratio(im), shown: true });
      }
      t.parentNode.insertBefore(layer, t);
    }
    function lay() {
      var W = t.clientWidth, m = 0.03 * W, a = cards[0].ar;
      // the image sits in the middle of the band, 90% of its width at most
      var S = Math.min(0.9 * W, a * 0.86 * window.innerHeight), H = S / a;
      G = { W: W, S: S, H: H, x0: (W - S) / 2, y0: m };
      for (var i = 0; i < n; i++) { t.children[i].style.height = (m + H) + 'px'; cards[i].el.style.width = S + 'px'; }
      place();
    }
    function spot(ar) {             // an image fitted inside the band's box, centred: [x, y, scale]
      var ih = G.S / ar, sc = Math.min(1, G.H / ih), w = G.S * sc, h = ih * sc;
      return [G.x0 + (G.S - w) / 2, G.y0 + (G.H - h) / 2, sc];
    }
    function place() {
      if (!G) return;
      var p = t.scrollLeft;
      for (var i = 0; i < n; i++) {
        var q = cards[i], d = (t.children[i].offsetLeft - t.offsetLeft - p) / G.W, c = Math.max(0, d);
        if (c < 2.5 && q.im.loading === 'lazy') q.im.loading = 'eager';   // fetch before it is needed
        if (d < -1.05 || c > 0.995) { if (q.shown) { q.el.style.visibility = 'hidden'; q.shown = false; } continue; }
        var A = spot(q.ar), x = A[0] + Math.min(0, d) * G.W;
        if (!q.shown) { q.el.style.visibility = ''; q.shown = true; }
        q.el.style.zIndex = String(50 - Math.round(c * 10));
        q.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + A[1].toFixed(1) + 'px,0) scale(' + A[2].toFixed(4) + ')';
      }
    }
    if (n > 1) {
      build(); t.classList.add('deck'); lay();
      window.addEventListener('resize', lay); window.addEventListener('load', lay);
    }
    t.addEventListener('scroll', function () { upd(); if (n > 1) place(); }, { passive: true });
    function half(e) { var r = t.getBoundingClientRect(); return (e.clientX - r.left) / r.width < 0.5 ? -1 : 1; }
    t.addEventListener('click', function (e) { if (n > 1) go(half(e)); });   // left half = back, right half = on; nothing opens a page
    if (n > 1) t.addEventListener('mousemove', function (e) { t.style.cursor = half(e) < 0 ? 'w-resize' : 'e-resize'; });
    upd();
  });

  document.querySelectorAll('.show').forEach(function (s) {
    var t = s.querySelector('.slides'), n = t.children.length, c = s.querySelector('.count');
    function at() { var w = t.children[0].getBoundingClientRect().width + 16; return Math.max(0, Math.min(n - 1, Math.round(t.scrollLeft / w))); }
    function upd() { c.textContent = (at() + 1) + ' / ' + n; }
    function go(d, wrap) { var i = at() + d; if (wrap) i = (i + n) % n; i = Math.max(0, Math.min(n - 1, i)); t.scrollTo({ left: t.children[i].offsetLeft - t.offsetLeft, behavior: 'auto' }); }
    t.addEventListener('scroll', function () { window.requestAnimationFrame(upd); });
    s.querySelector('.prev').addEventListener('click', function () { go(-1); });
    s.querySelector('.next').addEventListener('click', function () { go(1); });
    t.addEventListener('click', function (e) {
      if (e.target.tagName !== 'IMG') return;
      var z = zone(e, e.target); if (z) go(z, true); else { var withImg = Array.prototype.filter.call(t.children, function (f) { return f.querySelector('img'); }); open(withImg, Math.max(0, withImg.indexOf(t.children[at()]))); }
    });
    Array.prototype.forEach.call(t.querySelectorAll('img'), function (im) { hint(im, false); });
    s.classList.add('js'); upd();
  });
})();
