class JuegoOrdenaLetras extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.currentCard = 0; // índice de la carta activa


  }


  async connectedCallback() {

    // Obtener atributos o poner valores por defecto

    //    this.setAttribute("tema", "dskskalaklsaskl")
    //


  // También puedes setear video si quieres valores por defecto
  if (!this.hasAttribute("video-final-src")) {
    this.setAttribute("video-final-src", "video1.webm");
  }
  if (!this.hasAttribute("inicio-video-src")) {
    this.setAttribute("inicio-video-src", "video2.webm");
  }

  // Obtener los atributos para renderizar el shadow DOM
  const palabrasArray = JSON.parse(this.getAttribute("palabras"));
  const introText = this.getAttribute("intro-text");
  const tema = this.getAttribute("tema");
  const videoFinalSrc = this.getAttribute("video-final-src");
  const inicioVideoSrc = this.getAttribute("inicio-video-src");



    // Renderizar el contenido del shadow DOM
    this.shadowRoot.innerHTML = `
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Raleway:wght@100;200;300;400;500;600;700;800;900&display=swap");
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
      }
      .card.active { opacity: 1; pointer-events: auto; transform: scale(1); }
    </style>

    <div class="card active" style="--card-color: #4caf50">
      <inicio-adivina-component video-src="${inicioVideoSrc}"></inicio-adivina-component>
    </div>

    <div class="card" style="--card-color: #ff5722">
      <juego-memoria
        style="width: 100%"
        video-final-src="${videoFinalSrc}"
      ></juego-memoria>
    </div>
  `;

    this.eventoSiguiente();

  }


  eventoSiguiente() {
    const comp = this.shadowRoot.querySelector("inicio-adivina-component");
    // escuchamos el evento personalizado que dispara el hijo
    comp.addEventListener("jugar-click", () => {
      this.nextCard();
    });
  }

  nextCard() {
    const cards = this.shadowRoot.querySelectorAll(".card");
    cards[this.currentCard].classList.remove("active"); // quitamos active
    this.currentCard = (this.currentCard + 1) % cards.length; // siguiente carta
    cards[this.currentCard].classList.add("active"); // activamos siguiente
  }
}

customElements.define("juego-ordena-letras-component", JuegoOrdenaLetras);
