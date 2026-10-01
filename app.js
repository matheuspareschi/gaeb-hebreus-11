(function () {
  var KEY = 'gaeb-hebreus-11';
  var FONT = '-apple-system, "Helvetica Neue", Arial, sans-serif';
  var QUESTION = 'Tem alguma coisa que está fazendo com que eu volte para os caminhos antigos?';
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

  document.getElementById('clear').addEventListener('click', function () {
    if (!confirm('Limpar todas as respostas?')) return;
    fields.forEach(function (f) { if (f.type === 'checkbox') f.checked = false; else f.value = ''; });
    save();
  });

  function wrap(ctx, text, maxW) {
    var lines = [];
    text.split('\n').forEach(function (para) {
      var words = para.split(/\s+/).filter(Boolean), line = '';
      if (!words.length) { lines.push(''); return; }
      words.forEach(function (w) {
        var t = line ? line + ' ' + w : w;
        if (line && ctx.measureText(t).width > maxW) { lines.push(line); line = w; } else line = t;
      });
      lines.push(line);
    });
    return lines;
  }

  // Desenha o cartão; com draw=false só mede e devolve a altura.
  function layout(ctx, W, draw, data) {
    var P = 90, maxW = W - P * 2, y = 100;
    function text(str, size, weight, color, lh, x, spacing) {
      ctx.font = weight + ' ' + size + 'px ' + FONT;
      ctx.fillStyle = color;
      if ('letterSpacing' in ctx) ctx.letterSpacing = spacing || '0px';
      var lines = wrap(ctx, str, maxW - (x ? x - P : 0));
      lines.forEach(function (l) { if (draw) ctx.fillText(l, x || P, y + lh / 2 + size * 0.35); y += lh; });
      return lines.length;
    }
    function rule() { if (draw) { ctx.fillStyle = '#d6dae2'; ctx.fillRect(P, y, maxW, 2); } }
    ctx.textBaseline = 'alphabetic';

    text('GAEB · HEBREUS 11.13-16', 26, '600', '#8a5a00', 34, 0, '4px'); y += 14;
    text('A cidade que Deus prometeu', 60, '600', '#1e2a4a', 74); y += 10;
    if (data.nome) { text(data.nome, 34, '400', '#6b7280', 46); }
    y += 40;

    if (data.acoes.length) {
      text('AÇÃO ESCOLHIDA PARA ESTA SEMANA', 24, '600', '#6b7280', 34, 0, '3px'); y += 4;
      rule(); y += 16;
      data.acoes.forEach(function (a) {
        var top = y;
        if (draw) {
          ctx.beginPath(); ctx.arc(P + 17, top + 39, 17, 0, Math.PI * 2);
          ctx.fillStyle = '#1e2a4a'; ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(P + 8, top + 40); ctx.lineTo(P + 15, top + 47); ctx.lineTo(P + 27, top + 32); ctx.stroke();
        }
        y += 14;
        text(a.titulo, 36, '500', '#1f2937', 50, P + 56);
        if (a.sub) { y -= 4; text(a.sub, 28, '400', '#6b7280', 40, P + 56); }
        y += 14;
        rule(); y += 16;
      });
      y += 20;
    }

    if (data.texto) {
      text(QUESTION.toUpperCase(), 24, '600', '#6b7280', 34, 0, '3px'); y += 8;
      text(data.texto, 36, '400', '#1f2937', 54); y += 20;
    }

    y += 24;
    function note(label, rest) {
      ctx.font = '600 28px ' + FONT;
      var lw = ctx.measureText(label + ' ').width;
      var lines = wrap(ctx, label + ' ' + rest, maxW);
      lines.forEach(function (l, i) {
        if (draw) {
          if (i === 0) {
            ctx.font = '600 28px ' + FONT; ctx.fillStyle = '#1f2937'; ctx.fillText(label, P, y + 30);
            ctx.font = '400 28px ' + FONT; ctx.fillStyle = '#6b7280';
            ctx.fillText(l.slice(label.length + 1), P + lw, y + 30);
          } else { ctx.font = '400 28px ' + FONT; ctx.fillStyle = '#6b7280'; ctx.fillText(l, P, y + 30); }
        }
        y += 42;
      });
      y += 18;
    }
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    note('NA CANTINA:', 'qual ação eu escolhi? Algo me puxou de volta? Qual promessa me sustentou?');
    note('Textos para ler em casa:', 'Isaías 65.16-25 · Apocalipse 21.1-7 e 22.1-5 · 1 João 3.1-3');
    return y + 70;
  }

  function collect() {
    var acoes = [];
    card.querySelectorAll('.actions li').forEach(function (li) {
      if (li.querySelector('input').checked) {
        var s = li.querySelector('small');
        acoes.push({ titulo: li.querySelector('b').textContent, sub: s ? s.textContent : '' });
      }
    });
    return {
      nome: document.getElementById('nome').value.trim(),
      acoes: acoes,
      texto: document.getElementById('atraindo').value.trim()
    };
  }

  function render() {
    var W = 1080, data = collect();
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');
    c.width = W;
    var H = layout(ctx, W, false, data);
    c.height = H;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    layout(ctx, W, true, data);
    return c;
  }

  document.getElementById('save').addEventListener('click', function () {
    var c = render();
    c.toBlob(function (blob) {
      var file = new File([blob], 'hebreus-11-13-16.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'GAEB · Hebreus 11.13-16' }).catch(function () {});
        return;
      }
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file.name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    }, 'image/png');
  });
})();
