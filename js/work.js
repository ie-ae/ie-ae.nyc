/* index.html (the main page since 11/18; first built as work.html), after mos.nyc/index (our own code).
   Index button / X: open or close the list. Pointing at a line shows that project's images on the right;
   clicking it closes the list and goes to that project.
   A category: show only its lines and bring its first project up; again = all lines.
   An image: the gallery slides up from the bottom with all images of that project, starting at the one
   clicked; a click anywhere (or Esc) slides it out upward. */
(function () {
  var H = document.documentElement, q = function (s, e) { return [].slice.call((e || document).querySelectorAll(s)); };
  var ix = document.querySelector('.wk .ix'), ov = document.querySelector('.wk .ov');
  if (!ix || !ov) return;
  function nav(on) { H.classList.toggle('na', on); }
  function go(id, smooth) {
    var a = document.getElementById(id); if (!a) return;
    window.scrollTo({ top: window.scrollY + a.getBoundingClientRect().top, behavior: smooth ? 'smooth' : 'auto' });
    try { history.replaceState(null, '', '#' + id); } catch (e) {}
  }
  document.querySelector('.wk .tg').addEventListener('click', function () { nav(!H.classList.contains('na')); });
  document.querySelector('.wk .ixc').addEventListener('click', function () { nav(false); });
  q('.wk .it a').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); nav(false); go(a.getAttribute('href').slice(1), true); });
    // list and images stay in step: pointing at a line (mouse only, list open) brings that project's images up at once
    a.addEventListener('mouseenter', function () {
      if (!H.classList.contains('na') || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      var t = document.getElementById(a.getAttribute('href').slice(1));
      if (t) window.scrollTo({ top: window.scrollY + t.getBoundingClientRect().top, behavior: 'auto' });
    });
  });
  var cats = q('.wk .cats button');
  cats.forEach(function (b) {
    b.addEventListener('click', function () {
      var on = !b.classList.contains('on'), first = null;
      cats.forEach(function (c) { c.classList.toggle('on', on && c === b); });
      ix.classList.toggle('f', on);
      q('.wk .it').forEach(function (li) {
        var m = on && li.dataset.c === b.dataset.t; li.classList.toggle('show', m);
        if (m && !first) first = li.querySelector('a').getAttribute('href').slice(1);
      });
      if (first) go(first, false);
    });
  });
  // gallery
  var busy = false;
  function open(li) {
    if (busy) return;
    var items = q('li', li.parentNode), keep = ov.querySelector('.ovc');
    ov.innerHTML = ''; ov.appendChild(keep);
    var mine = null;
    items.forEach(function (it) {
      var m = it.querySelector('img,video'), d = document.createElement('div'), n;
      d.className = 'big';
      if (m.tagName === 'VIDEO') { n = document.createElement('video'); n.muted = true; n.loop = true; n.autoplay = true; n.setAttribute('playsinline', ''); n.poster = m.poster; n.src = m.currentSrc || m.src; }
      else { n = document.createElement('img'); n.alt = m.alt; n.src = it.querySelector('a').href; }
      n.width = m.getAttribute('width'); n.height = m.getAttribute('height');
      d.appendChild(n); ov.appendChild(d); if (it === li) mine = d;
    });
    ov.scrollTop = 0; ov.scrollTop = mine ? mine.offsetTop : 0;
    ov.setAttribute('aria-hidden', 'false');
    H.classList.add('ova');
  }
  function close() {
    if (busy || !H.classList.contains('ova')) return;
    busy = true; H.classList.remove('ova'); H.classList.add('ovo'); ov.setAttribute('aria-hidden', 'true');
    setTimeout(function () { H.classList.remove('ovo'); var keep = ov.querySelector('.ovc'); ov.innerHTML = ''; ov.appendChild(keep); busy = false; }, 1050);
  }
  q('.wk .pm li a').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); open(a.parentNode); }); });
  ov.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (H.classList.contains('ova')) close(); else nav(false); } });
  if (location.hash.length > 1) go(location.hash.slice(1), false);
})();
