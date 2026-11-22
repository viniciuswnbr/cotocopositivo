/**
 * js/app.js — Portal @cotocopositivo (ES6+ Vanilla)
 * Termômetro de Impacto, Vitrine IA Explica, Leitor Sincronizado,
 * Quiz Relâmpago + Card Colecionável, Resumo de Bolso (1080x1920) e Biblioteca.
 */

const INDEX_URL = 'public/data/ia-explica/index.json';
const DATA_DIR = 'public/data/ia-explica/';

let episodesCache = [];
let activeTheme = 'Todos';
let ytPlayerInstance = null;
let ytPollInterval = null;
let syncTimerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initPositiveStatus();
  initOracle();
  initRandomGameButton();
  loadPortalData();
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

function addPositiveCoins(amount) {
  const current = Number(localStorage.getItem('cotoco_coins') || 100);
  const updated = current + amount;
  localStorage.setItem('cotoco_coins', String(updated));
  const coinsEl = document.getElementById('user-coins-display');
  if (coinsEl) coinsEl.textContent = String(updated);
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

/* ==========================================================================
   Carregamento Unificado de index.json (Home + Biblioteca)
   ========================================================================== */
async function loadPortalData() {
  const featuredContainer = document.getElementById('ia-featured-episode');
  const gridContainer = document.getElementById('ia-episodes-grid');
  const filterBar = document.getElementById('ia-theme-filters');
  const libraryGrid = document.getElementById('library-books-grid');

  if (!featuredContainer && !libraryGrid) return;

  try {
    const res = await fetch(INDEX_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    episodesCache = Array.isArray(data.episodios) ? data.episodios : [];

    renderImpactThermometer(data, episodesCache);

    if (featuredContainer && gridContainer && filterBar) {
      if (episodesCache.length === 0) {
        featuredContainer.innerHTML = '<p class="section-subtitle">Nenhum episódio publicado ainda.</p>';
      } else {
        const latest = episodesCache[0];
        await renderFeaturedEpisode(featuredContainer, latest);
        renderThemeFilters(filterBar, episodesCache);
        renderEpisodesGrid(gridContainer, episodesCache);
      }
    }

    if (libraryGrid) {
      renderLibraryShelf(libraryGrid, episodesCache);
    }
  } catch (err) {
    const fallbackHtml = `
      <div class="glass-card-subtle">
        <p style="color: var(--gold); font-weight: 700;">Não foi possível carregar os dados de <code>public/data/ia-explica/index.json</code>.</p>
        <p class="section-subtitle">Se você abriu o arquivo via <code>file://</code>, execute um servidor local (ex: <code>npx serve .</code>) ou acesse o portal publicado na Vercel.</p>
      </div>
    `;
    if (featuredContainer) featuredContainer.innerHTML = fallbackHtml;
    if (libraryGrid) libraryGrid.innerHTML = fallbackHtml;
  }
}

/* ==========================================================================
   Termômetro de Impacto Positivo
   ========================================================================== */
function renderImpactThermometer(data, episodes) {
  const epCountEl = document.getElementById('impact-episodes-count');
  const booksCountEl = document.getElementById('impact-books-count');
  const minCountEl = document.getElementById('impact-minutes-count');
  const barFillEl = document.getElementById('impact-bar-fill');
  const updatedEl = document.getElementById('impact-updated-at');

  if (!epCountEl || !booksCountEl || !minCountEl) return;

  const totalEpisodes = episodes.length;
  const uniqueBooks = new Set(
    episodes.map((e) => e.livro_apoio && e.livro_apoio.titulo).filter(Boolean)
  ).size;

  const totalSeconds = episodes.reduce((acc, ep) => acc + parseDurationToSeconds(ep.duracao), 0);
  const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));

  animateCounter(epCountEl, totalEpisodes, 750);
  animateCounter(booksCountEl, uniqueBooks, 850);
  animateCounter(minCountEl, totalMinutes, 1000);

  if (updatedEl && data.atualizado_em) {
    updatedEl.textContent = `Atualizado em ${data.atualizado_em}`;
  }
  if (barFillEl) {
    requestAnimationFrame(() => {
      barFillEl.style.width = `${Math.min(100, Math.max(35, totalEpisodes * 20))}%`;
    });
  }
}

