const CACHE_NAME = 'cotocopositivo-pwa-v2';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/episodio.html',
  '/biblioteca.html',
  '/jogos.html',
  '/desafio-30-dias.html',
  '/certificado.html',
  '/sobre.html',
  '/comunidade.html',
  '/ebook.html',
  '/links.html',
  '/teleprompter.html',
  '/css/style.css',
  '/js/app.js',
  '/cotoco-share.js',
  '/manifest.json',
  '/assets/icons/icon-mascot.svg',
  '/public/data/ia-explica/index.json',
  '/public/data/ia-explica/ep_056.json',
  '/ferramentas/index.html',
  '/ferramentas/biscoito.html',
  '/ferramentas/cacapalavras.html',
  '/ferramentas/catcher.html',
  '/ferramentas/forca.html',
  '/ferramentas/game.html',
  '/ferramentas/magic.html',
  '/ferramentas/memoria.html',
  '/ferramentas/quiz.html',
  '/ferramentas/roleta.html',
  '/ferramentas/simulacao.html',
  '/ferramentas/stop.html',
  '/ferramentas/wordle.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        CORE_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Estratégia Network-First para dados JSON dos episódios e páginas HTML
  if (url.pathname.startsWith('/public/data/') || req.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req, { ignoreSearch: true });
          if (cached) return cached;
          if (req.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // Estratégia Stale-While-Revalidate para CSS, JS, ícones e mini-games
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.ok) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
