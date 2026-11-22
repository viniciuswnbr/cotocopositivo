/**
 * js/app.js — Portal @cotocopositivo (ES6+ Vanilla)
 * Vitrine automática do "IA Explica", Oráculo da IA, Estado Positivo e Navegação.
 */

const INDEX_URL = 'public/data/ia-explica/index.json';
const DATA_DIR = 'public/data/ia-explica/';

let episodesCache = [];
let activeTheme = 'Todos';

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initPositiveStatus();
  initOracle();
  initRandomGameButton();
  loadIaExplicaShowcase();
});

function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });
}

function initPositiveStatus() {
  const streakEl = document.getElementById('streak-counter-display');
  const coinsEl = document.getElementById('user-coins-display');
  if (!streakEl || !coinsEl) return;

  const streak = Number(localStorage.getItem('cotoco_streak') || 1);
  const coins = Number(localStorage.getItem('cotoco_coins') || 100);
  streakEl.textContent = String(streak);
  coinsEl.textContent = String(coins);
}

function initRandomGameButton() {
  const btn = document.getElementById('random-game-btn');
  if (!btn) return;
  const games = [
    'ferramentas/stop.html',
    'ferramentas/forca.html',
    'ferramentas/memoria.html',
    'ferramentas/quiz.html',
    'ferramentas/game.html',
    'ferramentas/magic.html',
    'ferramentas/simulacao.html',
    'ferramentas/cacapalavras.html',
    'ferramentas/biscoito.html',
    'ferramentas/wordle.html',
    'ferramentas/catcher.html',
    'ferramentas/roleta.html'
  ];
  btn.addEventListener('click', () => {
    const picked = games[Math.floor(Math.random() * games.length)];
    window.location.href = picked;
  });
}

function initOracle() {
  const input = document.getElementById('oracle-input');
  const btn = document.getElementById('oracle-btn');
  const box = document.getElementById('oracle-result-box');
  const text = document.getElementById('oracle-text');
  if (!input || !btn || !box || !text) return;

  const respostas = [
    {
      keys: ['ansios', 'nervos', 'preocup', 'medo', 'pânico'],
      msg: 'Protocolo Calma Imediata: inspire por 4s, segure 4s e solte por 6s (3 ciclos). Depois, abra o Momento Mágico para ancorar o foco no presente.'
    },
    {
      keys: ['cansad', 'exaust', 'sono', 'sem energia', 'desanim'],
      msg: 'Recarga Bio-Tech: beba 300ml de água, olhe para a luz natural por 2 minutos e execute uma microação de 90 segundos sem cobrança.'
    },
    {
      keys: ['foco', 'distra', 'mente cheia', 'procrastin', 'pressa'],
      msg: 'Modo Foco Único: escolha apenas UMA tarefa de 5 minutos agora. Silencie notificações e use o Termo Positivo como aquecimento cognitivo.'
    },
    {
      keys: ['insegur', 'triste', 'sozinho', 'culpa'],
      msg: 'Reenquadramento Positivo: lembre-se de que progresso não exige perfeição. Registre uma pequena vitória de hoje no Mural da Comunidade.'
    }
  ];

  const consult = () => {
    const q = input.value.toLowerCase().trim();
    const match = respostas.find((r) => r.keys.some((k) => q.includes(k)));
    text.textContent = match
      ? match.msg
      : 'Calibração Neural Cotoco: faça uma pausa consciente de 60 segundos, organize sua próxima prioridade em 1 frase curta e escolha um dos 12 jogos para renovar sua dopamina limpa.';
    box.style.display = 'block';
  };

  btn.addEventListener('click', consult);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') consult();
  });
}

