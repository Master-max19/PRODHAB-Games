class IntroAdivinaComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.index = 0;

    this.shadowRoot.innerHTML = `
          <style>


          *{
          font-family: "Raleway", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          }
        :host {
          --radius: 16px;
          display: flex;               /* ✅ flex para centrar */
          justify-content: center;     /* ✅ centra horizontal */
          align-items: center;         /* ✅ centra vertical */
          width: 100%;
          height: 100%;
          text-align: center;          /* ✅ centra texto */
        }

        .card {
          border-radius: var(--radius);
          box-shadow: 0 10px 30px rgba(20, 30, 60, 0.12);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          background-color: #fff;
          width: 90%;                  /* ✅ ocupa 90% en móvil */
          max-width: 600px;            /* ✅ límite en desktop */
          margin: auto;
        }

        .video-wrap {
          width: 100%;
          max-width: 600px;
          aspect-ratio: 16/9;
          background-color: #fff;
          border-radius: var(--radius);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        video {
          width: 60%;
          height: 60%;
          object-fit: cover;
          display: block;
        }

        #streaming-text {
          text-align: center;
          word-wrap: break-word;
          min-height: 3.5em; /* espacio reservado */
          line-height: 1.4;
        }

        .btn {
          margin-top: 16px;
          padding: 10px 24px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          background-color: #0a0043;
          color: white;
          cursor: pointer;
          transition: background 0.3s, opacity 0.5s;
          opacity: 0;              /* oculto visualmente */
          pointer-events: none;    /* no clickeable al inicio */
        }

        .btn.visible {
          opacity: 1;
          pointer-events: auto;    /* clickeable cuando aparece */
        }

        .btn:hover {
          background-color: #190134;
        }

        @media (max-width: 520px) {
          .card {
            padding: 12px;
          }
          .btn {
            font-size: 14px;
            width: 80%;
            padding: 8px 20px;
          }
          video {
            width: 80%;
            height: 80%;
          }
        }
      </style>
      <main class="card" role="main">
        <h2 style="margin: 0; font-weight: 600; margin-top: 30px;">
          Ordena las palabras
        </h2>
        <p id="streaming-text"></p>

        <div class="video-wrap" id="video-wrap"></div>

        <button id="btn-jugar" class="btn">
          Jugar
        </button>
      </main>
    `;
  }

  connectedCallback() {
    this.cargarVideo();
    this.escribir();

    this.shadowRoot.querySelector("#btn-jugar").addEventListener("click", () => {
  this.dispatchEvent(new CustomEvent("jugar-click", { bubbles: true, composed: true }));
});

  }

  cargarVideo() {
    const videoWrap = this.shadowRoot.getElementById("video-wrap");
    const videoSrc = this.getAttribute("video-src");

    if (videoSrc) {
      const video = document.createElement("video");
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;

      const source = document.createElement("source");
      source.src = videoSrc;
      source.type = "video/webm";

      video.appendChild(source);
      videoWrap.appendChild(video);
    } else {
      videoWrap.textContent = "No disponible";
      videoWrap.style.display = "flex";
      videoWrap.style.alignItems = "center";
      videoWrap.style.justifyContent = "center";
      videoWrap.style.fontWeight = "600";
      videoWrap.style.color = "#555";
    }
  }

  escribir() {
    // Obtener texto desde atributo externo, si no existe usar uno por defecto
    const texto = this.getAttribute('data-texto') || "Recuerda leer bien el texto antes de iniciar el juego.";
    const contenedor = this.shadowRoot.getElementById("streaming-text");
    const btnJugar = this.shadowRoot.getElementById("btn-jugar");

    if (this.index < texto.length) {
      contenedor.textContent += texto.charAt(this.index);
      this.index++;
      setTimeout(() => this.escribir(), 50);
    } else {
      btnJugar.classList.add("visible");
    }
  }
}

customElements.define('intro-adivina-component', IntroAdivinaComponent);
