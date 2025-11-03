class TestViewerComponent extends HTMLElement {


  get serviceId() {
    const id = this.getAttribute("service-id") || 1;
    return Number(id);
  }
  constructor() {

    super();
    this.attachShadow({ mode: "open" });
    this.preguntas = [];
    this.filteredPreguntas = [];
    this.currentPage = 1;
    this.pageSize = 5;

    this.shadowRoot.innerHTML = `
      <style>
* {
  font-family: "Raleway", Arial, sans-serif;
}
:host {
  font-family: "Raleway", Arial, sans-serif;
  display: block;
  max-width: 1200px;
  margin: auto;
}
button {
  font-family: "Raleway", Arial, sans-serif;
}
.pregunta {
  background: white;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.pregunta h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.pregunta.inactiva {
  opacity: 0.55;
  filter: grayscale(20%);
  position: relative;
}

.estado {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: rgba(0, 0, 0, 1);
}
.estado::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 999px;
  display: inline-block;
}
.estado.activa::before {
  background: #10b981;
}
.estado.inactiva::before {
  background: #6b7280;
}

.respuesta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0;
  border-bottom: 1px solid #eee;
}
.badge {
  min-width: 70px;
  text-align: center;
  border-radius: 100px;
  font-size: 0.75rem;
  color: white;
  padding: 0.2rem 0.5rem;
}
.badge-success {
  background: rgb(0, 53, 160);
}
.badge-danger {
  background: rgb(207, 172, 100);
}
.btn {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  margin-right: 0.3rem;
}
.btn-edit {
  background: #1f4388;
  color: white;
}
.btn-delete {
  background: #c74b27;
  color: white;
}

.btn-toggle {
  background: #6b7280;
  color: #fff;
}

.pagination {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  margin-bottom: 10px;
}
.pagination button {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  cursor: pointer;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
#prevBtn,
#nextBtn {
  background: #1f4388;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;
}
#prevBtn:hover,
#nextBtn:hover {
  background: #3730a3;
}
#pageInfo {
  margin: 0 12px;
  font-size: 0.9rem;
  color: #444;
}
#search {
  width: 100%;
  height: 30px;
  margin-bottom: 20px;
  margin-top: 20px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 0.9rem;
}
@media (max-width: 500px) {
  #search {
    width: 90%;
    margin: 0 auto 20px auto;
    display: block;
    margin-top: 20px;
  }
}
      </style>

      <input type="text" id="search" placeholder="Buscar por pregunta u opción...">
      <div id="container"></div>
      <div class="pagination">
        <button id="prevBtn">Anterior</button>
        <span id="pageInfo"></span>
        <button id="nextBtn">Siguiente</button>
      </div>
    `;
  }

  async connectedCallback() {

    try {
      const datos = await CRUDTestService.obtenerPreguntasTestJuego(this.serviceId);
      this.preguntas = Array.isArray(datos) ? datos : [];
    } catch (err) {
      console.error("Error al obtener preguntas:", err);
      this.preguntas = [];
    }

    this.filteredPreguntas = [...this.preguntas];
    this.renderPreguntas();

    this.shadowRoot.querySelector("#prevBtn").addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderPreguntas();
      }
    });

    this.shadowRoot.querySelector("#nextBtn").addEventListener("click", () => {
      const totalPages = Math.ceil(this.filteredPreguntas.length / this.pageSize);
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderPreguntas();
      }
    });

    this.shadowRoot.querySelector("#search").addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      this.filteredPreguntas = this.preguntas.filter(p => {
        const matchEnunciado = p.pregunta.enunciado.toLowerCase().includes(term);
        const matchOpciones = p.respuestas.some(r => r.texto.toLowerCase().includes(term));
        return matchEnunciado || matchOpciones;
      });
      this.currentPage = 1;
      this.renderPreguntas();
    });
  }

  async onUserLogin() {
    this.preguntas = await CRUDTestService.obtenerPreguntasTestJuego(this.serviceId);
    this.filteredPreguntas = [...this.preguntas];
    this.currentPage = 1;
    this.renderPreguntas();
  }


  decodificarHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.textContent = html;
    return txt.innerHTML;
  };

  renderPreguntas() {
    const cont = this.shadowRoot.querySelector("#container");
    cont.innerHTML = "";

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const preguntasPagina = this.filteredPreguntas.slice(start, end);

    preguntasPagina.forEach(item => {
      const p = item.pregunta;
      const respuestas = item.respuestas;
      const div = document.createElement("div");
      div.className = `pregunta ${p.activa ? "" : "inactiva"}`;

      div.innerHTML = `
        <h3 style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;">
          <span>${this.decodificarHtml(p.enunciado)}</span>
          <span class="estado ${p.activa ? "activa" : "inactiva"}">
            ${p.activa ? "Activa" : "Inactiva"}
          </span>
        </h3>
        ${respuestas.map(r => `
          <div class="respuesta">
            <span>${this.decodificarHtml(r.texto)}</span>
            <span class="badge ${r.esCorrecta ? "badge-success" : "badge-danger"}">
              ${r.esCorrecta ? "Correcta" : "Incorrecta"}
            </span>
          </div>
        `).join("")}
        <div style="margin-top:.5rem;">
          <button class="btn btn-edit" title="Editar" aria-label="Editar">✎ Editar</button>
          <button class="btn btn-delete" title="Eliminar" aria-label="Eliminar">✗ Eliminar</button>
          <button class="btn btn-toggle" title="Activar/Desactivar" aria-label="Activar o desactivar">
            ${p.activa ? "Desactivar" : "Activar"}
          </button>
        </div>
      `;

      div.querySelector(".btn-edit").addEventListener("click", () => {
        const formTest = document.querySelector("form-test-component");
        formTest.style.display = 'block';
        formTest.setPregunta({
          idPregunta: p.idPregunta,
          enunciado: p.enunciado,
          tipo: p.tipo,
          activa: p.activa,
          respuestas: respuestas
        });
        formTest.mostrar();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });


      div.querySelector(".btn-delete").addEventListener("click", async () => {
        utilModalJuegos.mostrarMensajeModal(
          "Confirmación",
          "¿Eliminar esta pregunta?",
          () => {
            CRUDTestService.eliminarPregunta(parseInt(p.idPregunta));
            this.eliminarPregunta(p.idPregunta);
          }
        );

      });


      div.querySelector(".btn-toggle").addEventListener("click", async () => {
        const nuevoEstado = !p.activa;
        const resp = await CRUDTestService.cambiarEstadoPregunta(p.idPregunta, nuevoEstado);

        if (!resp) {
          alert("No se pudo cambiar el estado. Intenta de nuevo.");
          return;
        }

        // Actualiza en memoria y re-renderiza
        const syncEstado = (arr) => {
          const idx = arr.findIndex(x => x.pregunta.idPregunta === p.idPregunta);
          if (idx !== -1) arr[idx].pregunta.activa = nuevoEstado;
        };
        syncEstado(this.preguntas);
        syncEstado(this.filteredPreguntas);
        this.renderPreguntas();
      });


      cont.appendChild(div);
    });

    const totalPages = Math.ceil(this.filteredPreguntas.length / this.pageSize);
    this.shadowRoot.querySelector("#pageInfo").textContent = `Página ${this.currentPage} de ${totalPages || 1}`;
    this.shadowRoot.querySelector("#prevBtn").disabled = this.currentPage === 1;
    this.shadowRoot.querySelector("#nextBtn").disabled = this.currentPage === totalPages || totalPages === 0;
  }

  agregarPregunta(nuevaPregunta) {
    const preguntaObj = {
      pregunta: {
        idPregunta: nuevaPregunta.idPregunta,
        enunciado: nuevaPregunta.enunciado,
        tipo: nuevaPregunta.tipo,
        activa: nuevaPregunta.activa
      },
      respuestas: nuevaPregunta.respuestas || []
    };

    this.preguntas.push(preguntaObj);
    this.filteredPreguntas = [...this.preguntas];
    this.renderPreguntas();
  }//

  actualizarPregunta(preguntaActualizada) {
    const id = preguntaActualizada.pregunta.idPregunta;

    const updateInArray = (arr) => {
      const index = arr.findIndex(p => p.pregunta.idPregunta === id);
      if (index !== -1) {
        arr[index] = {
          pregunta: preguntaActualizada.pregunta,
          respuestas: preguntaActualizada.respuestas
        };
      }
    };

    updateInArray(this.preguntas);
    updateInArray(this.filteredPreguntas);

    this.renderPreguntas();
  }

  eliminarPregunta(idPregunta) {
    this.preguntas = this.preguntas.filter(p => p.pregunta.idPregunta !== idPregunta);
    this.filteredPreguntas = this.filteredPreguntas.filter(p => p.pregunta.idPregunta !== idPregunta);
    this.renderPreguntas();
  }


}

customElements.define("test-viewer-component", TestViewerComponent);