function parseDurationToSeconds(dur) {
  if (!dur || typeof dur !== 'string') return 480;
  const parts = dur.split(':').map(Number);
  if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 480;
}

function animateCounter(el, target, duration) {
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = String(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ==========================================================================
   Episódio em Destaque + Leitor Sincronizado + Quiz Relâmpago
   ========================================================================== */
async function fetchEpisodeDetail(ep) {
  if (!ep || !ep.arquivo) return null;
  try {
    const res = await fetch(`${DATA_DIR}${ep.arquivo}`);
    if (res.ok) return await res.json();
  } catch (_) {
    return null;
  }
  return null;
}

async function renderFeaturedEpisode(container, ep) {
  const numStr = String(ep.numero).padStart(3, '0');
  const detailed = await fetchEpisodeDetail(ep);
  const blocks = buildReaderBlocks(ep, detailed);
  const trainUrl = (ep.ferramenta_treino && ep.ferramenta_treino.url) || 'jogos.html';
  const trainName = (ep.ferramenta_treino && ep.ferramenta_treino.nome) || 'Mini-Game Positivo';

  container.innerHTML = `
    <div class="featured-episode" style="margin-bottom: 0;">
      <div>
        <div class="video-wrapper">
          <iframe
            id="yt-featured-player"
            src="https://www.youtube.com/embed/${encodeURIComponent(ep.youtube_video_id)}?enablejsapi=1&rel=0"
            title="IA Explica #${numStr} - ${escapeHtml(ep.titulo)}"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
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
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 16px;">
          ${escapeHtml(ep.resumo || '')}
        </p>
        <div class="card-actions-row">
          <button class="btn btn-sm" id="toggle-reader-btn">📖 Modo Leitor Sincronizado</button>
          <button class="btn btn-gold btn-sm" id="featured-pocket-btn">📱 Resumo de Bolso (1080x1920)</button>
          <button class="btn btn-ghost btn-sm" id="featured-levels-btn">🧠 3 Níveis & Livro</button>
        </div>
        <div class="card-actions-row" style="margin-top: 10px;">
          <a href="${escapeHtml(trainUrl)}" class="btn btn-emerald btn-sm">🎮 Treinar essa habilidade agora (${escapeHtml(trainName)})</a>
          <a href="teleprompter.html?ep=${ep.numero}" class="btn btn-ghost btn-sm">🎙️ Teleprompter</a>
        </div>
      </div>
    </div>

    <!-- PAINEL DO LEITOR SINCRONIZADO -->
    <div id="reader-sync-panel" class="reader-sync-panel" aria-label="Leitor Sincronizado do Episódio">
      <div class="reader-controls">
        <div>
          <span class="badge">📖 LEITOR SINCRONIZADO</span>
          <span style="font-size: 0.82rem; color: var(--text-muted); margin-left: 8px;">Acompanhe os blocos da história enquanto o vídeo toca</span>
        </div>
        <div class="card-actions-row">
          <button class="btn btn-emerald btn-sm" id="reader-autosync-btn">▶ Auto-Avançar Blocos</button>
          <button class="btn btn-ghost btn-sm" id="reader-close-btn">Fechar</button>
        </div>
      </div>
      <div class="reader-blocks-list" id="reader-blocks-list">
        ${blocks
          .map(
            (b, idx) => `
          <div class="reader-block ${idx === 0 ? 'active' : ''}" data-block-idx="${idx}" data-time="${b.tempo_seg || 0}">
            <div class="reader-block-tag">${escapeHtml(b.bloco)}</div>
            <div class="reader-block-text">${escapeHtml(b.fala)}</div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>

    <!-- QUIZ RELÂMPAGO DE 3 PERGUNTAS (EPISÓDIO EM DESTAQUE) -->
    <div id="featured-quiz-container"></div>
  `;

  initSyncReaderControls(blocks);

  const levelsBtn = document.getElementById('featured-levels-btn');
  if (levelsBtn) levelsBtn.addEventListener('click', () => openEpisodeModal(ep));

  const pocketBtn = document.getElementById('featured-pocket-btn');
  if (pocketBtn) pocketBtn.addEventListener('click', () => downloadPocketSummary(ep, detailed));

  const quizContainer = document.getElementById('featured-quiz-container');
  if (quizContainer) renderQuizSection(quizContainer, ep, detailed);
}

function buildReaderBlocks(ep, detailed) {
  if (detailed && Array.isArray(detailed.roteiro_teleprompter) && detailed.roteiro_teleprompter.length > 0) {
    return detailed.roteiro_teleprompter;
  }
  const niveis = (detailed && detailed.niveis) || ep.niveis || {};
  const ini = typeof niveis.iniciante === 'object' ? niveis.iniciante.texto : niveis.iniciante;
  const sab = typeof niveis.sabio === 'object' ? niveis.sabio.texto : niveis.sabio;
  const mes = typeof niveis.mestre_positivo === 'object' ? niveis.mestre_positivo.texto : niveis.mestre_positivo;
  return [
    { bloco: 'ABERTURA', tempo_seg: 0, fala: ep.resumo || ep.titulo },
    { bloco: 'NÍVEL 1 • INICIANTE', tempo_seg: 25, fala: ini || '' },
    { bloco: 'NÍVEL 2 • SÁBIO', tempo_seg: 65, fala: sab || '' },
    { bloco: 'NÍVEL 3 • MESTRE POSITIVO', tempo_seg: 120, fala: mes || '' }
  ];
}

function initSyncReaderControls(blocks) {
  const panel = document.getElementById('reader-sync-panel');
  const toggleBtn = document.getElementById('toggle-reader-btn');
  const closeBtn = document.getElementById('reader-close-btn');
  const autoBtn = document.getElementById('reader-autosync-btn');
  const blockEls = Array.from(document.querySelectorAll('#reader-blocks-list .reader-block'));
  if (!panel || !toggleBtn) return;

  let currentIndex = 0;

  const setActiveBlock = (idx) => {
    currentIndex = Math.max(0, Math.min(blocks.length - 1, idx));
    blockEls.forEach((el, i) => el.classList.toggle('active', i === currentIndex));
    if (blockEls[currentIndex]) {
      blockEls[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      initYouTubeSyncListener(blocks, setActiveBlock);
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('open');
      stopAutoSync(autoBtn);
    });
  }

  blockEls.forEach((el, idx) => {
    el.addEventListener('click', () => {
      setActiveBlock(idx);
      const sec = Number(el.getAttribute('data-time') || 0);
      if (ytPlayerInstance && typeof ytPlayerInstance.seekTo === 'function') {
        ytPlayerInstance.seekTo(sec, true);
      }
    });
  });

  if (autoBtn) {
    autoBtn.addEventListener('click', () => {
      if (syncTimerInterval) {
        stopAutoSync(autoBtn);
      } else {
        autoBtn.textContent = '⏸ Pausar Auto-Avanço';
        syncTimerInterval = setInterval(() => {
          setActiveBlock((currentIndex + 1) % blocks.length);
        }, 7000);
      }
    });
  }
}

function stopAutoSync(autoBtn) {
  if (syncTimerInterval) {
    clearInterval(syncTimerInterval);
    syncTimerInterval = null;
  }
  if (autoBtn) autoBtn.textContent = '▶ Auto-Avançar Blocos';
}

function initYouTubeSyncListener(blocks, setActiveBlock) {
  if (ytPollInterval) return;
  if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }
  const attach = () => {
    if (!window.YT || !window.YT.Player || ytPlayerInstance) return;
    ytPlayerInstance = new window.YT.Player('yt-featured-player', {
      events: {
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            clearInterval(ytPollInterval);
            ytPollInterval = setInterval(() => {
              if (!ytPlayerInstance || typeof ytPlayerInstance.getCurrentTime !== 'function') return;
              const t = ytPlayerInstance.getCurrentTime();
              let found = 0;
              blocks.forEach((b, i) => {
                if (t >= (b.tempo_seg || 0)) found = i;
              });
              setActiveBlock(found);
            }, 900);
          } else {
            clearInterval(ytPollInterval);
            ytPollInterval = null;
          }
        }
      }
    });
  };
  if (window.YT && window.YT.Player) {
    attach();
  } else {
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevReady === 'function') prevReady();
      attach();
    };
  }
}

/* ==========================================================================
   Filtros & Grid de Episódios
   ========================================================================== */
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
      const trainUrl = (ep.ferramenta_treino && ep.ferramenta_treino.url) || 'jogos.html';
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
          <div>
            <div style="font-size: 0.78rem; color: var(--emerald); font-weight: 700; margin-bottom: 10px;">
              🎨 ${escapeHtml(ep.estilo_visual)} • ⏱️ ${escapeHtml(ep.duracao || '')}
            </div>
            <div class="card-actions-row" style="padding-top: 10px; border-top: 1px solid var(--border-subtle);">
              <button class="btn btn-sm" data-ep="${ep.numero}">3 Níveis & Quiz</button>
              <button class="btn btn-gold btn-sm" data-pocket="${ep.numero}">📱 1080x1920</button>
              <a href="${escapeHtml(trainUrl)}" class="btn btn-emerald btn-sm">🎮 Treinar essa habilidade agora</a>
              <a href="teleprompter.html?ep=${ep.numero}" class="btn btn-ghost btn-sm">🎙️ Teleprompter</a>
            </div>
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

  container.querySelectorAll('button[data-pocket]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const num = Number(btn.getAttribute('data-pocket'));
      const ep = episodesCache.find((item) => item.numero === num);
      if (!ep) return;
      const detailed = await fetchEpisodeDetail(ep);
      downloadPocketSummary(ep, detailed);
    });
  });
}

/* ==========================================================================
   Modal 3 Níveis + Quiz Relâmpago + Card Colecionável
   ========================================================================== */
async function openEpisodeModal(ep) {
  const modal = document.getElementById('episode-modal');
  const body = document.getElementById('episode-modal-body');
  if (!modal || !body) return;

  modal.classList.add('open');
  body.innerHTML = '<p style="color: var(--cyan);">Carregando os 3 Níveis e Quiz do episódio...</p>';

  const detailed = await fetchEpisodeDetail(ep);
  const niveis = (detailed && detailed.niveis) || ep.niveis || {};
  const livro = (detailed && detailed.livro_apoio) || ep.livro_apoio || null;
  const numStr = String(ep.numero).padStart(3, '0');
  const trainUrl = (ep.ferramenta_treino && ep.ferramenta_treino.url) || 'jogos.html';

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

    <div class="card-actions-row" style="margin-top: 18px;">
      <button class="btn btn-gold btn-sm" id="modal-pocket-btn">📱 Baixar Resumo de Bolso (1080x1920)</button>
      <a href="${escapeHtml(trainUrl)}" class="btn btn-emerald btn-sm">🎮 Treinar essa habilidade agora</a>
      <a href="teleprompter.html?ep=${ep.numero}" class="btn btn-sm">🎙️ Teleprompter</a>
      <a href="https://www.youtube.com/watch?v=${encodeURIComponent(ep.youtube_video_id)}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">▶ YouTube</a>
    </div>

    <div id="modal-quiz-container"></div>
  `;

  const pocketBtn = document.getElementById('modal-pocket-btn');
  if (pocketBtn) pocketBtn.addEventListener('click', () => downloadPocketSummary(ep, detailed));

  const quizContainer = document.getElementById('modal-quiz-container');
  if (quizContainer) renderQuizSection(quizContainer, ep, detailed);
}

/* ==========================================================================
   Quiz Relâmpago (3 Perguntas) + Card Colecionável Digital
   ========================================================================== */
function renderQuizSection(container, ep, detailed) {
  const questions = (detailed && detailed.quiz_questions) || ep.quiz_questions || [];
  if (questions.length === 0) {
    container.innerHTML = '';
    return;
  }

  const numStr = String(ep.numero).padStart(3, '0');
  const state = { answered: 0, correct: 0 };

  container.innerHTML = `
    <div class="quiz-box">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <div>
          <span class="badge badge-gold">⚡ QUIZ RELÂMPAGO • EP #${numStr}</span>
          <h4 style="margin-top: 6px; font-size: 1.05rem;">Responda 3 perguntas para desbloquear seu Card Colecionável Digital</h4>
        </div>
        <span class="stat-pill stat-pill-cyan" data-quiz-score>0 / ${questions.length} acertos</span>
      </div>

      <div class="quiz-questions-list">
        ${questions
          .map(
            (q, qIdx) => `
          <div class="quiz-question-card" data-q="${qIdx}">
            <div style="font-weight: 700; font-size: 0.94rem;">${qIdx + 1}. ${escapeHtml(q.pergunta)}</div>
            <div class="quiz-options">
              ${q.opcoes
                .map(
                  (opt, oIdx) =>
                    `<button class="quiz-option" data-q="${qIdx}" data-opt="${oIdx}">${escapeHtml(opt)}</button>`
                )
                .join('')}
            </div>
            <div class="quiz-feedback" data-feedback="${qIdx}"></div>
          </div>
        `
          )
          .join('')}
      </div>

      <div class="quiz-result-area" style="margin-top: 14px;"></div>
    </div>
  `;

  const scoreBadge = container.querySelector('[data-quiz-score]');
  const resultArea = container.querySelector('.quiz-result-area');

  container.querySelectorAll('.quiz-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      const qIdx = Number(btn.getAttribute('data-q'));
      const optIdx = Number(btn.getAttribute('data-opt'));
      const qCard = container.querySelector(`.quiz-question-card[data-q="${qIdx}"]`);
      if (!qCard || qCard.dataset.done === '1') return;

      qCard.dataset.done = '1';
      state.answered += 1;

      const qData = questions[qIdx];
      const isRight = optIdx === qData.correta;
      if (isRight) state.correct += 1;

      qCard.querySelectorAll('.quiz-option').forEach((b, idx) => {
        b.disabled = true;
        if (idx === qData.correta) b.classList.add('correct');
        else if (idx === optIdx && !isRight) b.classList.add('wrong');
      });

      const fb = qCard.querySelector(`[data-feedback="${qIdx}"]`);
      if (fb) {
        fb.textContent = `${isRight ? '✅ Correto!' : '💡 Quase!'} ${qData.explicacao || ''}`;
        fb.style.color = isRight ? 'var(--emerald)' : 'var(--gold)';
      }

      if (scoreBadge) scoreBadge.textContent = `${state.correct} / ${questions.length} acertos`;

      if (state.answered === questions.length) {
        showQuizOutcome(resultArea, ep, state.correct, questions.length, () => {
          renderQuizSection(container, ep, detailed);
        });
      }
    });
  });
}

