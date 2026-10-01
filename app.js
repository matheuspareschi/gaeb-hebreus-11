(function () {
  var KEY = 'gaeb-hebreus-11';
  var card = document.getElementById('card');
  var fields = card.querySelectorAll('input, textarea');

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || '[]');
      fields.forEach(function (f, i) {
        if (f.type === 'checkbox') f.checked = !!s[i]; else f.value = s[i] || '';
      });
    } catch (e) {}
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(Array.prototype.map.call(fields, function (f) {
        return f.type === 'checkbox' ? f.checked : f.value;
      })));
    } catch (e) {}
  }
  load();
  card.addEventListener('input', save);
  card.addEventListener('change', save);

  document.getElementById('pdf').addEventListener('click', function () { window.print(); });

  document.getElementById('clear').addEventListener('click', function () {
    if (!confirm('Limpar todas as respostas?')) return;
    fields.forEach(function (f) { if (f.type === 'checkbox') f.checked = false; else f.value = ''; });
    save();
  });

  var share = document.getElementById('share');
  if (navigator.share) {
    share.hidden = false;
    share.addEventListener('click', function () {
      var chosen = [];
      card.querySelectorAll('.actions li').forEach(function (li) {
        if (li.querySelector('input').checked) chosen.push('✔ ' + li.querySelector('b').textContent);
      });
      var text = 'GAEB · Hebreus 11.13-16 — A cidade que Deus prometeu\n' +
        (document.getElementById('nome').value ? 'Nome: ' + document.getElementById('nome').value + '\n' : '') +
        '\nAção da semana:\n' + (chosen.join('\n') || '(nenhuma)') +
        '\n\nEstá me atraindo de novo:\n' + document.getElementById('atraindo').value;
      navigator.share({ title: 'GAEB · Hebreus 11.13-16', text: text }).catch(function () {});
    });
  }
})();
