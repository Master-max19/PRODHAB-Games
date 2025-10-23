class FormTestComponent extends HTMLElement {

  static get observedAttributes() {
    return ["modo"];
  }

  set testViewer(component) {
    this._testViewer = component;
  }
  get testViewer() {
    return this._testViewer;
  }

  set modal(component) {
    this._modal = component;
  }
  get modal() {
    return this._modal;
  }
  


  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.currentEditId = null; // ← 🔹 almacena el ID de la pregunta en edición



    this.shadowRoot.innerHTML = `
      <style>
     :host {
  display: block;
  max-width: 1200px;
  margin: 0 auto 10px auto; /* margen arriba: 0, horizontal: auto, abajo: 10px */
  font-family: "Raleway", Arial, sans-serif;
}


        .card {
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 16px;
          background: #fff;
          margin-top: 1rem;
        }

        h2 { font-size: 1.2rem; margin-bottom: 16px; }

        .form-field {
          position: relative;
          margin-bottom: 20px;
        }

        input[type="text"], textarea, select {
          width: 100%;
          padding: 12px;
          font-size: 0.9rem;
          border-radius: 4px;
          border: 1px solid #ccc;
          background: none;
        }

        .form-field label {
          font-family: "Raleway", Arial, sans-serif;
          position: absolute;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          background: #fff;
          padding: 0 4px;
          color: #888;
          font-size: 0.9rem;
          transition: 0.2s ease all;
          pointer-events: none;
        }

        input:focus + label,
        input:not(:placeholder-shown) + label,
        textarea:focus + label,
        textarea:not(:placeholder-shown) + label,
        select:focus + label,
        select.has-value + label {
        font-family:"Raleway", sans-serif;
          top: -8px;
          left: 8px;
          font-size: 0.75rem;
          color: #4f46e5;
        }


        textarea, input{
            box-sizing: border-box; /* Asegura que padding y borde no sobresalgan */

        }

        input, label, option, select, button{
        font-family: "Raleway", Arial, sans-serif;
        }

        .opciones {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .opcion {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
          border: 1px solid #eee;
          padding: 12px;
          border-radius: 6px;
          gap: 8px;
        }

        .correcta-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
        }

        .correcta-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
        }

        .botones-opciones {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .agregar { background: #2196f3; color: #fff; }
        .eliminar-ultima { background: #f44336; color: #fff; }

        .botones-final {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
          gap: 10px;
        }

        #btn-guardar { background: #4f46e5; color: #fff; width: 20%; padding: 10px; }
        #btn-cancelar { background: #d60000ff; color: #fff; width: 20%; padding: 10px; }

        @media (max-width: 480px) {
          .opcion input, .opcion textarea, .opcion select { width: 100%; }
          #btn-guardar, #btn-cancelar { width: 100%; }
        }
      </style>

      <div class="card">
      <h2>${this.getAttribute('modo') === "registrar" ? "Agregar pregunta" : "Editar Pregunta"}</h2>

        <div class="form-field">
          <textarea id="enunciado" rows="3" placeholder=" "></textarea>
          <label for="enunciado">Enunciado</label>
        </div>

        <div class="form-field">
          <select id="tipo">
            <option value="" disabled selected hidden></option>
            <option value="unica">Única respuesta</option>
            <option value="multiple">Múltiple respuesta</option>
          </select>
          <label for="tipo">Tipo de pregunta</label>
        </div>

        <div class="opciones">
          <h3>Opciones</h3>
          <div id="lista-opciones"></div>
          <div class="botones-opciones">
            <button id="btn-agregar" class="agregar" type="button">Agregar opción</button>
            <button id="btn-eliminar-ultima" class="eliminar-ultima" type="button">Eliminar última</button>
          </div>
        </div>

        <div class="botones-final">
          <button id="btn-cancelar" type="button">Cancelar</button>
          <button id="btn-guardar" type="button">Guardar</button>
        </div>
      </div>
    `;
  }




  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "modo") {
      const titulo = this.shadowRoot.querySelector("h2");
      const btnGuardar = this.shadowRoot.getElementById("btn-guardar");
      if (titulo) {
        titulo.textContent = newValue === "registrar" ? "Agregar pregunta" : "Editar Pregunta";
        btnGuardar.textContent = newValue === "registrar" ? "Guardar" : "Actualizar";
      }

      if (newValue === "registrar") {
        this.resetForm();
      }
    }
  }


  connectedCallback() {
    this.form = this.shadowRoot.querySelector(".card"); // <-- aquí se asigna el contenedor
    if (!this.hasAttribute("modo")) {
      this.setAttribute("modo", "registrar");
    }



    this.listaOpciones = this.shadowRoot.querySelector("#lista-opciones");
    this.tipoSelect = this.shadowRoot.querySelector("#tipo");

    // Para que el select tenga label flotante
    this.tipoSelect.addEventListener("change", () => {
      if (this.tipoSelect.value) {
        this.tipoSelect.classList.add("has-value");
      } else {
        this.tipoSelect.classList.remove("has-value");
      }
    });

    this.initAgregarOpcion();
    this.eliminarUltimaOpcion();
    this.enviarPregunta();
    this.cancelar();
    /*
        const preguntas =
        {
          idPregunta: 1,
          enunciado: "¿Cuál es la capital de Francia?",
          tipo: "unica",
          opciones: [
            { idRespuesta: 101, texto: "Madrid", correcta: false, retroalimentacion: "Es la capital de España." },
            { idRespuesta: 102, texto: "París", correcta: true, retroalimentacion: "¡Correcto! París es la capital de Francia." },
            { idRespuesta: 103, texto: "Berlín", correcta: false, retroalimentacion: "Es la capital de Alemania." }
          ]
        };
    
        this.setPregunta(preguntas)
    */



  }

  initAgregarOpcion() {
    const btnAgregar = this.shadowRoot.querySelector("#btn-agregar");
    btnAgregar.addEventListener("click", () => {
      const opcion = document.createElement("div");
      opcion.classList.add("opcion");

      opcion.innerHTML = `
        <div class="form-field">
          <input type="text" placeholder=" " />
          <label>Texto de la opción</label>
        </div>
        <div class="form-field">
          <textarea class="retroalimentacion" rows="2" placeholder=" "></textarea>
          <label>Retroalimentación</label>
        </div>
        <label class="correcta-label">
          <input type="checkbox" class="correcta-checkbox" /> Correcta
        </label>
      `;

      this.listaOpciones.appendChild(opcion);

      const checkbox = opcion.querySelector(".correcta-checkbox");
      checkbox.addEventListener("change", () => {
        if (this.tipoSelect.value === "unica" && checkbox.checked) {
          this.listaOpciones.querySelectorAll(".correcta-checkbox").forEach(cb => {
            if (cb !== checkbox) cb.checked = false;
          });
        }
      });
    });
  }



  /**
 * Carga una única pregunta en el componente y la renderiza en el formulario.
 * 
 * @param {Object} pregunta - Pregunta en formato:
 *   {
 *     idPregunta: 1,
 *     enunciado: "Texto de la pregunta",
 *     tipo: "unica" | "multiple",
 *     opciones: [
 *       { 
 *         idRespuesta: 10,
 *         texto: "Texto de la opción", 
 *         correcta: true/false, 
 *         retroalimentacion: "Texto de retroalimentación"
 *       },
 *       ...
 *     ]
 *   }
 * 
 * Lo que hace la función:
 * 1. Limpia las opciones previas del formulario.
 * 2. Inserta el enunciado y el tipo de pregunta en los campos correspondientes.
 * 3. Recorre cada opción y la dibuja con:
 *    - Campo de texto.
 *    - Campo de retroalimentación.
 *    - Checkbox de "Correcta".
 * 4. Asigna los `idPregunta` y `idRespuesta` como `dataset` en el DOM 
 *    para poder recuperarlos al guardar.
 * 5. Si el tipo de pregunta es "única", fuerza que solo un checkbox pueda estar marcado.
 */


  setPregunta(pregunta) {
    this.setAttribute('modo', "editar")
    this.currentEditId = pregunta.idPregunta; // ← 🔹 guardas el id aquí

    this.listaOpciones.innerHTML = "";

    // Insertar enunciado y tipo
    this.shadowRoot.querySelector("#enunciado").value = pregunta.enunciado || "";
    this.shadowRoot.querySelector("#tipo").value = pregunta.tipo || "";

    if (pregunta.tipo) {
      this.tipoSelect.classList.add("has-value");
    }

    // Renderizar opciones
    pregunta.respuestas.forEach(op => {
      const opcion = document.createElement("div");
      opcion.classList.add("opcion");

      // Guardar IDs en dataset
      opcion.dataset.idPregunta = pregunta.idPregunta || null;
      opcion.dataset.idRespuesta = op.idRespuesta || null;

      opcion.innerHTML = `
      <div class="form-field">
        <input type="text" value="${op.texto || ""}" placeholder=" " />
        <label>Texto de la opción</label>
      </div>
      <div class="form-field">
        <textarea class="retroalimentacion" rows="2" placeholder=" ">${op.retroalimentacion || ""}</textarea>
        <label>Retroalimentación</label>
      </div>
      <label class="correcta-label">
        <input type="checkbox" class="correcta-checkbox" ${op.es_correcta ? "checked" : ""}/> Correcta
      </label>
    `;

      this.listaOpciones.appendChild(opcion);

      // Controlar única respuesta
      const checkbox = opcion.querySelector(".correcta-checkbox");
      checkbox.addEventListener("change", () => {
        if (this.tipoSelect.value === "unica" && checkbox.checked) {
          this.listaOpciones.querySelectorAll(".correcta-checkbox").forEach(cb => {
            if (cb !== checkbox) cb.checked = false;
          });
        }
      });
    });
  }



  eliminarUltimaOpcion() {
    const btnEliminar = this.shadowRoot.querySelector("#btn-eliminar-ultima");
    btnEliminar.addEventListener("click", () => {
      const opciones = this.listaOpciones.querySelectorAll(".opcion");
      if (opciones.length > 0) {
        this.listaOpciones.removeChild(opciones[opciones.length - 1]);
      }
    });
  }