function showQuizOutcome(resultArea, ep, correct, total, onRetry) {
  if (correct >= 2) {
    const unlocked = JSON.parse(localStorage.getItem('cotoco_unlocked_cards') || '[]');
    if (!unlocked.includes(ep.numero)) {
      unlocked.push(ep.numero);
      localStorage.setItem('cotoco_unlocked_cards', JSON.stringify(unlocked));
      addPositiveCoins(20);
    }

    const svgMarkup = buildCollectibleSvg(ep);
    resultArea.innerHTML = `
      <div class="collectible-wrap">
        <div style="flex: 1; min-width: 220px;">
          <span class="badge badge-emerald">🏆 CARD COLECIONÁVEL DESBLOQUEADO!</span>
          <h4 style="margin: 8px 0 6px; font-size: 1.1rem;">Você acertou ${correct} de ${total} perguntas!</h4>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 12px;">
            +20 Moedas Positivas creditadas. Baixe seu Card Colecionável Digital do episódio #${String(ep.numero).padStart(3, '0')}.
          </p>
          <div class="card-actions-row">
            <button class="btn btn-gold btn-sm" data-dl-card-png>⬇️ Baixar Card (PNG)</button>
            <button class="btn btn-ghost btn-sm" data-dl-card-svg>⬇️ Baixar Vetor (SVG)</button>
          </div>
        </div>
        <div class="collectible-preview">${svgMarkup}</div>
      </div>
    `;

    resultArea.querySelector('[data-dl-card-png]').addEventListener('click', () => {
      downloadSvgAsPng(svgMarkup, `card-cotocopositivo-ep-${String(ep.numero).padStart(3, '0')}.png`, 600, 820);
    });
    resultArea.querySelector('[data-dl-card-svg]').addEventListener('click', () => {
      const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      triggerDownload(URL.createObjectURL(blob), `card-cotocopositivo-ep-${String(ep.numero).padStart(3, '0')}.svg`);
    });
  } else {
    resultArea.innerHTML = `
      <div class="glass-card-subtle" style="border-color: rgba(255, 215, 0, 0.35);">
        <p style="font-weight: 700; color: var(--gold);">Você acertou ${correct} de ${total}. Acerte pelo menos 2 para desbloquear o Card Colecionável!</p>
        <button class="btn btn-sm" style="margin-top: 10px;" data-retry-quiz>🔄 Tentar Novamente</button>
      </div>
    `;
    resultArea.querySelector('[data-retry-quiz]').addEventListener('click', onRetry);
  }
}

