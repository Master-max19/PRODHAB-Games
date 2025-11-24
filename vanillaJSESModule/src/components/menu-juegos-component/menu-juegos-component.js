import { obtenerJuegos } from "../../services/juegosService.js";
import { escapeHtml } from "../../util/juegoFunctionUtility.js";

export class MenuJuegosComponent extends HTMLElement {
  constructor() {
    super();
    this.paginaActual = 1;
    this.juegosPorPagina = 6;
    this.filtroActual = "todos";
    this.todosLosJuegos = [];
    this.juegosFiltrados = [];
    this.inactividadTimer = null;
    this.intervaloTimer = null;
    this.tiempoMaximo = 30000 * 20; // 10 minutos
    this._listenersAdded = false;

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `

  <style>
  *{
    font-family: "Raleway", sans-serif;
  }
      :host {
  --primary: #1f4388;
  --primary-hover: #1d4ed8;
  --secondary: #64748b;
  --success: #10b981;
  --danger: #ef4444;
  --bg: #ffffffff;
  --card: #ffffff;
  --border: #e5e7eb;
  --text: #111827;
  --text-light: #65656a;
  --radius: 12px;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.1);
  --transition: all 0.25s ease;
  display: block;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.container {
  max-width: 1480px;
  margin: 0 auto;
  padding: 0.5rem 0.5rem;
}
h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
  color: rgb(31,40,88);
}
.subtitle {
  color: var(--text-light);
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto 0.5rem;
  text-align: center;
  margin-bottom: 10px;
}
.filtros {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
}
.filtro-btn {
  padding: 0.6rem 1.25rem;
  background: var(--card);
  color: var(--text);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--shadow);
}
.filtro-btn:hover {
  border-color: var(--primary);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
.filtro-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 6px 20px rgba(30, 64, 175, 0.2);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.75rem;
  margin-bottom: 3rem;
}
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
  display: flex;
  flex-direction: column;
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}
.card-header {
  padding: 1.25rem 1.25rem 0;
}
.card h3 {
  font-size: 1.35rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.card-body {
  padding: 0 1.25rem 1.25rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.card p {
  color: var(--text-light);
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  margin: 0.75rem 0;
}

.badge-1,
.badge-2,
.badge-3,
.badge-4 {
  background: rgb(242,218,177);
  color: #c74b27;
}


.btn-jugar {
  margin-top: auto;
  padding: 0.75rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
}
.btn-jugar:hover {
  background: var(--primary-hover);
  box-shadow: 0 6px 16px rgba(30, 64, 175, 0.25);
}
.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin: 2rem 0;
}
.paginacion-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: white;
  color: var(--text);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  font-size: 0.9rem;
}
#nextBtn,
#prevBtn {
  width: 100px;
}
.paginacion-btn:hover:not(:disabled) {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}
.paginacion-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  font-weight: 700;
}
.paginacion-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.hidden {
  display: none !important;
}
.juego-activo {
  position: relative;
}
.volver-container {
  display: flex;
  justify-content: center; 
  padding: 1rem;
  width: 100%; 
}
.volver-btn {
  padding: 0.6rem 1.25rem;
  background: var(--card);
  color: var(--text);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--shadow);
  transition: var(--transition);
}
.volver-btn:hover {
  background: #65656a;
  color: white;
}

.juego-fullwidth {
  max-width: 100% !important;
  width: 100% !important;
  margin: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  background: var(--bg) !important;
  border: none !important;
  min-height: 100vh;
}
#juegoContainer {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}
@media (max-width: 768px) {
  h2 {
    font-size: 2.1rem;
  }
  .grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .filtros {
    flex-direction: column;
    align-items: center;
  }
  .filtro-btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}

.titulo-linea {
  display: flex;
  align-items: center;     
  justify-content: center; 
  gap: 10px;  
  text-align: center;
}

.titulo-linea img {
  width: 40px;     
  height: auto;
}


@media (max-width: 480px) {
  h2 {
    font-size: 1.8rem;
  }
  .card-header,
  .card-body {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .btn-jugar {
    margin: 1rem;
  }
}
          </style>
            <div class="container">
            <div class="titulo-linea">
            <img 
              src="${this.getAttribute('img-menu')}" 
              alt="Icono"
              onerror="this.style.display='none'"
            >
            <h2>Juegos</h2>
            </div>

            <p class="subtitle">Durante los juegos no se recopila ningún tipo de dato personal.</p>

            <div class="filtros" id="filtrosContainer">
              <button class="filtro-btn active" data-filtro="todos">Todos</button>
              <button class="filtro-btn" data-filtro="1">Test</button>
              <button class="filtro-btn" data-filtro="2">Ordenar palabras</button>
              <button class="filtro-btn" data-filtro="3">Completar textos</button>
              <button class="filtro-btn" data-filtro="4">Sopa de Letras</button>
            </div>

            <div class="grid" id="juegosGrid"></div>
            <div class="paginacion" id="paginacion"></div>

            <div id="juegoContainer"></div>
          </div>
        `;
  }

