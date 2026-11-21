(function () {
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) toggle.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  var box = document.querySelector('.site-search');
  var out = document.querySelector('.search-results');
  if (!box || !out) return;
  var root = box.getAttribute('data-root') || '';
  var index = null;
  function load() {
    if (index) return Promise.resolve(index);
    return fetch(root + 'search.json').then(function (r) { return r.json(); }).then(function (d) { index = d; return d; })
      .catch(function () { index = []; return index; });
  }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  box.addEventListener('input', function () {
    var q = box.value.trim().toLowerCase();
    if (q.length < 2) { out.hidden = true; return; }
    load().then(function (pages) {
      var words = q.split(/\s+/);
      var hits = pages.map(function (p) {
        var hay = (p.title + ' ' + p.text).toLowerCase();
        var score = 0;
        for (var i = 0; i < words.length; i++) { if (hay.indexOf(words[i]) < 0) return null; score += p.title.toLowerCase().indexOf(words[i]) >= 0 ? 3 : 1; }
        var at = p.text.toLowerCase().indexOf(words[0]);
        return { p: p, score: score, snip: at >= 0 ? p.text.slice(Math.max(0, at - 40), at + 100) : p.text.slice(0, 120) };
      }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 12);
      out.innerHTML = hits.length ? hits.map(function (h) { return '<a href="' + root + esc(h.p.url) + '">' + esc(h.p.title) + '<small>' + esc(h.snip) + '</small></a>'; }).join('') : '<p style="padding:8px 10px;margin:0">No results</p>';
      out.hidden = false;
    });
  });
  box.addEventListener('keydown', function (e) { if (e.key === 'Escape') { out.hidden = true; box.blur(); } });
  document.addEventListener('click', function (e) { if (!out.contains(e.target) && e.target !== box) out.hidden = true; });
})();
