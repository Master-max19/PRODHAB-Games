/**
 * 
 * @version 10/09/2025
 * 
 * Funciones principales para la generación del juego y
 * visualización de las preguntas.
 */


// Obtener referencia al contenedor principal donde se muestran las preguntas
const divStack = document.getElementById("div-stack");

// Obtener referencia al div donde se muestra el resumen de respuestas
const summaryDiv = document.querySelector(".summary");

// Obtener referencia al botón de reiniciar examen
const btnReiniciar = document.getElementById("btn-reiniciar");

// Crear un mapa para guardar las opciones mezcladas de cada pregunta
let shuffledOptionsMap = new Map();

// Array que contendrá la lista de preguntas cargadas desde la API
let listaPreguntas = [];

// Instancia del objeto Test con la lista de preguntas (inicialmente vacía)
let test = new Test(listaPreguntas);

// Variable para llevar el seguimiento de la posición de la pregunta actual
let posicionPregunta = 0;

// Crear un objeto Image para precargar la imagen del "superdato"
const img = new Image();

// Asignar la ruta de la imagen usando la variable _PUBLIC
img.src = `${_PUBLIC}/images/superdato_2.png`;

// Texto alternativo para accesibilidad en caso de que la imagen no cargue
img.alt = "Superdato";

// Clase CSS para aplicar estilos a la imagen
img.className = "pet-icon";

// Evento que se dispara cuando la imagen termina de cargarse
img.onload = () => {
    // Insertar la imagen dentro del contenedor 'pet-test-text' una vez cargada
    document.getElementById("pet-test-text").appendChild(img);
};


/**
 * Genera los botones de navegación para una pregunta del test.
 *
 * @param {number} index - El índice de la pregunta actual en la lista.
 * @param {number} total - El total de preguntas en el test.
 * @returns {string} HTML con los botones "Anterior", "Siguiente" y/o "Finalizar"
 *                   según la posición de la pregunta actual.
 *
 * @example
 * // Para la primera pregunta en un test de 5 preguntas:
 * crearBotones(0, 5);
 * // Devuelve solo el botón "Siguiente"
 *
 * @example
 * // Para la última pregunta:
 * crearBotones(4, 5);
 * // Devuelve solo el botón "Finalizar"
 */

const crearBotones = (index, total) => {
    let html = "";
    if (index > 0) html += `<button class="ghost prev" data-target="${index - 1}" type="button">Anterior</button>`;
    if (index < total - 1) html += `<button class="ghost next" data-target="${index + 1}" type="button">Siguiente</button>`;
    if (index === total - 1) html += `<button class="ghost finish" type="button">Finalizar</button>`;
    return html;
};

/**
 * Genera el HTML de las opciones para una pregunta del test.
 *
 * @param {Object} pregunta - Objeto que representa la pregunta, incluyendo su id y array de opciones.
 *                            Se espera que cada opción tenga un id y un texto.
 * @returns {string} Un string con el HTML de todas las opciones mezcladas, listo para insertarse en el DOM.
 *
 * @description
 * La función primero obtiene un ID numérico de la pregunta eliminando el prefijo "pregunta".
 * Luego mezcla aleatoriamente las opciones usando la función `mezclarOpciones`.
 * Guarda las opciones mezcladas en `shuffledOptionsMap` para poder acceder a ellas más tarde.
 * Finalmente, genera un bloque `<div>` por cada opción, con un id único basado en la opción y pregunta,
 * incluyendo la estructura de "bullet" y el texto de la opción, y devuelve todo concatenado como string.
 *
 * @example
 * // Suponiendo una pregunta con id "pregunta3" y dos opciones:
 * obtenerOpcionesHTML({ id: "pregunta3", opciones: [{id:"o1", texto:"Sí"}, {id:"o2", texto:"No"}] });
 * // Devuelve HTML para los dos divs de opciones con IDs únicos.
 */


const obtenerOpcionesHTML = (pregunta) => {
    const preguntaId = Number(String(pregunta.id).replace(/^pregunta/, '')); // Numeric ID
    const opciones = mezclarOpcionesTest(pregunta);
    // Store shuffled options
    shuffledOptionsMap.set(preguntaId, opciones);
    return opciones.map(opcion => {
        const opcionId = Number(String(opcion.id).replace(/^o/, '')); // Numeric ID
        return `
            <div id="option-${opcionId}-${preguntaId}" class="option">
                <span class="bullet"><span class="dot-small"></span></span>
                <span class="option-text">${opcion.texto}</span>
            </div>`;
    }).join('');
};


