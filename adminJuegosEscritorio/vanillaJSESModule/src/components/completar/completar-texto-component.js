import { obtenerRondas } from "../../services/completarTextoService.js";
import { registrarJuego } from "../../services/resultadoJuegoService.js";
import { mezclar } from "../../util/juegoFunctionUtility.js";

export class CompletarTextoComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.rondas = [];
    this.indiceRonda = -1;
    this.enTransicion = false;
    this.tiempoInicio = null;
    this.intervaloTemporizador = null;
    this.intervaloConfeti = null;
    this.tiempoConfeti = 5000;
    this.idCompletar = null;
    this.renderizar();
  }

  renderizar() {
    let imgIntro = this.getAttribute('img-intro') || "superdato.png";
    let WebmFinal = this.getAttribute('webm-final') || "superdato.webm";
    let imgRondas = this.getAttribute('img-rondas') || "superdato2.png";

    this.shadowRoot.innerHTML = `
          <style>
            :host {
  --primario: #1f4388;
  --acento: #2563eb;
  --oscuro: #1e355e;
  --error: rgb(242, 218, 177);
  --claro: #eef2ff;
}

* {
  box-sizing: border-box;
  font-family: "Raleway", sans-serif;
}

.aplicacion {
  width: 100%;
  max-width: 900px;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  transition: opacity 0.5s;
  margin: 0 auto;
  display: block;
}

h2 {
  color: var(--primario);
  text-align: center;
  margin: 0 0 20px 0;
}

.pantalla-inicio {
  display: none;
  text-align: center;
  animation: aparecerDentro 0.5s ease-in;
}

.pantalla-inicio.activa {
  display: block;
}

.pantalla-inicio h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.pantalla-inicio p {
  font-size: 1rem;
  margin: 15px 0;
  line-height: 1.6;
}

.boton-iniciar {
  padding: 12px 32px;
  background: rgb(25, 41, 82);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: background 0.2s, transform 0.2s;
}

.boton-iniciar:hover {
  background: rgb(0, 53, 160);
  transform: scale(1.05);
}

.boton-iniciar:active {
  transform: scale(0.95);
}

.contenedor-texto {
  margin: 20px 0;
  font-size: 1.1rem;
  line-height: 1.6;
  user-select: none;
}

.espacio {
  display: inline-block;
  min-width: 50px;
  border-bottom: 2px solid var(--acento);
  margin: 0 2px;
  vertical-align: text-bottom;
  text-align: center;
  color: #231d1dff;
  font-size: 1rem;
  line-height: 1.2;
  background: transparent;
  padding: 0;
}

.espacio.relleno {
  background: transparent;
  border-color: #eaeaeaff;
  color: #000;
}

.contenedor-palabras {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.palabra {
  padding: 6px 12px;
  background: var(--oscuro);
  color: white;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  user-select: none;
  border: none;
  font-size: 1rem;
}

.palabra:active {
  transform: scale(1.05);
}

.palabra:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pie-pagina {
  margin-top: 16px;
  text-align: center;
  font-size: 1rem;
  color: #65656a;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.boton-reiniciar {
  padding: 8px 16px;
  background: #04205d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.boton-reiniciar:hover {
  background: #021034;
}

.boton-reiniciar:active {
  transform: scale(0.95);
}

.pantalla-finalizacion {
  display: none;
  text-align: center;
  animation: aparecerDentro 0.5s ease-in;
  position: relative;
  overflow: hidden;
}

.pantalla-finalizacion.activa {
  display: block;
}

.pantalla-finalizacion h2 {
  color: #02297b;
  font-size: 2rem;
  margin: 20px 0;
}

.temporizador {
  font-size: 1.5rem;
  color: #04205d;
  margin: 20px 0;
  font-weight: bold;
}

.pantalla-finalizacion p {
  font-size: 1.1rem;
  color: #64748b;
  margin: 20px 0;
}

.confeti {
  position: absolute;
  width: 10px;
  height: 10px;
  pointer-events: none;
  background: #2563eb;
}

.instrucciones {
  font-size: 1.1rem;
  font-weight: 600;
}

.instrucciones,
.detalle {
  color: rgb(101, 101, 106);
}

.desvanecerse-dentro {
  animation: desvanecerseDentro 0.6s ease-out;
}
.desvanecerse-fuera {
  animation: desvanecerseFuera 0.6s ease-in;
}

.contenedor-imagen-boton {
  position: relative;
  text-align: center;
  height: 250px; 
}

.contenedor-imagen {
  position: relative;
  width: 100%;
  height: 98px;
}

.imagen-intro {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  pointer-events: none;
  z-index: 10;
}

@keyframes aparecerDentro {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes desvanecerseDentro {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes desvanecerseFuera {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}

@keyframes caer {
  to {
    transform: translateY(100vh) rotateZ(360deg);
    opacity: 0;
  }
}

@media (max-width: 600px) {
  .espacio {
    min-width: 60px;
    min-height: 20px;
    line-height: 20px;
    font-size: 0.9rem;
    padding: 3px 6px;
  }
  .palabra {
    padding: 6px 10px;
    font-size: 0.9rem;
  }
  .aplicacion {
    padding: 16px;
  }
  .pantalla-inicio h2 {
    font-size: 1.8rem;
  }
  .pantalla-inicio p {
    font-size: 1rem;
  }
}

          </style>

          <div class="aplicacion pantalla-inicio activa" id="pantallaInicio">
            <h2 id="titulo-juego"></h2>
            <p id="detalles-juego" class="detalle"></p>
            <p class="instrucciones">Rellena los espacios en blanco con las palabras correctas.</p>

            <div class="contenedor-imagen"> <img src="${imgIntro}" class="imagen-intro"> </div> <button class="boton-iniciar" id="btnIniciar">Comenzar Juego</button>

          </div>

          <div class="aplicacion desvanecerse-dentro" id="aplicacion" style="position: relative; display: none; padding: 20px; border: 1px solid #ccc;">
            <h2 id="titulo-juego2"></h2>
            <div class="contenedor-texto" id="contenedorTexto"></div>
            <div class="contenedor-palabras" id="contenedorPalabras"></div>
            <div class="pie-pagina" id="piePagina"></div>
            <img src="${imgRondas}" alt="icono" width="40" 
                 style="position: absolute; bottom: 0; right: 0; pointer-events: none; right: 20px; bottom:10px;">
          </div>

          <div class="aplicacion pantalla-finalizacion" id="pantallaFinalizacion">
            <h2>¡Juego Completado!</h2>
            <p>¡Felicidades! Has completado todas las rondas correctamente.</p>
            <div class="temporizador" id="pantallaTemporizador">Tiempo: 0s</div>
            <div style="display: flex; justify-content: center; align-items: center; width: 100%; margin: 10px 0; ">
              <video autoplay muted playsinline style="width: 200px; height: auto; background: transparent;">
                <source src="${WebmFinal}" type="video/webm">
              </video>
            </div>
            <button class="boton-reiniciar" id="btnReiniciarFinal">Reiniciar Juego</button>
          </div>
        `;
  }

  static get observedAttributes() {
    return ["img-intro", "webm-final", "img-rondas", "id-completar"];
  }


  async connectedCallback() {
    const tituloJuego = this.shadowRoot.getElementById("titulo-juego");
    const tituloJuego2 = this.shadowRoot.getElementById("titulo-juego2");

    const detallesJuego = this.shadowRoot.getElementById("detalles-juego");

    tituloJuego.textContent = "Cargando...";
    detallesJuego.innerText = "...";
    this.idCompletar = this.getAttribute('id-completar') || null;
    const data = await obtenerRondas(Number(this.idCompletar));
    this.idCompletar = data.idJuego;
    this.rondas = data.rondas;
    tituloJuego.textContent = data.descripcion;
    detallesJuego.innerText = data.detalle;
    tituloJuego2.textContent = data.nombre;
    const pantallaInicio = this.shadowRoot.getElementById("pantallaInicio");


    if (!this.rondas || this.rondas.length === 0) {
      const mensajeError = document.createElement("p");
      mensajeError.textContent = "No hay rondas disponibles en este momento.";
      mensajeError.style.color = "#c74b27";
      mensajeError.style.fontWeight = "bold";
      mensajeError.style.marginTop = "20px";
      pantallaInicio.appendChild(mensajeError);

      const btnIniciar = this.shadowRoot.getElementById("btnIniciar");
      btnIniciar.disabled = true;
      btnIniciar.style.opacity = "0.5";
      btnIniciar.style.cursor = "not-allowed";
      tituloJuego.innerHTML = '';
      tituloJuego2.innerHTML = '';
      detallesJuego.innerHTML = '';
      return;
    }

    const btnIniciar = this.shadowRoot.getElementById("btnIniciar");
    btnIniciar.addEventListener("click", () => this.iniciarJuegoDesdeInicio());
    this.adjuntarOyenteReiniciar();
  }


  iniciarJuegoDesdeInicio() {
    const pantallaInicio = this.shadowRoot.getElementById("pantallaInicio");
    const aplicacion = this.shadowRoot.getElementById("aplicacion");

    pantallaInicio.classList.remove("activa");
    aplicacion.style.display = "block";

    this.indiceRonda = 0;
    this.tiempoInicio = Date.now();
    this.iniciarTemporizador();
    this.iniciarRonda();
  }

  adjuntarOyenteReiniciar() {
    const btnReiniciarFinal = this.shadowRoot.getElementById("btnReiniciarFinal");
    if (btnReiniciarFinal) {
      btnReiniciarFinal.removeEventListener("click", this.reiniciarJuego.bind(this));
      btnReiniciarFinal.addEventListener("click", () => this.reiniciarJuego());
    }
  }

  iniciarTemporizador() {
    this.intervaloTemporizador = setInterval(() => {
      const transcurrido = Math.floor((Date.now() - this.tiempoInicio) / 1000);
      const horas = Math.floor(transcurrido / 3600);
      const minutos = Math.floor((transcurrido % 3600) / 60);
      const segundos = transcurrido % 60;

      let cadenaHora = "Tiempo: ";
      if (horas > 0) {
        cadenaHora += `${horas}h ${minutos}m ${segundos}s`;
      } else if (minutos > 0) {
        cadenaHora += `${minutos}m ${segundos}s`;
      } else {
        cadenaHora += `${segundos}s`;
      }

      const pantallaTemporizador = this.shadowRoot.getElementById("pantallaTemporizador");
      if (pantallaTemporizador) {
        pantallaTemporizador.textContent = cadenaHora;
      }
    }, 100);
  }

  detenerTemporizador() {
    if (this.intervaloTemporizador) {
      clearInterval(this.intervaloTemporizador);
      this.intervaloTemporizador = null;
    }
  }



  iniciarRonda() {
    const contenedorTexto = this.shadowRoot.getElementById("contenedorTexto");
    const contenedorPalabras = this.shadowRoot.getElementById("contenedorPalabras");
    contenedorTexto.innerHTML = "";
    contenedorPalabras.innerHTML = "";

    const ronda = this.rondas[this.indiceRonda];
    const piePaginaEl = this.shadowRoot.getElementById("piePagina");
    if (piePaginaEl) {
      piePaginaEl.textContent = `Ronda ${this.indiceRonda + 1} de ${this.rondas.length}`;
    }

    const partes = ronda.texto.split(/___\d+___/);
    const espacios = [];

    for (let i = 0; i < partes.length; i++) {
      contenedorTexto.append(partes[i]);
      if (i < ronda.espacios.length) {
        const span = document.createElement("span");
        span.className = "espacio";
        span.dataset.respuesta = ronda.espacios[i];
        span.dataset.indice = i;
        contenedorTexto.appendChild(span);
        espacios.push(span);
      }
    }

    this.espaciosActuales = espacios;
    this.enProceso = false;

    const todasLasPalabras = [...ronda.espacios, ...ronda.distractores];

    const palabrasMezcladas = mezclar([...todasLasPalabras]);

    palabrasMezcladas.forEach((palabra, indice) => {
      const btn = document.createElement("button");
      btn.className = "palabra";
      btn.textContent = palabra;
      btn.dataset.indiceBoton = indice;

      btn.addEventListener("click", () => {
        if (this.enProceso) return;
        if (btn.disabled) return;

        const primerEspacioVacio = espacios.find(e => !e.classList.contains("relleno"));

        if (!primerEspacioVacio) return;

        if (palabra.toLowerCase() !== primerEspacioVacio.dataset.respuesta.toLowerCase()) {
          primerEspacioVacio.style.background = "#fee2e2";
          setTimeout(() => primerEspacioVacio.style.background = "transparent", 300);
          return;
        }

        this.enProceso = true;
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";

        this.moverPalabraAEspacio(btn, primerEspacioVacio);
      });

      contenedorPalabras.appendChild(btn);
    });
  }
  moverPalabraAEspacio(elementoPalabra, elementoEspacio) {
    const rectPalabra = elementoPalabra.getBoundingClientRect();
    const rectEspacio = elementoEspacio.getBoundingClientRect();

    const clon = elementoPalabra.cloneNode(true);
    clon.style.position = "fixed";
    clon.style.left = rectPalabra.left + "px";
    clon.style.top = rectPalabra.top + "px";
    clon.style.margin = "0";
    clon.style.zIndex = "1000";
    clon.style.transition = "all 0.5s ease";
    clon.style.pointerEvents = "none";
    this.shadowRoot.appendChild(clon);

    clon.getBoundingClientRect();
    const deltaX = rectEspacio.left + rectEspacio.width / 2 - (rectPalabra.left + rectPalabra.width / 2);
    const deltaY = rectEspacio.top + rectEspacio.height / 2 - (rectPalabra.top + rectPalabra.height / 2);

    clon.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.8)`;
    clon.style.opacity = "0.7";

    const handleAnimationEnd = () => {
      elementoEspacio.textContent = elementoPalabra.textContent;
      elementoEspacio.classList.add("relleno");
      clon.remove();
      elementoPalabra.remove();

      setTimeout(() => {
        this.enProceso = false;
        this.verificarRondaCompleta();
      }, 50);
    };

    clon.addEventListener("transitionend", handleAnimationEnd, { once: true });
  }

  verificarRondaCompleta() {
    if (this.enTransicion) return;
    const espacios = this.shadowRoot.querySelectorAll(".espacio");
    if (Array.from(espacios).every(b => b.classList.contains("relleno"))) {
      this.enTransicion = true;
      const aplicacion = this.shadowRoot.getElementById("aplicacion");
      aplicacion.classList.remove("desvanecerse-dentro");
      aplicacion.classList.add("desvanecerse-fuera");

      setTimeout(() => {
        this.indiceRonda++;
        if (this.indiceRonda < this.rondas.length) {
          this.iniciarRonda();
          aplicacion.classList.remove("desvanecerse-fuera");
          aplicacion.classList.add("desvanecerse-dentro");
        } else {
          this.detenerTemporizador();
          this.mostrarPantallaFinalizacion();

        }
        this.enTransicion = false;
      }, 500);
    }
  }



  reiniciarJuego() {
    this.indiceRonda = -1;
    this.enTransicion = false;
    this.detenerTemporizador();

    if (this.intervaloConfeti) {
      clearInterval(this.intervaloConfeti);
      this.intervaloConfeti = null;
    }

    const pantallaInicio = this.shadowRoot.getElementById("pantallaInicio");
    const aplicacion = this.shadowRoot.getElementById("aplicacion");
    const pantallaFinalizacion = this.shadowRoot.getElementById("pantallaFinalizacion");

    const elementosConfeti = this.shadowRoot.querySelectorAll(".confeti");
    elementosConfeti.forEach(el => el.remove());

    pantallaInicio.classList.add("activa");
    pantallaFinalizacion.classList.remove("activa");
    aplicacion.style.display = "none";
    aplicacion.classList.remove("desvanecerse-fuera");
    aplicacion.classList.add("desvanecerse-dentro");
  }

  async mostrarPantallaFinalizacion() {
    const aplicacion = this.shadowRoot.getElementById("aplicacion");
    const pantallaFinalizacion = this.shadowRoot.getElementById("pantallaFinalizacion");

    aplicacion.style.display = "none";
    pantallaFinalizacion.classList.add("activa");

    const video = pantallaFinalizacion.querySelector("video");
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.load();
      video.play();
    }

    this.crearConfeti();
    this.adjuntarOyenteReiniciar();
    await registrarJuego(Number(this.getAttribute("id-completar")) || this.idCompletar || null);

  }

  crearConfeti() {
    const pantallaFinalizacion = this.shadowRoot.getElementById("pantallaFinalizacion");
    const rect = pantallaFinalizacion.getBoundingClientRect();

    const generarConfeti = () => {
      const cantidadConfeti = 8;
      for (let i = 0; i < cantidadConfeti; i++) {
        const confeti = document.createElement("div");
        confeti.className = "confeti";
        const xAleatorio = Math.random() * rect.width;
        confeti.style.left = xAleatorio + "px";
        confeti.style.top = "-10px";
        confeti.style.background = "#2563eb";
        confeti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
        confeti.style.width = (5 + Math.random() * 5) + "px";
        confeti.style.height = confeti.style.width;
        confeti.style.animation = `caer ${2 + Math.random() * 1}s linear forwards`;
        confeti.style.position = "absolute";

        pantallaFinalizacion.appendChild(confeti);

        setTimeout(() => confeti.remove(), 3000);
      }
    };

    generarConfeti();

    this.intervaloConfeti = setInterval(generarConfeti, 300);

    setTimeout(() => {
      if (this.intervaloConfeti) {
        clearInterval(this.intervaloConfeti);
        this.intervaloConfeti = null;
      }
    }, this.tiempoConfeti);
  }


  attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
    console.log(`Atributo cambiado: ${nombre} = ${valorNuevo}`);

    // Evitar render completo innecesario
    if (valorAnterior === valorNuevo) return;

    // Actualiza solo lo que necesita
    if (nombre === "img-intro") {
      this.shadowRoot.querySelector(".imagen-intro").src = valorNuevo;
    }

    if (nombre === "img-rondas") {
      this.shadowRoot
        .querySelector("#aplicacion img")
        .setAttribute("src", valorNuevo);
    }

    if (nombre === "webm-final") {
      const video = this.shadowRoot.querySelector("video source");
      video.src = valorNuevo;
      video.parentElement.load();
    }

    if (nombre === "id-completar") {

    }
  }

}

customElements.define("completar-texto-component", CompletarTextoComponent);
