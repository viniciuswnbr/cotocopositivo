# @cotocopositivo — Portal Oficial (Jamstack)

Portal oficial do ecossistema **@cotocopositivo**, desenvolvido em **HTML5 + CSS3 moderno + JavaScript Vanilla (ES6+)** sem frameworks pesados, pronto para deploy contínuo na **Vercel** via GitHub com URLs limpas (`cleanUrls: true`).

## Estrutura de Pastas

```text
.
├── index.html                      # Portal principal (Hero, Vitrine IA Explica, Oráculo da IA)
├── teleprompter.html               # Teleprompter conectado ao episódio mais recente do IA Explica
├── jogos.html                      # Galeria das 12 ferramentas e mini-games positivos
├── ebook.html                      # Guia Prático (Hotmart), Kiwify e Curadoria Amazon
├── comunidade.html                 # Mural da Gratidão e apoio independente via Pix
├── cotoco-share.js                 # Sistema modular de compartilhamento e Moedas Positivas
├── vercel.json                     # Configuração de URLs limpas (cleanUrls: true)
├── css/
│   └── style.css                   # Design System (#0A0E17, glassmorphism, ouro, ciano neon, esmeralda)
├── js/
│   └── app.js                      # Lógica da vitrine IA Explica, filtros, modal 3 Níveis e Oráculo
├── ferramentas/                    # 12 mini-games e ferramentas interativas de positividade
│   ├── biscoito.html
│   ├── cacapalavras.html
│   ├── catcher.html
│   ├── forca.html
│   ├── game.html
│   ├── magic.html
│   ├── memoria.html
│   ├── quiz.html
│   ├── roleta.html
│   ├── simulacao.html
│   ├── stop.html
│   └── wordle.html
└── public/
    └── data/
        └── ia-explica/
            ├── index.json          # Índice automático de episódios exibido na vitrine e no teleprompter
            └── ep_056.json         # Exemplo completo de episódio (3 Níveis, livro_apoio e roteiro)
```

## Como Adicionar um Novo Episódio do "IA Explica"

1. Crie o arquivo JSON do episódio em `public/data/ia-explica/ep_XXX.json` seguindo a estrutura de `ep_056.json` (`niveis`, `livro_apoio`, `roteiro_teleprompter`).
2. Adicione a entrada correspondente no topo do array `episodios` em `public/data/ia-explica/index.json` (incluindo `numero`, `titulo`, `tema`, `estilo_visual`, `youtube_video_id` e `arquivo`).
3. O portal (`index.html`) e o `/teleprompter.html` passarão a exibir automaticamente o novo episódio em destaque.

## Teste Local e Deploy na Vercel

- **Localmente:** execute qualquer servidor estático na raiz do projeto (ex.: `npx serve .` ou `python -m http.server 8080`) para que o `fetch()` de `public/data/ia-explica/index.json` funcione sem bloqueios de `file://`.
- **Vercel:** faça push para o GitHub e conecte o repositório na Vercel (sem necessidade de comando de build; diretório raiz `.`).
