class TestComponent extends HTMLElement {

    static get observedAttributes() {
        return ["correcta_svg", "incorrecta_svg", "character_png"];
    }


    constructor() {
        super();
        this.correctaSVG = this.getAttribute("correcta_svg") || `correcta.svg`;
        this.incorrectaSVG = this.getAttribute("incorrecta_svg") || `incorrecta.svg`;
        this.characterPNG = this.getAttribute("character_png") || `character.png`;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = ` `;
        this.listaPreguntas = [];
        this.test = new testClassJuego.Test();
        this.posicionPregunta = 0;
        this.shuffledOptionsMap = new Map();
        this.img = new Image();
        this.img.src = this.characterPNG;
        this.img.alt = "Superdato";
        this.img.className = "pet-icon";
    }

    connectedCallback() {
        this.renderizar();
        this.eventoInciar();
        this.eventoReiniciar();
        this.img.onload = () => {
            this.shadowRoot.getElementById('pet-test-text').appendChild(this.img);
        };
    }


    renderizar() {
        this.shadowRoot.innerHTML =
            ` 
    <style>${this.test.getTestStyle()}</style>

          <div class="container">

      <div class="quiz-container">
        <div class="wrap">
          <main
            class="card"
            role="region"
            aria-label="Evaluación de conocimientos"
          >
            <div class="content">
              <h2 id="titulo-test"></h2>
              <div aria-hidden="true" class="progress">
                <div class="bar" style="width: 0%"></div>
              </div>
                <div class="summary"></div>
              <div
                id="div-stack"
                class="stack"
                aria-label="Listado de preguntas"
              >
                <div class="spinner"></div>
                <span class="cargando">Cargando... </span>
              </div>

              <div class="footer-global">
                <div class="right">
                  <button id="btn-reiniciar" class="primary m">
                    Reiniciar test
                  </button>
                </div>
                <div class="left">
                  <div class="content-pet">
                    <p id="pet-test-text"></p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
        `;
    }


