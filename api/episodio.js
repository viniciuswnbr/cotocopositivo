const fs = require('fs');
const path = require('path');

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = (req, res) => {
  const epParam = (req.query && req.query.ep) || '56';
  const epNum = parseInt(String(epParam), 10) || 56;
  const numStr = String(epNum).padStart(3, '0');

  let episode = null;
  try {
    const indexPath = path.join(process.cwd(), 'public', 'data', 'ia-explica', 'index.json');
    const raw = fs.readFileSync(indexPath, 'utf8');
    const data = JSON.parse(raw);
    const list = Array.isArray(data.episodios) ? data.episodios : [];
    episode = list.find((e) => Number(e.numero) === epNum) || list[0] || null;
  } catch (_) {
    episode = null;
  }

  const baseUrl = 'https://cotocopositivo.vercel.app';
  const title = episode
    ? `IA Explica #${numStr}: ${episode.titulo} — @cotocopositivo`
    : `IA Explica #${numStr} — @cotocopositivo`;
  const description = episode && episode.resumo
    ? episode.resumo
    : 'Neurociência, IA e positividade prática em 3 níveis + quiz interativo no portal @cotocopositivo.';
  const imageUrl = `${baseUrl}/assets/thumbs/ep_${numStr}.webp`;
  const canonicalUrl = `${baseUrl}/episodio.html?ep=${numStr}`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
  res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="CotocoPositivo">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
  <meta http-equiv="refresh" content="0;url=/episodio.html?ep=${escapeHtml(numStr)}">
</head>
<body style="background:#0A0E17;color:#F8FAFC;font-family:system-ui,sans-serif;padding:32px;text-align:center;">
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <p><a href="/episodio.html?ep=${escapeHtml(numStr)}" style="color:#00F0FF;">Abrir episódio no portal @cotocopositivo</a></p>
</body>
</html>`);
};
