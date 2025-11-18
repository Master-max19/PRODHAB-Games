class ModalSopa extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        }
        .modal {
          display: none;
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(4px);
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease forwards;
        }
        .modal-content {
          background: #fff;
          border-radius: 12px;
          padding: 25px 30px 60px; 
          width: 90%;
          max-width: 250px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          position: relative;
          animation: scaleUp 0.3s ease forwards;
          overflow: hidden;
        }
        .modal-content h1 {
          font-size: 20px;
          color: #222;
          margin-bottom: 18px;
          font-weight: 600;
        }
        .modal-content p {
          font-size: 14px;
          color: #555;
          margin-top: 12px;
          line-height: 1.5;
        }
        .modal-content a {
          color: #007BFF;
          text-decoration: none;
          font-weight: 600;
        }
        .modal-content a:hover {
          text-decoration: underline;
        }
        .close-btn {
          position: absolute;
          top: 8px;
          right: 10px;
          background: transparent;
          color: #888;
          border: none;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .close-btn:hover {
          color: #000;
        }
        .close-bottom-btn {
          margin-top: 20px;
          padding: 10px 20px;
          background: #1e355e;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
          position: absolute;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
        }
        .close-bottom-btn:hover {
          background: #0056b3;
        }
        #character {
          width: 120px;
          animation: float 4s infinite ease-in-out;
          margin: 0 auto;
          display: block;
        }
        .media-error {
          font-size: 14px;
          color: #888;
          margin: 0 auto;
          display: block;
          padding: 10px;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      </style>

      <div class="modal">
        <div class="modal-content">
          <button class="close-btn">×</button>
          <h1 id="modal-title"></h1>
          <div id="media-container"></div>
          <p id="link-paragraph" style="display: none;">
            Puedes ver más información en el siguiente enlace: 
            <a id="modal-link" target="_blank">clic.</a>
          </p>
          <button class="close-bottom-btn">Aceptar</button>
        </div>
      </div>
    `;
  }

  static get observedAttributes() {
    return ["title", "img", "video", "link", "no-animation", "no-background"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.shadowRoot) return;

    const mediaContainer = this.shadowRoot.querySelector("#media-container");
    const linkParagraph = this.shadowRoot.querySelector("#link-paragraph");
    const modal = this.shadowRoot.querySelector(".modal");
    const modalContent = this.shadowRoot.querySelector(".modal-content");

    if (name === "title") {
      this.shadowRoot.querySelector("#modal-title").textContent = newValue || "";
    }

    if (name === "img") {
      mediaContainer.innerHTML = "";
      if (newValue) {
        const img = document.createElement("img");
        img.id = "character";
        img.src = newValue;
        img.alt = "Imagen";
        img.addEventListener("error", () => {
          mediaContainer.innerHTML = '<span class="media-error">No disponible</span>';
        });
        mediaContainer.appendChild(img);
      }
    }

    if (name === "video") {
      mediaContainer.innerHTML = "";
      if (newValue) {
        const video = document.createElement("video");
        video.width = 300;
        video.loop = true;
        video.autoplay = true;
        video.muted = true;
        video.style.cssText = "display: block; margin: 0 auto; max-width: 100%;";
        const source = document.createElement("source");
        const isWebm = newValue.toLowerCase().endsWith(".webm");
        source.src = newValue;
        source.type = isWebm ? "video/webm" : "video/mp4";
        source.addEventListener("error", () => {
          mediaContainer.innerHTML = '<span class="media-error">No disponible</span>';
        });
        video.appendChild(source);
        video.addEventListener("error", () => {
          mediaContainer.innerHTML = '<span class="media-error">No disponible</span>';
        });
        mediaContainer.appendChild(video);
      }
    }

    if (name === "link") {
      const linkElement = this.shadowRoot.querySelector("#modal-link");
      linkElement.href = newValue || "#";
      linkParagraph.style.display = newValue ? "block" : "none";
    }

    if (name === "no-animation") {
      const hasNoAnim = newValue !== null;
      if (hasNoAnim) {
        modal.style.animation = "none";
        modalContent.style.animation = "none";
      } else {
        modal.style.animation = "fadeIn 0.3s ease forwards";
        modalContent.style.animation = "scaleUp 0.3s ease forwards";
      }
    }

    if (name === "no-background") {
      const hasNoBackground = newValue !== null;
      if (hasNoBackground) {
        modal.style.background = "transparent";
        modal.style.backdropFilter = "none";
      } else {
        modal.style.background = "rgba(0, 0, 0, 0.45)";
        modal.style.backdropFilter = "blur(4px)";
      }
    }
  }

  connectedCallback() {
    this.modal = this.shadowRoot.querySelector(".modal");
    this.shadowRoot.querySelector(".close-btn").addEventListener("click", () => this.close());
    this.shadowRoot.querySelector(".close-bottom-btn").addEventListener("click", () => this.close());
    this.shadowRoot.querySelector(".modal").addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });

    ["title", "img", "video", "link", "no-animation", "no-background"].forEach(attr => {
      this.attributeChangedCallback(attr, null, this.hasAttribute(attr) ? this.getAttribute(attr) || "" : null);
    });
  }

  open() {
    this.modal.style.display = "flex";
  }

  close() {
    this.modal.style.display = "none";
  }
}

customElements.define("modal-sopa", ModalSopa);