    eventoInciar() {
        const buttons = this.shadowRoot.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                button.style.transform = 'scale(0.98)';
                setTimeout(() => button.style.transform = '', 150);
            });
        });

        this.iniciarTest();
    }

    eventoReiniciar() {
        this.shadowRoot.getElementById('btn-reiniciar').addEventListener('click', () => {
            utilModalJuegos2.mostrarMensajeModal(
                "Reiniciar examen",
                "¿Estás seguro que deseas reiniciar el test?",
                () => {
                    this.reiniciarExamen();
                }
            );
        });
    }


    crearBotones = (index, total) => {
        let html = "";
        if (index > 0) html += `<button class="ghost prev" data-target="${index - 1}" type="button">Anterior</button>`;
        if (index < total - 1) html += `<button class="ghost next" data-target="${index + 1}" type="button">Siguiente</button>`;
        if (index === total - 1) html += `<button class="ghost finish" type="button">Finalizar</button>`;
        return html;
    };




    obtenerOpcionesHTML = (pregunta) => {
        const preguntaId = Number(String(pregunta.id).replace(/^pregunta/, '')); // Numeric ID
        const opciones = utilHtmlJuegos.mezclar(pregunta.opciones);
        // Store shuffled options
        this.shuffledOptionsMap.set(preguntaId, opciones);
        return opciones.map(opcion => {
            const opcionId = Number(String(opcion.id).replace(/^o/, '')); // Numeric ID
            return `
            <div id="option-${opcionId}-${preguntaId}" class="option">
                <span class="bullet"><span class="dot-small"></span></span>
                <span class="option-text">${utilHtmlJuegos.escapeHtml(opcion.texto)}</span>
            </div>`;
        }).join('');
    };




    actualizarBarraProgreso = (posicion) => {
        const totalPreguntas = this.listaPreguntas.length;
        const porcentaje = totalPreguntas > 0 ? ((posicion + 1) / totalPreguntas) * 100 : 0;
        const barra = this.shadowRoot.querySelector('.progress .bar');
        if (barra) barra.style.width = `${porcentaje}%`;
    };



    mostrarError = (preguntaElement) => {
        let errorElement = preguntaElement.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.style.cssText = 'color: #dc2626; margin-top: 10px; font-size: 14px;';
            preguntaElement.querySelector('.q-footer').prepend(errorElement);
        }
        errorElement.textContent = 'Por favor, selecciona una opción antes de continuar';

        setTimeout(() => {
            errorElement.textContent = '';
        }, 3000);
    };





    /**
     * Configura los eventos de navegación (Siguiente y Anterior) para una pregunta.
     * @param {HTMLElement} btnNext - Botón "Siguiente"
     * @param {HTMLElement} btnPrev - Botón "Anterior"
     * @param {number} index - Índice de la pregunta actual
     * @param {HTMLElement} preguntaElement - Elemento contenedor de la pregunta
     * @param {Function} callbacktieneOpcionSeleccionada - Función que devuelve true si alguna opción está seleccionada
     */

    configurarEventoNavegacionPaginada(btnNext, btnPrev, index, preguntaElement, callbacktieneOpcionSeleccionada) {
        if (btnNext) {
            btnNext.onclick = () => {
                if (callbacktieneOpcionSeleccionada()) {
                    this.mostrarPregunta(index + 1);
                } else {
                    this.mostrarError(preguntaElement);
                }
            };
        }
        if (btnPrev) {
            btnPrev.onclick = () => this.mostrarPregunta(index - 1);
        };
    }



    /**
     * Configura el evento para finalizar el test.
     * @param {HTMLElement} btnFinish - Botón "Finalizar"
     * @param {HTMLElement} preguntaElement - Elemento contenedor de la pregunta
     * @param {Function} callbacktieneOpcionSeleccionada - Función que devuelve true si alguna opción está seleccionada
     */

    configurarEventoFinalizar(btnFinish, preguntaElement, callbacktieneOpcionSeleccionada) {
        if (btnFinish) {
            btnFinish.onclick = async () => {
                if (callbacktieneOpcionSeleccionada()) {
                    const divStack = this.shadowRoot.getElementById('div-stack');
                    divStack.innerHTML = `<div class="spinner"></div><span class="cargando">Cargando...</span>`;
                    try {
                        const respuestas = this.test.obtenerRespuestas();
                        if (!respuestas.length) {
                            throw new Error('No hay respuestas seleccionadas para enviar.');
                        }
                        // Optional: Require all questions answered
                        if (respuestas.length < this.listaPreguntas.length) {
                            throw new Error('Por favor, responde todas las preguntas antes de finalizar.');
                        }
                        const serverResponse = await testService.enviarRespuestasTest(respuestas, this.getAttribute('id-test') || null);
                        this.mostrarResultados(serverResponse.detalle);
                        this.actualizarResumen(
                            serverResponse.totalFallos,
                            this.test.obtenerCantidadOpcionesCorrectas(serverResponse.detalle),
                            Number(serverResponse.calificacion).toFixed(2),
                            false, // reiniciar
                            serverResponse.mensaje,
                            serverResponse.totalAciertos,


                        );

                    } catch (error) {
                        let errorMessage = 'Error al enviar las respuestas.';
                        if (error.message.includes('The JSON value could not be converted')) {
                            errorMessage += ' Formato de datos inválido. Verifica los IDs de preguntas y opciones.';
                        } else if (error.message.includes('No se recibieron respuestas')) {
                            errorMessage += ' No se enviaron respuestas válidas.';
                        }
                        divStack.innerHTML = `<p>${errorMessage}</p>`;
                    }
                } else {
                    this.mostrarError(preguntaElement);
                }
            };
        }
    }



    /**
     * Configura el evento de selección de opciones para una pregunta.
     * @param {NodeListOf<HTMLElement>} options - Lista de botones/elementos de opción
     * @param {HTMLElement} preguntaElement - Contenedor de la pregunta
     */


    configurarEventoPreguntas(options, preguntaElement) {
        options.forEach(option => {
            option.onclick = () => {
                const tipo = preguntaElement.getAttribute('data-tipo');
                if (tipo === 'unica') {
                    options.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                } else if (tipo === 'multiple') {
                    option.classList.toggle('selected');
                }
                const errorElement = preguntaElement.querySelector('.error-message');
                if (errorElement) errorElement.textContent = '';
                const id = option.id;
                const partes = id.split('-');
                if (partes.length !== 3) {
                    return;
                }
                const idOpcion = partes[1];
                const idPregunta = partes[2];
                this.test.responder(idPregunta, idOpcion);
            };
        });
    }



    iniciarEventoPreguntas = (preguntaElement, index) => {
        const btnNext = preguntaElement.querySelector(".next");
        const btnPrev = preguntaElement.querySelector(".prev");
        const btnFinish = preguntaElement.querySelector(".finish");
        const options = preguntaElement.querySelectorAll(".option");
        const tieneOpcionSeleccionada = () => preguntaElement.querySelector('.option.selected') !== null;

        this.configurarEventoNavegacionPaginada(btnNext, btnPrev, index, preguntaElement, tieneOpcionSeleccionada);
        this.configurarEventoFinalizar(btnFinish, preguntaElement, tieneOpcionSeleccionada);
        this.configurarEventoPreguntas(options, preguntaElement);

    };



    /**
     * Devuelve una descripción legible del tipo de pregunta.
     *
     * @param {string} categoria - La categoría de la pregunta, que puede ser 'multiple' o cualquier otro valor para selección única.
     * @returns {string} Una cadena que describe si la pregunta es de "Selección múltiple" o "Selección única".
     *
     * @description
     * La función verifica si la categoría es exactamente 'multiple'. Si es así, devuelve "Selección múltiple";
     * de lo contrario, devuelve "Selección única". Esto se utiliza para mostrar información al usuario sobre el tipo de pregunta.
     *
     * @example
     * mostrarTipoPregunta('multiple'); // Devuelve "Selección múltiple"
     * mostrarTipoPregunta('unica');    // Devuelve "Selección única"
     */

    mostrarTipoPregunta(categoria) {
        return categoria === 'multiple' ? 'Selección múltiple' : 'Selección única';
    }

    /**
   * Muestra la pregunta correspondiente según la posición actual y actualiza la barra de progreso.
   *
   * @param {Array} listaPreguntas - Array de objetos que representan todas las preguntas del test.
   * @param {number} posicionPregunta - Índice de la pregunta actual a mostrar.
   * @returns {void} Renderiza la pregunta en el DOM y configura los eventos de interacción.
   *
   * @description
   * La función primero actualiza la barra de progreso según la posición de la pregunta.
   * Si el contenedor 'divStack' está vacío, recorre todas las preguntas y genera el HTML
   * de cada pregunta, incluyendo meta información, título, opciones y botones de navegación.
   * Luego selecciona todas las preguntas en el DOM y les asigna clases CSS para control visual:
   * - "active" para la pregunta actual.
   * - "exit-left" para preguntas anteriores.
   * - "exit-right" para preguntas posteriores.
   * Además, llama a `configurarEventosPregunta` para asignar los eventos onclick correspondientes
   * a botones y opciones de la pregunta activa.
   *
   * @example
   * mostrarPregunta(listaPreguntas, 0);
   * // Muestra la primera pregunta y configura sus eventos
   */

    mostrarPregunta(posicion) {
        this.posicionPregunta = posicion;
        this.actualizarBarraProgreso(posicion);
        const divStack = this.shadowRoot.getElementById('div-stack');
        if (divStack.innerHTML === '' || divStack.querySelector('.spinner')) {
            divStack.innerHTML = '';
            this.listaPreguntas.forEach((pregunta, index) => {
                const preguntaId = Number(String(pregunta.id).replace(/^pregunta/, ''));
                divStack.innerHTML += `
          <section id="pregunta-${preguntaId}" class="q-block" data-tipo="${pregunta.categoria}">
            <div class="q-meta">
              <span class="pill">Pregunta ${index + 1}/${this.listaPreguntas.length}</span>
              <span class="muted">${this.mostrarTipoPregunta(pregunta.categoria)}</span>
            </div>
            <h2 class="q-title">${utilHtmlJuegos.escapeHtml(pregunta.titulo)}</h2>
            <div class="options">${this.obtenerOpcionesHTML(pregunta)}</div>
            <div class="q-footer">
              <div class="left"><div class="result"></div></div>
              <div class="right">${this.crearBotones(index, this.listaPreguntas.length)}</div>
            </div>
          </section>`;
            });
        }
        const preguntas = divStack.querySelectorAll('.q-block');
        preguntas.forEach((pregunta, index) => {
            pregunta.classList.remove('active', 'exit-left', 'exit-right');
            if (index === posicion) {
                pregunta.classList.add('active');
                this.iniciarEventoPreguntas(pregunta, index);
            } else if (index < posicion) {
                pregunta.classList.add('exit-left');
            } else {
                pregunta.classList.add('exit-right');
            }
        });
    }


    /**
     * Renderiza una opción de respuesta con sus estados (seleccionada, correcta/incorrecta).
     * 
     * @param {Object} op - Opción de la pregunta.
     * @param {Object|null} respuestaSeleccionada - Respuesta seleccionada desde el servidor (si existe).
     * @param {string} _PUBLIC - Ruta pública para los iconos.
     * @returns {string} HTML de la opción renderizada.
     */

    renderOpcion(op, respuestaSeleccionada) {
        const idOp = Number(String(op.id).replace(/^o/, ''));
        let seleccionada = false;
        let esCorrecta = false;
        if (respuestaSeleccionada) {
            const opcionServer = respuestaSeleccionada.opciones.find(o => o.idOpcion === idOp);
            seleccionada = opcionServer ? opcionServer.seleccionada : false;
            esCorrecta = opcionServer ? opcionServer.esCorrecta : false;
        }
        const classes = ['option'];
        if (seleccionada) classes.push('selected');
        let iconoExtra = '';
        if (esCorrecta) {
            classes.push('correct');
            iconoExtra = `<img src="${this.correctaSVG}" alt="Correcto" class="icono-respuesta" onerror="this.outerHTML='✔️'">`;
        } else if (seleccionada && !esCorrecta) {
            classes.push('wrong');
            iconoExtra = `<img src="${this.incorrectaSVG}" alt="Incorrecto" class="icono-respuesta" onerror="this.outerHTML='❌'">`;
        }
        return `
      <div class="${classes.join(' ')}" data-id="${op.id}">
        <span class="bullet"><span class="dot-small"></span></span>
        <span class="option-text">${utilHtmlJuegos.escapeHtml(op.texto)}<strong>${iconoExtra}</strong></span>
      </div>`;
    }

    /**
     * Renderiza la retroalimentación para las opciones seleccionadas de una pregunta.
     * 
     * @param {Object} pregunta - Pregunta actual con sus opciones.
     * @param {Object|null} respuestaSeleccionada - Respuesta seleccionada desde el servidor (si existe).
     * @returns {string} HTML de retroalimentación (puede estar vacío).
     */
    renderRetro(pregunta, respuestaSeleccionada) {
        if (!respuestaSeleccionada) return '';

        return respuestaSeleccionada.opciones
            .filter(o => o.seleccionada && o.retroalimentacion && o.retroalimentacion.trim())
            .map(o => {
                return `<div class="retroalimentacion">${utilHtmlJuegos.escapeHtml(o.retroalimentacion)}</div>`;
            })
            .join('');
    }
    /**
 * Renderiza el bloque completo de una pregunta con sus opciones y retroalimentación.
 * 
 * @param {Object} pregunta - Pregunta actual.
 * @param {number} index - Índice de la pregunta en la lista.
 * @param {Array} listaPreguntas - Lista completa de preguntas.
 * @param {Object|null} respuestaSeleccionada - Respuesta seleccionada desde el servidor (si existe).
 * @param {string} opcionesHTML - HTML con las opciones ya renderizadas.
 * @param {string} retroHTML - HTML con retroalimentación ya renderizada.
 * @returns {string} HTML completo de la pregunta.
 */


    renderPregunta(pregunta, index, respuestaSeleccionada) {
        const preguntaId = Number(String(pregunta.id).replace(/^pregunta/, ''));
        const opciones = this.shuffledOptionsMap.get(preguntaId) || pregunta.opciones;
        const opcionesHTML = opciones.map(op => this.renderOpcion(op, respuestaSeleccionada)).join('');
        const retroHTML = this.renderRetro(pregunta, respuestaSeleccionada);
        return `
      <section id="pregunta-${preguntaId}" class="q-block" style="margin-bottom: 20px;">
        <div class="q-meta">
          <span class="pill">Pregunta ${index + 1}/${this.listaPreguntas.length}</span>
          <span class="muted">${this.mostrarTipoPregunta(pregunta.categoria)}</span>
        </div>
        <h2 class="q-title">${utilHtmlJuegos.escapeHtml(pregunta.titulo)}</h2>
        <div class="options">${opcionesHTML}</div>
        ${retroHTML}
        <div class="q-footer">
          <div class="left">
            <div class="result">
              ${respuestaSeleccionada
                ? (respuestaSeleccionada.correcta
                    ? '<span class="correct">Respuesta correcta</span>'
                    : '<span class="wrong">Respuesta incorrecta</span>')
                : '<span class="wrong">No respondida</span>'}
            </div>
          </div>
        </div>
      </section>`;
    }



    mostrarResultados(detalleServidor = []) {
        const divStack = this.shadowRoot.getElementById('div-stack');
        divStack.innerHTML = '';
        this.listaPreguntas.forEach((pregunta, index) => {
            const preguntaId = Number(String(pregunta.id).replace(/^pregunta/, ''));
            const respuestaSeleccionada = detalleServidor.find(r => r.idPregunta === preguntaId);
            divStack.innerHTML += this.renderPregunta(pregunta, index, respuestaSeleccionada);
        });
        divStack.querySelectorAll('.q-block').forEach(p => {
            p.style.position = 'relative';
            p.style.left = '0';
            p.style.opacity = '1';
        });
    }




    actualizarResumen(fallos, correctas, calificacion, reiniciar = false, mensaje, totalPreguntasCorrectas) {
        const summaryDiv = this.shadowRoot.querySelector('.summary');
        const petTestText = this.shadowRoot.getElementById('pet-test-text');
        if (reiniciar) {
            summaryDiv.innerHTML = '';
            petTestText.innerHTML = testService.convertirLinkConEstiloTest(
                testService.interpolarMensajeTest(mensaje, { nota: 0, correctas: 0, fallos: 0 }));
            petTestText.appendChild(this.img);
            return;
        }
        summaryDiv.innerHTML = `
    <div title="Número de preguntas donde todas las opciones correctas fueron seleccionadas de todas las preguntas del test.">
        Items correctos: <strong>${totalPreguntasCorrectas}</strong> de <strong>${this.listaPreguntas.length}</strong>
    </div>
    <div title="Número total de opciones correctas seleccionadas.">
        Selecciones correctas: <strong>${correctas}</strong>
    </div>
    <div title="Número total de respuestas incorrectas seleccionadas.">
        Selecciones incorrectas: <strong>${fallos}</strong>
    </div>
    <div title="Porcentaje de preguntas correctas sobre el total.">
        Calificación: <strong>${calificacion}%</strong>
    </div>
`;

        petTestText.innerHTML = testService.convertirLinkConEstiloTest(
            testService.interpolarMensajeTest(mensaje, { nota: calificacion, correctas, fallos }));
        petTestText.appendChild(this.img);
    }


    async reiniciarExamen() {
        if (this.test) this.test.reiniciar();
        await this.cargarTest(true);
    }

    async iniciarTest() {
        await this.cargarTest(true);
    }


    /**
     * Carga preguntas desde el servidor, inicializa el test y configura la UI inicial.
     *
     * @async
     * @param {boolean} limpiar - Indica si se debe limpiar el contenedor al iniciar.
     * @returns {Promise<void>}
     */

    async cargarTest(limpiar = true) {
        const juegoConPreguntas = await testService.obtenerPreguntasTest(this.getAttribute('id-test') || null);
        const tituloTest = this.shadowRoot.getElementById('titulo-test');
        tituloTest.innerText = juegoConPreguntas.nombre ?? "Test no disponible";
        tituloTest.title = juegoConPreguntas.descripcion?.trim()
            ? juegoConPreguntas.descripcion
            : "En preguntas únicas, la opción correcta vale 1 punto. En preguntas múltiples, cada opción correcta vale parte del punto, y se obtiene el punto completo solo si se seleccionan todas sin errores.";
        const preguntasAPI = juegoConPreguntas?.preguntas || [];
        if (preguntasAPI.length > 0) {
            this.listaPreguntas = preguntasAPI
                .map(testService.mapearPreguntaAPITest)
                .filter(p => p !== null);
            this.test = new testClassJuego.Test(this.listaPreguntas);
            this.posicionPregunta = 0;
            if (limpiar) {
                const divStack = this.shadowRoot.getElementById('div-stack');
                divStack.innerHTML = '';
            }
            this.mostrarPregunta(0);
            this.actualizarBarraProgreso(this.posicionPregunta);
            this.actualizarResumen(0, 0, 0, true, juegoConPreguntas.detalle, 0);
            this.shadowRoot.querySelector('.summary').textContent = tituloTest.title;

        } else {
            const divStack = this.shadowRoot.getElementById('div-stack');
            divStack.innerHTML = '<p>Error al cargar el test</p>';
        }
    }
}

customElements.define('test-component', TestComponent);