async function loadIaExplicaShowcase() {
  const featuredContainer = document.getElementById('ia-featured-episode');
  const gridContainer = document.getElementById('ia-episodes-grid');
  const filterBar = document.getElementById('ia-theme-filters');
  if (!featuredContainer || !gridContainer || !filterBar) return;

  try {
    const res = await fetch(INDEX_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    episodesCache = Array.isArray(data.episodios) ? data.episodios : [];

    if (episodesCache.length === 0) {
      featuredContainer.innerHTML = '<p class="section-subtitle">Nenhum episódio publicado ainda.</p>';
      return;
    }

    const latest = episodesCache[0];
    renderFeaturedEpisode(featuredContainer, latest);
    renderThemeFilters(filterBar, episodesCache);
    renderEpisodesGrid(gridContainer, episodesCache);
  } catch (err) {
    featuredContainer.innerHTML = `
      <div class="glass-card-subtle">
        <p style="color: var(--gold); font-weight: 700;">Não foi possível carregar os episódios automaticamente.</p>
        <p class="section-subtitle">Se você abriu o arquivo via <code>file://</code>, use um servidor local (ex: <code>npx serve</code>) ou acesse o portal publicado na Vercel.</p>
      </div>
    `;
  }
}

function renderFeaturedEpisode(container, ep) {
  const numStr = String(ep.numero).padStart(3, '0');
  container.innerHTML = `
    <div class="video-wrapper">
      <iframe
        src="https://www.youtube.com/embed/${encodeURIComponent(ep.youtube_video_id)}?rel=0"
        title="IA Explica #${numStr} - ${escapeHtml(ep.titulo)}"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>
    <div>
      <div class="ep-meta-row">
        <span class="badge badge-gold">🔥 Mais Recente • EP #${numStr}</span>
        <span class="badge">${escapeHtml(ep.tema)}</span>
        <span class="badge badge-emerald">${escapeHtml(ep.estilo_visual)}</span>
      </div>
      <h3 style="font-size: 1.45rem; line-height: 1.25; margin-bottom: 10px;">
        ${escapeHtml(ep.titulo)}
      </h3>
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 18px;">
        ${escapeHtml(ep.resumo || '')}
      </p>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn" id="featured-levels-btn">🧠 Ver 3 Níveis & Livro</button>
        <a href="teleprompter.html?ep=${ep.numero}" class="btn btn-ghost">🎙️ Abrir no Teleprompter</a>
      </div>
    </div>
  `;

  const btn = document.getElementById('featured-levels-btn');
  if (btn) {
    btn.addEventListener('click', () => openEpisodeModal(ep));
  }
}

function renderThemeFilters(container, episodes) {
  const themes = ['Todos', ...new Set(episodes.map((e) => e.tema).filter(Boolean))];
  container.innerHTML = themes
    .map(
      (t) =>
        `<button class="filter-chip ${t === activeTheme ? 'active' : ''}" data-theme="${escapeHtml(t)}">${escapeHtml(t)}</button>`
    )
    .join('');

  container.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      activeTheme = chip.getAttribute('data-theme');
      renderThemeFilters(container, episodes);
      const grid = document.getElementById('ia-episodes-grid');
      if (grid) renderEpisodesGrid(grid, episodes);
    });
  });
}

function renderEpisodesGrid(container, episodes) {
  const filtered =
    activeTheme === 'Todos'
      ? episodes
      : episodes.filter((e) => e.tema === activeTheme);

  if (filtered.length === 0) {
    container.innerHTML = '<p class="section-subtitle">Nenhum episódio encontrado para este tema.</p>';
    return;
  }

  container.innerHTML = filtered
    .map((ep) => {
      const numStr = String(ep.numero).padStart(3, '0');
      return `
        <article class="glass-card-subtle episode-card">
          <div>
            <div class="ep-meta-row">
              <span class="badge badge-gold">EP #${numStr}</span>
              <span class="badge">${escapeHtml(ep.tema)}</span>
            </div>
            <h3>${escapeHtml(ep.titulo)}</h3>
            <p style="margin-top: 8px;">${escapeHtml(ep.resumo || '')}</p>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
            <span style="font-size: 0.78rem; color: var(--emerald); font-weight: 700;">🎨 ${escapeHtml(ep.estilo_visual)}</span>
            <button class="btn btn-sm" data-ep="${ep.numero}">3 Níveis & Livro</button>
          </div>
        </article>
      `;
    })
    .join('');

  container.querySelectorAll('button[data-ep]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const num = Number(btn.getAttribute('data-ep'));
      const ep = episodesCache.find((item) => item.numero === num);
      if (ep) openEpisodeModal(ep);
    });
  });
}