/**
 * Actualiza visualmente la barra de progreso del test según la posición de la pregunta actual.
 *
 * @param {number} posicion - Índice de la pregunta actual (empezando desde 0).
 * @returns {void} Modifica el estilo de ancho de la barra de progreso en el DOM.
 *
 * @description
 * La función calcula el porcentaje de progreso dividiendo la posición actual de la pregunta
 * entre el total de preguntas y multiplicando por 100. Luego selecciona el elemento que representa
 * la barra de progreso con el selector '.progress .bar' y ajusta su propiedad 'width' al porcentaje calculado.
 * Si no hay preguntas o el elemento de la barra no existe, no hace nada.
 *
 * @example
 * // Para la segunda pregunta de un test de 5 preguntas:
 * actualizarBarraProgreso(1);
 * // La barra de progreso se ajustará al 40%.
 */

const actualizarBarraProgreso = (posicion) => {
    const totalPreguntas = listaPreguntas.length;
    const porcentaje = totalPreguntas > 0 ? ((posicion + 1) / totalPreguntas) * 100 : 0;
    const barra = document.querySelector('.progress .bar');
    if (barra) barra.style.width = `${porcentaje}%`;
};

/**
 * Muestra un mensaje de error temporal en una pregunta cuando el usuario no ha seleccionado ninguna opción.
 *
 * @param {HTMLElement} preguntaElement - El contenedor de la pregunta en el DOM donde se mostrará el error.
 * @returns {void} Inserta o actualiza un div de error dentro del footer de la pregunta y lo oculta automáticamente después de 3 segundos.
 *
 * @description
 * La función primero verifica si ya existe un elemento con la clase 'error-message' dentro de la pregunta.
 * Si no existe, lo crea, le asigna la clase correspondiente y algunos estilos CSS, y lo inserta al inicio del
 * footer de la pregunta ('.q-footer'). Luego establece el texto de error indicando que se debe seleccionar una opción.
 * Finalmente, utiliza setTimeout para limpiar el mensaje después de 3 segundos.
 *
 * @example
 * const pregunta = document.getElementById('pregunta-1');
 * mostrarError(pregunta);
 * // Se mostrará el mensaje "Por favor, selecciona una opción antes de continuar" durante 3 segundos.
 */


