/**
 * cotoco-share.js — Sistema Modular de Compartilhamento & Recompensas
 * Ecossistema @cotocopositivo
 */
const CotocoShare = {
  config: {
    channelUrl: "https://www.youtube.com/@cotocopositivo?sub_confirmation=1",
    instaUrl: "https://instagram.com/cotocopositivo",
    ebookUrl: "https://hotmart.com/pt-br/club/vinicius-wagner-nunes/tecnicas-simples-de-bem-estar-transformando-sua-rotina-em-3-etapas/Y105534592Y",
    channelHandle: "@cotocopositivo"
  },

  injectStyles() {
    if (document.getElementById('cotoco-share-styles')) return;
    const style = document.createElement('style');
    style.id = 'cotoco-share-styles';
    style.textContent = `
      .cotoco-modal-backdrop {
        position: fixed; inset: 0; background: rgba(10, 14, 23, 0.85);
        display: flex; align-items: center; justify-content: center;
        z-index: 99999; padding: 16px; backdrop-filter: blur(8px);
      }
      .cotoco-modal-card {
        background: #101726; border: 1px solid #00F0FF; border-radius: 22px;
        max-width: 420px; width: 100%; padding: 26px; text-align: center;
        box-shadow: 0 0 36px rgba(0, 240, 255, 0.25);
        display: flex; flex-direction: column; gap: 14px;
        font-family: system-ui, -apple-system, sans-serif; color: #F8FAFC;
      }
      .cotoco-badge-header {
        display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 1px;
        padding: 4px 12px; border-radius: 999px; color: #00F0FF;
        background: rgba(0, 240, 255, 0.12); border: 1px solid rgba(0, 240, 255, 0.3);
      }
      .cotoco-streak-tag {
        font-size: 13px; color: #FFD700; font-weight: 700; margin-top: 6px;
      }
      .cotoco-quote-card {
        background: rgba(10, 14, 23, 0.8); border: 1px dashed rgba(16, 185, 129, 0.5);
        border-radius: 14px; padding: 14px; font-size: 14px; color: #E2E8F0; line-height: 1.5;
      }
      .cotoco-grid-social {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
      }
      .cotoco-social-btn {
        padding: 10px 8px; border-radius: 10px; border: none; font-weight: 700;
        font-size: 13px; cursor: pointer; text-decoration: none; color: #FFF;
        display: inline-flex; align-items: center; justify-content: center;
      }
      .cotoco-wpp { background: #10B981; }
      .cotoco-fb { background: #2563EB; }
      .cotoco-insta { background: linear-gradient(135deg, #EC4899, #F59E0B); }
      .cotoco-copy-btn {
        padding: 11px 16px; border-radius: 10px; border: 1px solid rgba(0, 240, 255, 0.4);
        background: rgba(0, 240, 255, 0.12); color: #00F0FF; font-weight: 700; cursor: pointer;
      }
      .cotoco-cta-ebook {
        background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3);
        border-radius: 12px; padding: 12px; font-size: 12px;
      }
      .cotoco-cta-ebook a {
        display: inline-block; margin-top: 6px; color: #FFD700; font-weight: 800; text-decoration: none;
      }
      .cotoco-play-again {
        padding: 12px 18px; border-radius: 12px; border: none;
        background: linear-gradient(135deg, #00F0FF, #10B981); color: #0A0E17;
        font-weight: 800; font-size: 15px; cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  },

  registerPositiveCompletion() {
    const coins = Number(localStorage.getItem('cotoco_coins') || 100) + 20;
    const streak = Number(localStorage.getItem('cotoco_streak') || 1);
    localStorage.setItem('cotoco_coins', String(coins));
    localStorage.setItem('cotoco_streak', String(streak));
    return { coins, streak };
  },

  show({ gameTitle = 'Desafio Positivo', message = '', customWppText = '', onNextRound = null } = {}) {
    this.injectStyles();
    const { streak } = this.registerPositiveCompletion();
    const formattedText = message || `Concluí ${gameTitle} no ecossistema @cotocopositivo!`;
    const wppText = customWppText || `${formattedText} ${this.config.channelUrl}`;
    const wppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(wppText)}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.config.channelUrl)}&quote=${encodeURIComponent(formattedText)}`;

    const existing = document.getElementById('cotoco-share-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'cotoco-share-modal';
    modal.className = 'cotoco-modal-backdrop';
    modal.innerHTML = `
      <div class="cotoco-modal-card">
        <div>
          <span class="cotoco-badge-header">SINTONIA COGNITIVA CONCLUÍDA</span>
          <h2 style="margin:6px 0 0; color:#F8FAFC; font-size:20px;">Vitória Positiva! +20 Moedas</h2>
          <div class="cotoco-streak-tag">⚡ ${streak} dia(s) de energia positiva</div>
        </div>
        <div class="cotoco-quote-card">${formattedText}</div>
        <div class="cotoco-grid-social">
          <a class="cotoco-social-btn cotoco-wpp" href="${wppUrl}" target="_blank" rel="noopener">💬 WhatsApp</a>
          <a class="cotoco-social-btn cotoco-fb" href="${fbUrl}" target="_blank" rel="noopener">📘 Facebook</a>
          <button class="cotoco-social-btn cotoco-insta" id="cotoco-modal-insta">📸 Instagram</button>
        </div>
        <button class="cotoco-copy-btn" id="cotoco-modal-copy">📋 Copiar Mensagem</button>
        <div class="cotoco-cta-ebook">
          <div style="font-weight:700; color:#FFD700;">Quer transformar sua rotina em 3 etapas?</div>
          <div style="color:#94A3B8;">Acesse o método completo de ativação, foco e sono restaurador.</div>
          <a href="${this.config.ebookUrl}" target="_blank" rel="noopener">Ver Guia Oficial na Hotmart ↗</a>
        </div>
        <button class="cotoco-play-again" id="cotoco-modal-next">🔄 Continuar</button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#cotoco-modal-copy').onclick = async (e) => {
      try {
        await navigator.clipboard.writeText(formattedText);
        e.currentTarget.textContent = '✅ Copiado com Sucesso!';
      } catch (_) {}
    };

    modal.querySelector('#cotoco-modal-insta').onclick = async () => {
      try {
        await navigator.clipboard.writeText(formattedText);
      } catch (_) {}
      window.open(this.config.instaUrl, '_blank', 'noopener');
    };

    modal.querySelector('#cotoco-modal-next').onclick = () => {
      modal.remove();
      if (typeof onNextRound === 'function') onNextRound();
    };
  }
};