function buildCollectibleSvg(ep) {
  const numStr = String(ep.numero).padStart(3, '0');
  const safeTitle = escapeHtml(ep.titulo).slice(0, 56);
  const safeTheme = escapeHtml(ep.tema || 'IA Explica');
  const safeBook = escapeHtml((ep.livro_apoio && ep.livro_apoio.titulo) || 'Curadoria Cotoco');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 492" width="100%" height="auto">
    <defs>
      <linearGradient id="cardBg_${numStr}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0A0E17"/>
        <stop offset="55%" stop-color="#111C33"/>
        <stop offset="100%" stop-color="#0A1424"/>
      </linearGradient>
      <linearGradient id="cardBorder_${numStr}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#00F0FF"/>
        <stop offset="50%" stop-color="#10B981"/>
        <stop offset="100%" stop-color="#FFD700"/>
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="352" height="484" rx="22" fill="url(#cardBg_${numStr})" stroke="url(#cardBorder_${numStr})" stroke-width="4"/>
    <rect x="20" y="20" width="142" height="28" rx="14" fill="rgba(255,215,0,0.16)" stroke="#FFD700" stroke-width="1.2"/>
    <text x="91" y="38" fill="#FFD700" font-family="system-ui,sans-serif" font-size="12" font-weight="800" text-anchor="middle">IA EXPLICA #${numStr}</text>
    <rect x="218" y="20" width="122" height="28" rx="14" fill="rgba(16,185,129,0.16)" stroke="#10B981" stroke-width="1.2"/>
    <text x="279" y="38" fill="#10B981" font-family="system-ui,sans-serif" font-size="11" font-weight="800" text-anchor="middle">DESBLOQUEADO</text>

    <!-- Mascote Robótico Vetorial @cotocopositivo -->
    <g transform="translate(80, 56) scale(0.9)">
      <path d="M110 30C100 16 88 21 92 7C106 9 110 21 110 30Z" fill="#10B981"/>
      <path d="M110 30C120 16 132 21 128 7C114 9 110 21 110 30Z" fill="#34D399"/>
      <circle cx="110" cy="32" r="6" fill="#FFD700"/>
      <line x1="110" y1="36" x2="110" y2="54" stroke="#00F0FF" stroke-width="4" stroke-linecap="round"/>
      <rect x="60" y="54" width="100" height="72" rx="26" fill="#152036" stroke="#00F0FF" stroke-width="3.5"/>
      <rect x="70" y="64" width="80" height="50" rx="16" fill="#0A0E17" stroke="#00F0FF" stroke-width="2"/>
      <ellipse cx="90" cy="86" rx="8" ry="10" fill="#00F0FF"/>
      <ellipse cx="130" cy="86" rx="8" ry="10" fill="#00F0FF"/>
      <path d="M98 99Q110 108 122 99" stroke="#10B981" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <rect x="68" y="136" width="84" height="62" rx="22" fill="#152036" stroke="#00F0FF" stroke-width="3.5"/>
      <rect x="88" y="150" width="44" height="28" rx="9" fill="#0A0E17" stroke="#10B981" stroke-width="2"/>
      <polygon points="112,154 103,165 110,165 107,174 118,162 111,162" fill="#FFD700"/>
      <path d="M152 150L174 134L184 114" stroke="#00F0FF" stroke-width="5" stroke-linecap="round"/>
      <circle cx="185" cy="110" r="9" fill="#10B981" stroke="#00F0FF" stroke-width="2"/>
    </g>

    <rect x="22" y="256" width="316" height="170" rx="16" fill="rgba(10,14,23,0.78)" stroke="rgba(0,240,255,0.3)" stroke-width="1.5"/>
    <text x="180" y="286" fill="#00F0FF" font-family="system-ui,sans-serif" font-size="12" font-weight="800" text-anchor="middle">${safeTheme.toUpperCase()}</text>
    <foreignObject x="34" y="296" width="292" height="72">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color:#F8FAFC;font-family:system-ui,sans-serif;font-size:15px;font-weight:800;line-height:1.3;text-align:center;">
        ${safeTitle}
      </div>
    </foreignObject>
    <text x="180" y="390" fill="#94A3B8" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle">LIVRO DE APOIO</text>
    <text x="180" y="410" fill="#FFD700" font-family="system-ui,sans-serif" font-size="13" font-weight="700" text-anchor="middle">${safeBook}</text>

    <text x="180" y="460" fill="#94A3B8" font-family="system-ui,sans-serif" font-size="12" font-weight="700" text-anchor="middle">@cotocopositivo • Card Colecionável</text>
  </svg>`;
}

function downloadSvgAsPng(svgString, filename, width, height) {
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => {
      if (blob) triggerDownload(URL.createObjectURL(blob), filename);
    }, 'image/png');
  };
  img.src = url;
}

/* ==========================================================================
   Resumo de Bolso (1080x1920) via HTML5 Canvas
   ========================================================================== */
function downloadPocketSummary(ep, detailed) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  // Fundo escuro futurista
  const bg = ctx.createLinearGradient(0, 0, 1080, 1920);
  bg.addColorStop(0, '#0A0E17');
  bg.addColorStop(0.5, '#0F172A');
  bg.addColorStop(1, '#080C14');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1920);

  // Moldura neon
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 4;
  roundRect(ctx, 32, 32, 1016, 1856, 36, false, true);

  // Cabeçalho
  ctx.fillStyle = '#FFD700';
  ctx.font = '800 28px system-ui, sans-serif';
  ctx.fillText(`@COTOCOPOSITIVO • IA EXPLICA #${String(ep.numero).padStart(3, '0')}`, 72, 104);

  // Mascote robótico minimalista no canto superior direito
  drawCanvasMascot(ctx, 880, 74, 0.72);

  // Título do Episódio
  ctx.fillStyle = '#F8FAFC';
  ctx.font = '900 44px system-ui, sans-serif';
  let y = wrapCanvasText(ctx, ep.titulo, 72, 178, 760, 54);

  // Seção 3 Níveis
  y += 30;
  ctx.fillStyle = '#00F0FF';
  ctx.font = '800 28px system-ui, sans-serif';
  ctx.fillText('OS 3 NÍVEIS DO EPISÓDIO', 72, y);
  y += 24;

  const niveis = (detailed && detailed.niveis) || ep.niveis || {};
  const levelItems = [
    { label: 'NIVEL 1 • INICIANTE', color: '#00F0FF', text: typeof niveis.iniciante === 'object' ? niveis.iniciante.texto : niveis.iniciante },
    { label: 'NÍVEL 2 • SÁBIO', color: '#10B981', text: typeof niveis.sabio === 'object' ? niveis.sabio.texto : niveis.sabio },
    { label: 'NÍVEL 3 • MESTRE POSITIVO', color: '#FFD700', text: typeof niveis.mestre_positivo === 'object' ? niveis.mestre_positivo.texto : niveis.mestre_positivo }
  ];

  levelItems.forEach((item) => {
    ctx.fillStyle = 'rgba(16, 23, 38, 0.9)';
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 3;
    roundRect(ctx, 72, y, 936, 200, 20, true, true);

    ctx.fillStyle = item.color;
    ctx.font = '800 24px system-ui, sans-serif';
    ctx.fillText(item.label, 100, y + 42);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '500 24px system-ui, sans-serif';
    wrapCanvasText(ctx, item.text || '', 100, y + 84, 880, 32, 3);
    y += 220;
  });

  // Seção 4 Pilares do Livro
  y += 24;
  const livro = (detailed && detailed.livro_apoio) || ep.livro_apoio || {};
  const pilares = Array.isArray(livro.pilares) && livro.pilares.length > 0
    ? livro.pilares
    : [
        '1. Clareza de intenção e ambiente favorável.',
        '2. Microações consistentes de 2 minutos.',
        '3. Feedback imediato com dopamina limpa.',
        '4. Revisão diária com foco no essencial.'
      ];

  ctx.fillStyle = '#FFD700';
  ctx.font = '800 28px system-ui, sans-serif';
  ctx.fillText(`OS 4 PILARES DO LIVRO: ${(livro.titulo || 'Curadoria').toUpperCase()}`, 72, y);
  y += 24;

  pilares.slice(0, 4).forEach((pilar) => {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
    ctx.lineWidth = 2;
    roundRect(ctx, 72, y, 936, 118, 16, true, true);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '600 25px system-ui, sans-serif';
    wrapCanvasText(ctx, pilar, 100, y + 48, 880, 34, 2);
    y += 136;
  });

  // Rodapé
  ctx.fillStyle = '#94A3B8';
  ctx.font = '700 24px system-ui, sans-serif';
  ctx.fillText('RESUMO DE BOLSO • PORTAL @COTOCOPOSITIVO • NEUROCIÊNCIA & IA', 72, 1848);

  canvas.toBlob((blob) => {
    if (blob) {
      triggerDownload(
        URL.createObjectURL(blob),
        `resumo-bolso-ep-${String(ep.numero).padStart(3, '0')}-1080x1920.png`
      );
    }
  }, 'image/png');
}