const mostrarError = (preguntaElement) => {
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

function configurarEventoNavegacionPaginada(btnNext, btnPrev, index, preguntaElement, callbacktieneOpcionSeleccionada) {
    if (btnNext) {
        btnNext.onclick = () => {
            if (callbacktieneOpcionSeleccionada()) {
                mostrarPregunta(listaPreguntas, index + 1);
            } else {
                mostrarError(preguntaElement);
            }
        };
    }
    if (btnPrev) {
        btnPrev.onclick = () => {
            mostrarPregunta(listaPreguntas, index - 1);
        };
    }
}



/**
 * Configura el evento para finalizar el test.
 * @param {HTMLElement} btnFinish - Botón "Finalizar"
 * @param {HTMLElement} preguntaElement - Elemento contenedor de la pregunta
 * @param {Function} callbacktieneOpcionSeleccionada - Función que devuelve true si alguna opción está seleccionada
 */

function configurarEventoFinalizar(btnFinish, preguntaElement, callbacktieneOpcionSeleccionada) {
    if (btnFinish) {
        btnFinish.onclick = async () => {
            if (callbacktieneOpcionSeleccionada()) {
                divStack.innerHTML = `<div class="spinner"></div><span class="cargando">Cargando...</span>`;
                try {
                    const respuestas = test.obtenerRespuestas();
                    if (!respuestas.length) {
                        throw new Error('No hay respuestas seleccionadas para enviar.');
                    }
                    // Optional: Require all questions answered
                    if (respuestas.length < listaPreguntas.length) {
                        throw new Error('Por favor, responde todas las preguntas antes de finalizar.');
                    }
                    const serverResponse = await enviarRespuestasTest(respuestas);
                    mostrarResultados(serverResponse.detalle);
                    actualizarResumen(
                        serverResponse.totalFallos,
                        serverResponse.totalAciertos,
                        serverResponse.calificacion,
                        false, // reiniciar
                        serverResponse.mensaje // mensaje
                    );

                } catch (error) {
                    console.error('Error en guardarRespuestas:', error);
                    let errorMessage = 'Error al enviar las respuestas.';
                    if (error.message.includes('The JSON value could not be converted')) {
                        errorMessage += ' Formato de datos inválido. Verifica los IDs de preguntas y opciones.';
                    } else if (error.message.includes('No se recibieron respuestas')) {
                        errorMessage += ' No se enviaron respuestas válidas.';
                    }
                    divStack.innerHTML = `<p>${errorMessage}</p>`;
                }
            } else {
                mostrarError(preguntaElement);
            }
        };
    }
}



/**
 * Configura el evento de selección de opciones para una pregunta.
 * @param {NodeListOf<HTMLElement>} options - Lista de botones/elementos de opción
 * @param {HTMLElement} preguntaElement - Contenedor de la pregunta
 */


function configurarEventoPreguntas(options, preguntaElement) {
    options.forEach((option) => {
        option.onclick = () => {
            const tipo = preguntaElement.getAttribute("data-tipo");
            if (tipo === "unica") {
                options.forEach((opt) => opt.classList.remove("selected"));
                option.classList.add("selected");
            } else if (tipo === "multiple") {
                option.classList.toggle("selected");
            }

            const errorElement = preguntaElement.querySelector('.error-message');
            if (errorElement) errorElement.textContent = '';

            const id = option.id;
            const partes = id.split("-");
            if (partes.length !== 3) {
                console.error(`Formato de ID inválido: ${id}`);
                return;
            }
            const idOpcion = partes[1]; // Numeric ID
            const idPregunta = partes[2]; // Numeric ID
            console.log(`Opción seleccionada: idPregunta=${idPregunta}, idOpcion=${idOpcion}`);
            test.responder(idPregunta, idOpcion);
        };
    });

}


/**
 * Configura los eventos de interacción para una pregunta específica del test.
 *
 * @param {HTMLElement} preguntaElement - El contenedor de la pregunta en el DOM.
 * @param {number} index - Índice de la pregunta actual en la lista de preguntas.
 * @returns {void} Asigna eventos onclick a botones y opciones para manejar la navegación y selección.
 *
 * @description
 * Esta función agrega la lógica de interacción para cada pregunta:
 * - Botón "Siguiente": avanza a la siguiente pregunta solo si se ha seleccionado una opción; de lo contrario muestra un error.
 * - Botón "Anterior": retrocede a la pregunta anterior.
 * - Botón "Finalizar": envía las respuestas al servidor si todas las preguntas han sido respondidas,
 *   muestra un spinner mientras se procesa, luego llama a mostrarResultados y actualizarResumen.
 * - Opciones de respuesta: maneja la selección de opciones. Si la pregunta es de tipo "unica", solo permite seleccionar una opción; 
 *   si es de tipo "multiple", permite seleccionar varias. También limpia mensajes de error existentes.
 * - Los IDs de opciones deben tener el formato "option-{idOpcion}-{idPregunta}" para que se pueda extraer correctamente la información.
 *
 * @example
 * const pregunta = document.getElementById('pregunta-1');
 * configurarEventosPregunta(pregunta, 0);
 * // Ahora los botones y opciones de esa pregunta responderán a clicks del usuario correctamente.
 */


const iniciarEventoPreguntas = (preguntaElement, index) => {
    const btnNext = preguntaElement.querySelector(".next");
    const btnPrev = preguntaElement.querySelector(".prev");
    const btnFinish = preguntaElement.querySelector(".finish");
    const options = preguntaElement.querySelectorAll(".option");
    const tieneOpcionSeleccionada = () => preguntaElement.querySelector('.option.selected') !== null;

    configurarEventoNavegacionPaginada(btnNext, btnPrev, index, preguntaElement, tieneOpcionSeleccionada);
    configurarEventoFinalizar(btnFinish, preguntaElement, tieneOpcionSeleccionada);
    configurarEventoPreguntas(options, preguntaElement);

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

function mostrarTipoPregunta(categoria) {
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

const mostrarPregunta = (listaPreguntas, posicionPregunta) => {
    actualizarBarraProgreso(posicionPregunta);

    if (divStack.innerHTML === "") {
        listaPreguntas.forEach((pregunta, index) => {
            const preguntaId = Number(String(pregunta.id).replace(/^pregunta/, '')); // Numeric ID
            divStack.innerHTML += `
                <section id="pregunta-${preguntaId}" class="q-block" data-tipo="${pregunta.categoria}">
                    <div class="q-meta">
                        <span class="pill">Pregunta ${index + 1}/${listaPreguntas.length}</span>
                        <span class="muted">${mostrarTipoPregunta(pregunta.categoria)}</span>
                    </div>
                    <h2 class="q-title">${pregunta.titulo}</h2>
                    <div class="options">${obtenerOpcionesHTML(pregunta)}</div>
                    <div class="q-footer">
                        <div class="left"><div class="result"></div></div>
                        <div class="right">${crearBotones(index, listaPreguntas.length)}</div>
                    </div>
                </section>`;
        });
    }

    const preguntas = divStack.querySelectorAll(".q-block");
    preguntas.forEach((pregunta, index) => {
        pregunta.classList.remove("active", "exit-left", "exit-right");
        if (index === posicionPregunta) {
            pregunta.classList.add("active");
            iniciarEventoPreguntas(pregunta, index);
        } else if (index < posicionPregunta) {
            pregunta.classList.add("exit-left");
        } else {
            pregunta.classList.add("exit-right");
        }
    });
};

/**
 * Renderiza una opción de respuesta con sus estados (seleccionada, correcta/incorrecta).
 * 
 * @param {Object} op - Opción de la pregunta.
 * @param {Object|null} respuestaSeleccionada - Respuesta seleccionada desde el servidor (si existe).
 * @param {string} _PUBLIC - Ruta pública para los iconos.
 * @returns {string} HTML de la opción renderizada.
 */

function renderOpcion(op, respuestaSeleccionada, _PUBLIC) {
    const idOp = Number(String(op.id).replace(/^o/, ''));
    let seleccionada = false;
    let esCorrecta = false;

    if (respuestaSeleccionada) {
        const opcionServer = respuestaSeleccionada.opciones.find(o => o.idOpcion === idOp);
        seleccionada = opcionServer ? opcionServer.seleccionada : false;
        esCorrecta = opcionServer ? opcionServer.es_correcta : false;
    }

    const classes = ["option"];
    if (seleccionada) classes.push("selected");

    let iconoExtra = "";
    if (esCorrecta) {
        classes.push("correct");
        iconoExtra = `<img src="${_PUBLIC}/images/correcta.svg" alt="Correcto" class="icono-respuesta" onerror="this.outerHTML='✔️'">`;
    } else if (seleccionada && !esCorrecta) {
        classes.push("wrong");
        iconoExtra = `<img src="${_PUBLIC}/images/incorrecta.svg" alt="Incorrecto" class="icono-respuesta" onerror="this.outerHTML='❌'">`;
    }

    return `
        <div class="${classes.join(" ")}" data-id="${op.id}">
            <span class="bullet"><span class="dot-small"></span></span>
            <span class="option-text">${op.texto}<strong>${iconoExtra}</strong></span>
        </div>`;
}

/**
 * Renderiza la retroalimentación para las opciones seleccionadas de una pregunta.
 * 
 * @param {Object} pregunta - Pregunta actual con sus opciones.
 * @param {Object|null} respuestaSeleccionada - Respuesta seleccionada desde el servidor (si existe).
 * @returns {string} HTML de retroalimentación (puede estar vacío).
 */
function renderRetro(pregunta, respuestaSeleccionada) {
    if (!respuestaSeleccionada) return "";

    const opcionesMarcadas = respuestaSeleccionada.opciones
        .filter(o => o.seleccionada)
        .map(o => o.idOpcion);

    return opcionesMarcadas.map(idOp => {
        const opcion = pregunta.opciones.find(o => Number(String(o.id).replace(/^o/, '')) === idOp);
        return opcion && opcion.retroalimentacion
            ? `<div class="retroalimentacion">${opcion.retroalimentacion}</div>`
            : "";
    }).join("");
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



function renderPregunta(pregunta, index, listaPreguntas, respuestaSeleccionada, opcionesHTML, retroHTML) {
    const preguntaId = Number(String(pregunta.id).replace(/^pregunta/, ''));

    return `
        <section id="pregunta-${preguntaId}" class="q-block" style="margin-bottom: 20px;">
            <div class="q-meta">
                <span class="pill">Pregunta ${index + 1}/${listaPreguntas.length}</span>
                <span class="muted">${mostrarTipoPregunta(pregunta.categoria)}</span>
            </div>
            <h2 class="q-title">${pregunta.titulo}</h2>
            <div class="options">${opcionesHTML}</div>
            ${retroHTML}
            <div class="q-footer">
                <div class="left">
                    <div class="result">
                        ${respuestaSeleccionada
            ? (respuestaSeleccionada.correcta
                ? '<span class="correct">Respuesta correcta</span>'
                : '<span class="wrong">Respuesta incorrecta</span>')
            : '<span class="wrong">No respondida</span>'
        }
                    </div>
                </div>
            </div>
        </section>`;
}


/**
 * Muestra los resultados finales del test, incluyendo selección del usuario, aciertos, errores y retroalimentación.
 *
 * @param {Array} detalleServidor - Array de objetos que representa la respuesta del servidor,
 *                                  cada objeto contiene idPregunta y opciones con sus estados.
 *                                  Por defecto es un array vacío.
 * @returns {void} Renderiza todas las preguntas con sus resultados en el contenedor `divStack`.
 *
 * @description
 * La función limpia el contenedor principal `divStack` y recorre todas las preguntas.
 * Para cada pregunta:
 * - Obtiene el ID numérico de la pregunta eliminando el prefijo "pregunta".
 * - Busca la respuesta seleccionada por el usuario en `detalleServidor`.
 * - Obtiene las opciones mezcladas desde `shuffledOptionsMap` o, en su defecto, las originales.
 * - Construye el HTML de cada opción incluyendo:
 *   - Clase "selected" si fue seleccionada.
 *   - Clase "correct" si la opción es correcta.
 *   - Clase "wrong" si la opción fue seleccionada pero incorrecta.
 *   - Iconos de correcto/incorrecto con fallback en texto si no se carga la imagen.
 * - Genera retroalimentación para las opciones seleccionadas si existe.
 * - Inserta todo el HTML de la pregunta en el DOM.
 * Finalmente, asegura que cada pregunta tenga estilos `position: relative`, `left: 0` y `opacity: 1`.
 *
 * @example
 * mostrarResultados([
 *   { idPregunta: 1, correcta: true, opciones: [{idOpcion: 1, seleccionada: true, es_correcta: true}] }
 * ]);
 * // Renderiza la pregunta 1 con la opción seleccionada marcada y correcta
 */


// 🔹 Función principal
const mostrarResultados = (detalleServidor = []) => {
    divStack.innerHTML = "";

    listaPreguntas.forEach((pregunta, index) => {
        const preguntaId = Number(String(pregunta.id).replace(/^pregunta/, ''));
        const respuestaSeleccionada = detalleServidor.find(r => r.idPregunta === preguntaId);
        const opciones = shuffledOptionsMap.get(preguntaId) || pregunta.opciones;

        const opcionesHTML = opciones.map(op => renderOpcion(op, respuestaSeleccionada, _PUBLIC)).join("");
        const retroHTML = renderRetro(pregunta, respuestaSeleccionada);

        divStack.innerHTML += renderPregunta(pregunta, index, listaPreguntas, respuestaSeleccionada, opcionesHTML, retroHTML);
    });

    // Ajuste de estilo
    divStack.querySelectorAll(".q-block").forEach(p => {
        p.style.position = "relative";
        p.style.left = "0";
        p.style.opacity = "1";
    });
};



/**
 * Actualiza el resumen del test, mostrando estadísticas y mensaje final, y opcionalmente reinicia el test.
 *
 * @param {number} fallos - Cantidad de respuestas incorrectas.
 * @param {number} correctas - Cantidad de respuestas correctas.
 * @param {number} calificacion - Porcentaje de aciertos.
 * @param {boolean} [reiniciar=false] - Indica si se está reiniciando el test. Si es true, solo muestra el mensaje inicial.
 * @param {string} mensaje - Mensaje que se mostrará al usuario, puede incluir variables para interpolar.
 * @returns {void} Actualiza el DOM con los resultados o mensaje inicial y añade la imagen de mascota.
 *
 * @description
 * - Si `reiniciar` es true, limpia el resumen, muestra el mensaje inicial y vuelve a insertar la imagen `img`.
 * - Si `reiniciar` es false, muestra en `summaryDiv` la cantidad de respuestas correctas, fallos y calificación.
 * - Interpola variables en el mensaje usando `interpolarMensaje`.
 * - Convierte los links del mensaje a un estilo adecuado con `convertirLinkConEstilo`.
 * - Inserta la imagen `img` al final del mensaje en `pet-test-text`.
 *
 * @example
 * actualizarResumen(2, 8, 80, false, "¡Buen trabajo! Tu nota es {nota}%");
 * // Muestra el resumen con estadísticas y mensaje final, manteniendo la imagen visible
 */


const actualizarResumen = (fallos, correctas, calificacion, reiniciar = false, mensaje) => {
    if (reiniciar) {
        summaryDiv.innerHTML = ``;
        document.getElementById('pet-test-text').innerHTML = mensaje;
        document.getElementById("pet-test-text").appendChild(img);

        return;
    }
    summaryDiv.innerHTML = `Respuestas correctas: ${correctas} <br> Total de fallos: ${fallos} <br> Calificación: ${calificacion}%`;

    // Interpolar variables del mensaje de DB
    mensaje = interpolarMensajeTest(mensaje, { nota: calificacion, correctas, fallos });
    document.getElementById('pet-test-text').innerHTML = convertirLinkConEstiloTest(mensaje);
    document.getElementById("pet-test-text").appendChild(img);
};



/**
 * Reinicia el examen, recargando las preguntas desde el servidor y restableciendo el estado del test.
 *
 * @async
 * @returns {Promise<void>} Reinicia el test, actualiza el DOM y muestra el mensaje inicial.
 *
 * @description
 * - Llama al método `reiniciar` del objeto `test` si existe.
 * - Limpia el contenedor `divStack`.
 * - Obtiene nuevas preguntas desde la función asincrónica `obtenerPreguntas`.
 * - Convierte las preguntas recibidas con `mapearPreguntaAPI` y filtra elementos inválidos.
 * - Crea un nuevo objeto `Test` con las preguntas procesadas.
 * - Inicializa `posicionPregunta` en 0.
 * - Muestra la primera pregunta con `mostrarPregunta`.
 * - Actualiza la barra de progreso.
 * - Llama a `actualizarResumen` con valores iniciales y el mensaje de detalle de la API.
 *
 * @example
 * reiniciarExamen();
 * // El examen se reinicia, las preguntas se recargan y se muestra el mensaje inicial.
 */

const reiniciarExamen = async () => {
    if (test) test.reiniciar();
    divStack.innerHTML = '';
    shuffledOptionsMap.clear();

    await cargarTest(false); // false porque ya limpiamos arriba
};

/**
 * Inicializa el test cargando preguntas desde el servidor y configurando el estado inicial.
 *
 * @async
 * @returns {Promise<void>} Carga las preguntas, crea un nuevo test, y muestra la primera pregunta.
 *
 * @description
 * - Llama a la función asincrónica `obtenerPreguntas` para obtener las preguntas del servidor.
 * - Accede al array de preguntas dentro del objeto devuelto (`juegoConPreguntas.preguntas`).
 * - Procesa cada pregunta usando `mapearPreguntaAPI` y filtra cualquier valor nulo.
 * - Crea un nuevo objeto `Test` con las preguntas válidas.
 * - Inicializa `posicionPregunta` en 0 y limpia el contenedor `divStack`.
 * - Muestra la primera pregunta con `mostrarPregunta`.
 * - Actualiza la barra de progreso y el resumen inicial con `actualizarResumen`.
 * - Si no se reciben preguntas, muestra un mensaje de error en el contenedor.
 *
 * @example
 * iniciarTest();
 * // Carga las preguntas del test y muestra la primera pregunta lista para interactuar
 */


const iniciarTest = async () => {
    await cargarTest(true);
};



/**
 * Carga preguntas desde el servidor, inicializa el test y configura la UI inicial.
 *
 * @async
 * @param {boolean} limpiar - Indica si se debe limpiar el contenedor al iniciar.
 * @returns {Promise<void>}
 */
const cargarTest = async (limpiar = true) => {
    const juegoConPreguntas = await obtenerPreguntasTest(1);
    const preguntasAPI = juegoConPreguntas?.preguntas || [];

    if (preguntasAPI.length > 0) {
        listaPreguntas = preguntasAPI
            .map(mapearPreguntaAPITest)
            .filter(p => p !== null);

        test = new Test(listaPreguntas);
        posicionPregunta = 0;

        if (limpiar) divStack.innerHTML = '';

        mostrarPregunta(listaPreguntas, 0);
        actualizarBarraProgreso(posicionPregunta);
        actualizarResumen(0, 0, 0, true, juegoConPreguntas.detalle);
    } else {
        divStack.innerHTML = '<p>Error al cargar el test</p>';
    }
};