  connectedCallback() {
    this.inicializar();

  }

  disconnectedCallback() {
    // Limpiar timers automáticamente
    if (this.inactividadTimer) clearTimeout(this.inactividadTimer);
    if (this.intervaloTimer) clearInterval(this.intervaloTimer);
  }


  async obtenerJuegos() {
    try {
      const juegos = await obtenerJuegos();
      return juegos.filter(j => j.activo);
    } catch (e) {
      console.error("Error al obtener juegos:", e);
      return [];
    }
  }

  filtrarJuegos(tipo) {
    this.filtroActual = tipo;
    this.juegosFiltrados = tipo === "todos"
      ? [...this.todosLosJuegos]
      : this.todosLosJuegos.filter(j => j.idTipoJuego.toString() === tipo);
    this.paginaActual = 1;
    this.mostrarJuegos();
  }

  mostrarJuegos() {
    const grid = this.shadowRoot.getElementById("juegosGrid");
    const paginacion = this.shadowRoot.getElementById("paginacion");
    if (!grid) return;

    grid.innerHTML = "";
    paginacion.innerHTML = "";

    const inicio = (this.paginaActual - 1) * this.juegosPorPagina;
    const fin = inicio + this.juegosPorPagina;
    const juegosPagina = this.juegosFiltrados.slice(inicio, fin);

    if (!juegosPagina.length) {
      grid.innerHTML = "<p style='text-align:center;color:var(--text-light);grid-column:1/-1;padding:2rem;'>No se encontraron juegos activos.</p>";
      return;
    }

    juegosPagina.forEach(juego => {
      const tipoText = ["", "Test", "Ordenar Palabra", "Completar Texto", "Sopa de Letras"][juego.idTipoJuego] || "Otro";
      const badgeClass = `badge-${juego.idTipoJuego}`;
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
            <div class="card-header"><h3>${escapeHtml(juego.nombre)}</h3></div>
            <div class="card-body">
              <p><strong>Descripción:</strong> ${escapeHtml(juego.descripcion) || "Sin descripción"}</p>
              <p><strong>Instrucciones:</strong> ${escapeHtml(juego.detalle) || "N/A"}</p>
              <div class="badge ${badgeClass}">${tipoText}</div>
              <button class="btn-jugar">Jugar Ahora</button>
            </div>`;
      card.querySelector(".btn-jugar").addEventListener("click", () => this.mostrarJuego(juego));
      grid.appendChild(card);
    });

    this.actualizarPaginacion();
  }

  mostrarJuego(juego) {
    // Ocultar catálogo
    this.shadowRoot.getElementById('filtrosContainer').classList.add('hidden');
    this.shadowRoot.getElementById('juegosGrid').classList.add('hidden');
    this.shadowRoot.getElementById('paginacion').classList.add('hidden');

    const juegoContainer = this.shadowRoot.getElementById("juegoContainer");
    juegoContainer.innerHTML = `
          <div class="juego-activo juego-fullwidth">
            <div class="volver-container">
              <button class="volver-btn" id="volverBtn">Volver al Catálogo</button>
            </div>
            <div id="juegoContent"></div>
          </div>`;

    this.shadowRoot.getElementById("volverBtn").addEventListener("click", () => this.volverAlCatalogo());

    const juegoContent = this.shadowRoot.getElementById("juegoContent");
    const map = {
      1: this.test.bind(this),
      2: this.ordenar.bind(this),
      3: this.completar.bind(this),
      4: this.sopa.bind(this)
    };
    (map[juego.idTipoJuego] || this.sopa.bind(this))(juego.idJuego);

    this.iniciarTemporizador();
  }

  volverAlCatalogo() {
    // Detener temporizadores
    if (this.inactividadTimer) {
      clearTimeout(this.inactividadTimer);
      this.inactividadTimer = null;
    }
    if (this.intervaloTimer) {
      clearInterval(this.intervaloTimer);
      this.intervaloTimer = null;
    }

    // Limpiar juego
    this.shadowRoot.getElementById("juegoContainer").innerHTML = "";

    // Mostrar catálogo
    this.shadowRoot.getElementById('filtrosContainer').classList.remove('hidden');
    this.shadowRoot.getElementById('juegosGrid').classList.remove('hidden');
    this.shadowRoot.getElementById('paginacion').classList.remove('hidden');

    // Refrescar vista
    this.mostrarJuegos();
  }

  reiniciarTemporizador() {
    if (this.inactividadTimer) clearTimeout(this.inactividadTimer);
    if (this.intervaloTimer) clearInterval(this.intervaloTimer);
    this.iniciarTemporizador();
  }

  iniciarTemporizador() {
    // Solo si estamos dentro de un juego
    if (!this.shadowRoot.getElementById("juegoContent")) return;

    let tiempoRestante = this.tiempoMaximo / 1000; // en segundos

    // Limpiar intervalos previos
    if (this.intervaloTimer) clearInterval(this.intervaloTimer);
    if (this.inactividadTimer) clearTimeout(this.inactividadTimer);

    // Intervalo que se ejecuta cada segundo para imprimir tiempo restante
    this.intervaloTimer = setInterval(() => {
      //console.log(`⏳ Tiempo restante: ${tiempoRestante}s`);
      tiempoRestante--;
      if (tiempoRestante < 0) clearInterval(this.intervaloTimer);
    }, 1000);

    // Timeout que ejecuta volver al catálogo
    this.inactividadTimer = setTimeout(() => {
      // console.log(" Tiempo de inactividad alcanzado. Volviendo al catálogo...");
      this.volverAlCatalogo();
      clearInterval(this.intervaloTimer); // detener el intervalo
    }, this.tiempoMaximo);

    // Eventos para reiniciar temporizador al interactuar
    if (!this._listenersAdded) {
      const reset = () => this.reiniciarTemporizador();
      this.shadowRoot.addEventListener("click", reset);
      this.shadowRoot.addEventListener("mousemove", reset);
      this.shadowRoot.addEventListener("touchstart", reset);
      this.shadowRoot.addEventListener("touchmove", reset);
      this._listenersAdded = true;
    }
  }

  actualizarPaginacion() {
    const total = Math.ceil(this.juegosFiltrados.length / this.juegosPorPagina);
    const pag = this.shadowRoot.getElementById("paginacion");
    if (!pag || total <= 1) {
      pag.innerHTML = "";
      return;
    }

    let html = `<button class="paginacion-btn" id="prevBtn" ${this.paginaActual === 1 ? "disabled" : ""}>Anterior</button>`;
    for (let i = 1; i <= total; i++) {
      html += `<button class="paginacion-btn ${i === this.paginaActual ? "active" : ""}" data-pagina="${i}">${i}</button>`;
    }
    html += `<button class="paginacion-btn" id="nextBtn" ${this.paginaActual === total ? "disabled" : ""}>Siguiente</button>`;
    pag.innerHTML = html;

    this.shadowRoot.getElementById("prevBtn")?.addEventListener("click", () => {
      if (this.paginaActual > 1) { this.paginaActual--; this.mostrarJuegos(); }
    });
    this.shadowRoot.getElementById("nextBtn")?.addEventListener("click", () => {
      if (this.paginaActual < total) { this.paginaActual++; this.mostrarJuegos(); }
    });
    this.shadowRoot.querySelectorAll("[data-pagina]").forEach(b => {
      b.addEventListener("click", () => {
        this.paginaActual = +b.dataset.pagina;
        this.mostrarJuegos();
      });
    });
  }

  async inicializar() {
    this.todosLosJuegos = await this.obtenerJuegos();
    this.juegosFiltrados = [...this.todosLosJuegos];
    this.mostrarJuegos();

    this.shadowRoot.querySelectorAll(".filtro-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.shadowRoot.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.filtrarJuegos(btn.dataset.filtro);
      });
    });
  }

  completar(id) {
    const cont = this.shadowRoot.getElementById("juegoContent");
    if (!cont) return;

    const imgIntro = this.getAttribute("img-intro") || "public/images/default.png";
    const webmFinal = this.getAttribute("webm-final") || "public/video/default.webm";
    const imgRondas = this.getAttribute("img-rondas") || "public/images/default_rondas.png";

    cont.innerHTML = `
    <div style="width:100%;">
      <completar-texto-component 
        img-intro="${imgIntro}" 
        webm-final="${webmFinal}" 
        img-rondas="${imgRondas}" 
        id-completar="${id}">
      </completar-texto-component>
    </div>
  `;
  }

  sopa(id) {
    const cont = this.shadowRoot.getElementById("juegoContent");
    if (!cont) return;

    const modal1Video = this.getAttribute("modal1-video") || "public/video/superdato_anotando.webm";
    const modal2Video = this.getAttribute("modal2-video") || "public/video/superdato_idea.webm";
    const superdatoImg = this.getAttribute("superdato-img") || "public/images/superdato_señalando.png";

    cont.innerHTML = `
    <div style="width:100%;">
      <sopa-letras-component 
        size="14" 
        id-sopa="${id}" 
        modal1-video="${modal1Video}" 
        modal2-video="${modal2Video}" 
        superdato-img="${superdatoImg}">
      </sopa-letras-component>
    </div>
  `;
  }



  test(id) {
    const cont = this.shadowRoot.getElementById("juegoContent");
    if (!cont) return;

    const correctaSVG = this.getAttribute("correcta-svg") || "public/images/correcta.svg";
    const incorrectaSVG = this.getAttribute("incorrecta-svg") || "public/images/incorrecta.svg";
    const characterPNG = this.getAttribute("character-png") || "public/images/superdato_2.png";

    cont.innerHTML = `
    <test-component 
      style-url="src/components/test/test.css" 
      correcta_svg="${correctaSVG}" 
      incorrecta_svg="${incorrectaSVG}" 
      character_png="${characterPNG}" 
      id-test="${id}">
    </test-component>
  `;
  }

  ordenar(id) {
    const cont = this.shadowRoot.getElementById("juegoContent");
    if (!cont) return;

    const videoFinalSrc = this.getAttribute("video-final-src") || "public/video/super_dato_sonrie.webm";
    const inicioVideoSrc = this.getAttribute("inicio-video-src") || "public/video/super_dato_saluda.webm";

    cont.innerHTML = `
    <juego-ordena-letras-component 
      id-ordenar="${id}" 
      video-final-src="${videoFinalSrc}" 
      inicio-video-src="${inicioVideoSrc}" 
      style="width:100%;">
    </juego-ordena-letras-component>
  `;
  }

}

customElements.define("menu-juegos-component", MenuJuegosComponent);