function drawCanvasMascot(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#152036';
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 4;
  roundRect(ctx, 0, 20, 110, 80, 24, true, true);
  ctx.fillStyle = '#0A0E17';
  roundRect(ctx, 12, 32, 86, 54, 16, true, true);
  ctx.fillStyle = '#00F0FF';
  ctx.beginPath();
  ctx.arc(36, 56, 8, 0, Math.PI * 2);
  ctx.arc(74, 56, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(55, 66, 14, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 10) {
  const words = String(text).split(/\s+/);
  let line = '';
  let lineCount = 0;

  for (let i = 0; i < words.length; i += 1) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = words[i];
      y += lineHeight;
      lineCount += 1;
      if (lineCount >= maxLines - 1) break;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ==========================================================================
   Estante Automática de Livros (/biblioteca.html)
   ========================================================================== */
function renderLibraryShelf(container, episodes) {
  const books = episodes.filter((ep) => ep.livro_apoio && ep.livro_apoio.titulo);
  if (books.length === 0) {
    container.innerHTML = '<p class="section-subtitle">Nenhum livro encontrado no momento.</p>';
    return;
  }

  container.innerHTML = books
    .map((ep) => {
      const livro = ep.livro_apoio;
      const numStr = String(ep.numero).padStart(3, '0');
      const pilares = Array.isArray(livro.pilares) ? livro.pilares : [];
      const trainUrl = (ep.ferramenta_treino && ep.ferramenta_treino.url) || 'jogos.html';

      return `
        <article class="glass-card-subtle book-card">
          <div>
            <div class="ep-meta-row">
              <span class="badge badge-gold">EP #${numStr}</span>
              <span class="badge">${escapeHtml(ep.tema)}</span>
            </div>
            <h3 style="font-size: 1.2rem;">${escapeHtml(livro.titulo)}</h3>
            <div style="font-size: 0.88rem; color: var(--gold); font-weight: 700; margin-top: 2px;">
              por ${escapeHtml(livro.autor || 'Autor recomendado')}
            </div>

            <div style="font-size: 0.74rem; font-weight: 800; color: var(--cyan); letter-spacing: 0.08em; margin-top: 14px;">
              OS 4 PILARES DA OBRA
            </div>
            <ul class="pillars-list">
              ${pilares.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
            </ul>
          </div>

          <div class="card-actions-row" style="padding-top: 12px; border-top: 1px solid var(--border-subtle);">
            <a href="${escapeHtml(livro.url)}" target="_blank" rel="noopener" class="btn btn-gold btn-sm">
              Comprar na ${escapeHtml(livro.plataforma || 'Amazon')} ↗
            </a>
            <button class="btn btn-sm" data-lib-pocket="${ep.numero}">📱 Bolso 1080x1920</button>
            <a href="${escapeHtml(trainUrl)}" class="btn btn-emerald btn-sm">🎮 Treinar</a>
          </div>
        </article>
      `;
    })
    .join('');

  container.querySelectorAll('button[data-lib-pocket]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const num = Number(btn.getAttribute('data-lib-pocket'));
      const ep = episodesCache.find((item) => item.numero === num);
      if (!ep) return;
      const detailed = await fetchEpisodeDetail(ep);
      downloadPocketSummary(ep, detailed);
    });
  });
}

/* ==========================================================================
   Eventos do Modal & Utilitários
   ========================================================================== */
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
