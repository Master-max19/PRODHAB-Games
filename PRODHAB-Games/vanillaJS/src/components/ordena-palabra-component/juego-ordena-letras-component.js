class JuegoOrdenaLetras extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.currentCard = 0; // índice de la carta activa
    this.idOrdenar = null;

  }


  async connectedCallback() {
    this.idOrdenar = this.getAttribute("id-ordenar") || null;

    let palabrasArray = this.hasAttribute("palabras")
      ? JSON.parse(this.getAttribute("palabras"))
      : undefined;
    let introText = this.getAttribute("intro-text");
    let tema = this.getAttribute("tema");

    let videoFinalSrc = this.getAttribute("video-final-src");
    let inicioVideoSrc = this.getAttribute("inicio-video-src");
    let detalle = this.getAttribute("detalle");
    // Llamar al servicio siempre que exista
    if (OrdenaLetrasService?.obtenerTextoYPalabras) {
      const textoYPalabras = await OrdenaLetrasService.obtenerTextoYPalabras(parseInt(this.idOrdenar));
      this.idOrdenar = textoYPalabras.idJuego;
      palabrasArray = palabrasArray || textoYPalabras.palabras || ["ejemplo"];
      introText = introText || textoYPalabras.texto || "Este es un texto de ejemplo.";
      tema = tema || textoYPalabras.tema || "Juego no disponible";
      detalle = detalle || textoYPalabras.detalle || "Juego no disponible";

      videoFinalSrc = videoFinalSrc || textoYPalabras.videoFinalSrc || "video1.webm";
      inicioVideoSrc = inicioVideoSrc || textoYPalabras.inicioVideoSrc || "video2.webm";
    }

    this.setAttribute("palabras", JSON.stringify(palabrasArray));
    this.setAttribute("intro-text", introText);
    this.setAttribute("tema", tema);
    this.setAttribute("video-final-src", videoFinalSrc);
    this.setAttribute("inicio-video-src", inicioVideoSrc);

    // 🔹 Ahora renderizas tu shadow DOM usando estas variables



    // Renderizar el contenido del shadow DOM
this.shadowRoot.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
      min-height: 100vh; /* Asegura que ocupe al menos la pantalla */
    }

    .game-container {
      position: relative;
      width: 100%;
      max-width: 600px;
      min-height: 80vh;        /* Altura mínima consistente */
      margin: 0 auto;
      padding: 5px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .cards-wrapper {
      position: relative;
      width: 100%;
      height: 100%;           
      min-height: 500px;
    }

    .card {
      position: absolute;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.6s ease, transform 0.6s ease;
      transform: scale(0.9);
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      box-sizing: border-box;
    }

    .card.active {
      opacity: 1;
      pointer-events: auto;
      transform: scale(1);
    }
  </style>

  <div class="game-container">
    <div class="cards-wrapper">
      <div class="card active">
        <intro-adivina-component 
          intro-title="${detalle}" 
          video-src="${inicioVideoSrc}" 
          data-texto="${introText}"
          style="width: 100%; height: 100%;">
        </intro-adivina-component>
      </div>

      <div class="card">
        <ordena-letras-component 
          style="width: 100%; height: 100%;"
          video-final-src="${videoFinalSrc}"
          words='${JSON.stringify(palabrasArray)}'
          intro-text="${introText}"
          id-ordenar="${this.idOrdenar}"
          tema="${tema}">
        </ordena-letras-component>
      </div>
    </div>
  </div>
`;

    this.eventoSiguiente();

  }


  eventoSiguiente() {
    const comp = this.shadowRoot.querySelector("intro-adivina-component");
    // escuchamos el evento personalizado que dispara el hijo
    comp.addEventListener("jugar-click", () => {
      this.nextCard();
    });
  }

  nextCard() {
    const cards = this.shadowRoot.querySelectorAll(".card");
    cards[this.currentCard].classList.remove("active");
    this.currentCard = (this.currentCard + 1) % cards.length;
    cards[this.currentCard].classList.add("active");
  }
}

customElements.define("juego-ordena-letras-component", JuegoOrdenaLetras);