async function openEpisodeModal(ep) {
  const modal = document.getElementById('episode-modal');
  const body = document.getElementById('episode-modal-body');
  if (!modal || !body) return;

  modal.classList.add('open');
  body.innerHTML = '<p style="color: var(--cyan);">Carregando os 3 Níveis do episódio...</p>';

  let detailed = null;
  if (ep.arquivo) {
    try {
      const res = await fetch(`${DATA_DIR}${ep.arquivo}`);
      if (res.ok) detailed = await res.json();
    } catch (_) {
      detailed = null;
    }
  }

  const niveis = (detailed && detailed.niveis) || ep.niveis || {};
  const livro = (detailed && detailed.livro_apoio) || ep.livro_apoio || null;
  const numStr = String(ep.numero).padStart(3, '0');

  const iniText = typeof niveis.iniciante === 'object' ? niveis.iniciante.texto : niveis.iniciante;
  const sabText = typeof niveis.sabio === 'object' ? niveis.sabio.texto : niveis.sabio;
  const mesText = typeof niveis.mestre_positivo === 'object' ? niveis.mestre_positivo.texto : niveis.mestre_positivo;

  body.innerHTML = `
    <div class="ep-meta-row">
      <span class="badge badge-gold">IA Explica #${numStr}</span>
      <span class="badge">${escapeHtml(ep.tema)}</span>
      <span class="badge badge-emerald">${escapeHtml(ep.estilo_visual)}</span>
    </div>
    <h2 style="font-size: 1.35rem; margin-bottom: 16px;">${escapeHtml(ep.titulo)}</h2>

    <div class="level-box">
      <h4 style="color: var(--cyan);">🌱 Nível 1 • Iniciante</h4>
      <p>${escapeHtml(iniText || 'Resumo em preparação.')}</p>
    </div>

    <div class="level-box sabio">
      <h4 style="color: var(--emerald);">🦉 Nível 2 • Sábio</h4>
      <p>${escapeHtml(sabText || 'Resumo em preparação.')}</p>
    </div>

    <div class="level-box mestre">
      <h4 style="color: var(--gold);">⚡ Nível 3 • Mestre Positivo</h4>
      <p>${escapeHtml(mesText || 'Resumo em preparação.')}</p>
    </div>

    ${
      livro
        ? `
      <div class="book-banner">
        <div>
          <div style="font-size: 0.74rem; font-weight: 800; color: var(--gold); letter-spacing: 0.08em;">📚 LIVRO RECOMENDADO</div>
          <div style="font-weight: 800; font-size: 1.02rem; margin-top: 2px;">${escapeHtml(livro.titulo)}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(livro.autor || '')}</div>
        </div>
        <a href="${escapeHtml(livro.url)}" target="_blank" rel="noopener" class="btn btn-gold btn-sm">
          Ver na ${escapeHtml(livro.plataforma || 'Amazon')} ↗
        </a>
      </div>
    `
        : ''
    }

    <div style="margin-top: 18px; display: flex; gap: 10px; flex-wrap: wrap;">
      <a href="teleprompter.html?ep=${ep.numero}" class="btn btn-sm">🎙️ Abrir Roteiro no Teleprompter</a>
      <a href="https://www.youtube.com/watch?v=${encodeURIComponent(ep.youtube_video_id)}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">▶ Assistir no YouTube</a>
    </div>
  `;
}

document.addEventListener('click', (e) => {
  const modal = document.getElementById('episode-modal');
  if (!modal) return;
  if (e.target.id === 'episode-modal' || e.target.id === 'episode-modal-close') {
    modal.classList.remove('open');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('episode-modal');
    if (modal) modal.classList.remove('open');
  }
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
