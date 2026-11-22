# @cotocopositivo — Portal Oficial (Jamstack)

Portal oficial do ecossistema **@cotocopositivo**, construído em **HTML5 + CSS3 + JavaScript Vanilla (ES6+)** puro, sem frameworks ou dependências pesadas, pronto para deploy instantâneo na **Vercel** via GitHub com URLs limpas (`"cleanUrls": true`).

## Funcionalidades Principais

- **Termômetro de Impacto Positivo (`index.html`):** lê `public/data/ia-explica/index.json` e anima contadores com o total de histórias reais publicadas, livros recomendados e minutos de aprendizado positivo gerados.
- **Vitrine Interativa "IA Explica" + Leitor Sincronizado:** player do YouTube do episódio mais recente com **Modo Leitor Sincronizado** (acompanha os blocos da história enquanto o vídeo toca, com integração à YouTube IFrame API e modo auto-avanço).
- **Quiz Relâmpago de 3 Perguntas & Card Colecionável Digital:** carrega `quiz_questions` de cada episódio para desbloquear +20 Moedas Positivas e um Card Colecionável vetorial (SVG/PNG) do `@cotocopositivo` para download.
- **Resumo de Bolso (`1080x1920`):** geração instantânea no navegador via HTML5 Canvas de uma lâmina vertical com os **3 Níveis do Episódio** e os **4 Pilares do Livro**.
- **Estante Automática de Livros (`/biblioteca.html`):** lista todos os `livro_apoio` de `public/data/ia-explica/index.json` com seus 4 pilares e botões diretos de compra, além dos guias digitais oficiais (`O guia prático para mudar de vida` e `Manual de Operações CotocoPositivo`).
- **Mini-Games & Teleprompter:** integração direta com os 12 mini-games em `/ferramentas/` (*"Treinar essa habilidade agora"*) e o `/teleprompter.html`.

## Estrutura de Pastas

```text
.
├── index.html                      # Portal principal (Termômetro, Hero, IA Explica, Quiz, Oráculo)
├── biblioteca.html                 # Estante automática de livros (4 pilares) e guias digitais oficiais
├── jogos.html                      # Galeria das 12 ferramentas e mini-games positivos
├── teleprompter.html               # Teleprompter sincronizado com os episódios do IA Explica
├── ebook.html                      # Guias práticos (Hotmart, Kiwify) e curadoria
├── comunidade.html                 # Mural da Gratidão e apoio independente via Pix
├── cotoco-share.js                 # Sistema modular de compartilhamento e Moedas Positivas
├── vercel.json                     # Configuração Vercel ("cleanUrls": true)
├── css/
│   └── style.css                   # Design System (#0A0E17, ouro #FFD700, ciano #00F0FF, esmeralda #10B981)
├── js/
│   └── app.js                      # Lógica do Termômetro, IA Explica, Leitor, Quiz, Canvas 1080x1920 e Biblioteca
├── ferramentas/                    # 12 mini-games e ferramentas interativas de positividade
└── public/
    └── data/
        └── ia-explica/
            ├── index.json          # Índice de episódios, livro_apoio (4 pilares) e quiz_questions
            └── ep_056.json         # Detalhamento completo do episódio e roteiro do teleprompter
```

## Como Adicionar um Novo Episódio

1. Crie `public/data/ia-explica/ep_XXX.json` seguindo o modelo de `ep_056.json` (`niveis`, `livro_apoio` com `pilares`, `quiz_questions`, `roteiro_teleprompter`).
2. Adicione o episódio no topo do array `episodios` em `public/data/ia-explica/index.json`.
3. O **Termômetro**, a **Vitrine IA Explica**, a **Biblioteca (`/biblioteca.html`)** e o **Teleprompter (`/teleprompter.html`)** serão atualizados automaticamente.

## Teste Local e Deploy na Vercel

- **Localmente:** execute `npx serve .` ou `python -m http.server 8080` na raiz do projeto (necessário para `fetch()` dos arquivos JSON).
- **Vercel:** faça push para o GitHub e importe o repositório na Vercel. Não há etapa de build (`outputDirectory: "."`, `cleanUrls: true`).
