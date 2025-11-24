import { escapeHtml } from "../../util/juegoFunctionUtility.js";

export  class IntroAdivinaComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.index = 0;

    this.shadowRoot.innerHTML =
      `
        <style>

          * {
              font-family: "Raleway", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
              color: var(--text-color, rgb(25, 41, 82));
            }

            :host {
              --radius: 16px;
              --card-bg: #fff;
              --video-width: 60%;
              --video-height: 60%;
              --btn-bg: #1e355e;
              --btn-hover-bg: #190134;
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;
              text-align: center;
            }

            .card {
              border-radius: var(--radius);
              box-shadow: 0 10px 30px rgba(20, 30, 60, 0.12);
              padding: 18px;
              display: flex;
              flex-direction: column;
              gap: 12px;
              align-items: center;
              background-color: var(--card-bg);
              width: 90%;
              max-width: 600px;
              margin: auto;
            }

            .video-wrap {
              width: 100%;
              max-width: 600px;
              aspect-ratio: 16/9;
              background-color: var(--card-bg);
              border-radius: var(--radius);
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            }

            video {
              width: var(--video-width);
              height: var(--video-height);
              object-fit: cover;
              display: block;
            }

            #streaming-text {
              text-align: center;
              word-wrap: break-word;
              min-height: 3.5em;
              line-height: 1.4;
              font-size: var(--streaming-font-size, 1.2rem);
              color: var(--streaming-text-color, rgb(33, 37, 41));
            }

            .btn {
              margin-top: 16px;
              padding: 10px 24px;
              font-size: var(--btn-font-size, 16px);
              font-weight: 600;
              border: none;
              border-radius: 8px;
              background-color: var(--btn-bg);
              color: var(--btn-color, white);
              cursor: pointer;
              transition: background 0.3s, opacity 0.5s;
              opacity: 0; 
              pointer-events: none; 
            }

            .btn.visible {
              opacity: 1;
              pointer-events: auto;
            }

            .btn:hover {
              background-color: var(--btn-hover-bg);
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
                width: calc(var(--video-width) * 1.33);
                height: calc(var(--video-height) * 1.33);
              }
            }
        </style>

      <main class="card" role="main">
        <h2 style="margin: 0; font-weight: 600; margin-top: 30px;">
${escapeHtml(this.getAttribute("intro-title")) || "Ordena las palabras"}
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
  const texto = this.getAttribute('data-texto') || "Recuerda leer bien el texto antes de iniciar el juego.";
  const contenedor = this.shadowRoot.getElementById("streaming-text");
  const btnJugar = this.shadowRoot.getElementById("btn-jugar");

  const velocidad = 30; // ms por carácter
  let lastTime = 0;

  const step = (timestamp) => {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;

    if (delta >= velocidad) {
      contenedor.textContent += texto.charAt(this.index);
      this.index++;
      lastTime = timestamp;
    }

    if (this.index < texto.length) {
      requestAnimationFrame(step);
    } else {
      btnJugar.classList.add("visible");
    }
  };

  requestAnimationFrame(step);
}


}

customElements.define('intro-adivina-component', IntroAdivinaComponent);