async enviarPregunta() {
  const btnGuardar = this.shadowRoot.querySelector("#btn-guardar");
  if (!btnGuardar) return;

  btnGuardar.onclick = async () => {
    const enunciado = this.shadowRoot.querySelector("#enunciado")?.value.trim();
    const tipo = this.tipoSelect?.value;
    const respuestas = [];

    this.listaOpciones.querySelectorAll(".opcion").forEach(opcionDiv => {
      const texto = opcionDiv.querySelector("input[type='text']")?.value.trim();
      const esCorrecta = opcionDiv.querySelector(".correcta-checkbox")?.checked || false;
      const retroalimentacion = opcionDiv.querySelector(".retroalimentacion")?.value.trim() || "";

      if (texto) {
        respuestas.push({ texto, es_correcta: esCorrecta, retroalimentacion });
      }
    });

    // Validaciones
    const tieneCorrecta = respuestas.some(r => r.es_correcta);
    if (!enunciado || !tipo || respuestas.length === 0 || !tieneCorrecta) {
      this._modal.open({
        title: "Aviso",
        content: "Por favor, completa todos los campos y marca al menos una respuesta correcta.",
        confirm: false
      });
      return;
    }

    const preguntaData = { enunciado, tipo, activa: true };

    try {
      let result = null;

      if (this.getAttribute("modo")?.toLowerCase() === "registrar") {
        // ➕ Crear nueva pregunta
        result = await CRUDTestService.crearPregunta({ ...preguntaData, respuestas }, 1);

        this._modal.open({
          title: "Éxito",
          content: "La pregunta ha sido creada correctamente.",
          confirm: false
        });

        if (this._testViewer) {
          const preguntaConID = {
            idPregunta: result.pregunta.idPregunta,
            enunciado,
            activa: true,
            tipo,
            respuestas
          };
          this._testViewer.agregarPregunta(preguntaConID);
        }

      } else {
        // ✏️ Editar pregunta existente
        if (!this.currentEditId) {
          this._modal.open({
            title: "Error",
            content: "No se encontró la pregunta a editar.",
            confirm: false
          });
          return;
        }

        const id = this.currentEditId;
        result = await CRUDTestService.actualizarPregunta({ ...preguntaData, idPregunta: id, respuestas }, Number(this.currentEditId));

        if (this._testViewer) {
          const preguntaConID = {
            pregunta: { ...preguntaData, idPregunta: id },
            respuestas
          };
          this._testViewer.actualizarPregunta(preguntaConID);
        }

        this._modal.open({
          title: "Éxito",
          content: "La pregunta ha sido actualizada correctamente.",
          confirm: false
        });

        // 🔁 Volver al modo registrar
        this.setAttribute("modo", "registrar");
        this.currentEditId = null;
      }

      this.resetForm();

    } catch (error) {
      console.error(error);
      this._modal.open({
        title: "Error",
        content: "Ocurrió un error al guardar la pregunta.",
        confirm: false
      });
    }
  };
}


  cancelar() {
    const btnCancelar = this.shadowRoot.querySelector("#btn-cancelar");
    btnCancelar.addEventListener("click", () => {
      this.ocultar();
    });
  }




  mostrar() {
    this.shadowRoot.querySelector(".card").style.display = "block";
  }

  ocultar() {
    const card = this.shadowRoot.querySelector(".card");
    card.style.display = "none";
    this.resetForm(); // opcional: borra datos al ocultar
  }

  resetForm() {
    this.shadowRoot.querySelector("#enunciado").value = "";
    this.shadowRoot.querySelector("#tipo").value = "";
    this.shadowRoot.querySelector("#tipo").classList.remove("has-value");
    this.shadowRoot.querySelector("#lista-opciones").innerHTML = "";
  }




}

customElements.define("form-test-component", FormTestComponent);
