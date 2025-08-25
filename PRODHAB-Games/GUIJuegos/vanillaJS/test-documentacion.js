// Referencias a elementos del DOM para la interfaz del cuestionario
const divStack = document.getElementById("div-stack"); // Contenedor para mostrar las preguntas
const summaryDiv = document.querySelector(".summary"); // Contenedor para mostrar el resumen del cuestionario
const btnReiniciar = document.getElementById("btn-reiniciar"); // Botón para reiniciar el cuestionario

// Clase Test para gestionar la lógica del cuestionario
class Test {
    // Constructor que inicializa el cuestionario con una lista de preguntas y un arreglo vacío para las respuestas del usuario
    constructor(preguntas) {
        this.preguntas = preguntas; // Arreglo de objetos de preguntas
        this.respuestasUsuario = []; // Arreglo para almacenar las respuestas del usuario
    }

    // Método para registrar la respuesta del usuario a una pregunta específica
    responder(idPregunta, idOpcion) {
        const pregunta = this.preguntas.find(p => p.id === idPregunta); // Busca la pregunta por su ID
        if (!pregunta) return; // Sale si no se encuentra la pregunta

        const opcion = pregunta.opciones.find(o => o.id === idOpcion); // Busca la opción seleccionada por su ID
        if (!opcion) return; // Sale si no se encuentra la opción

        // Almacena la respuesta del usuario con el ID de la pregunta, el ID de la opción y si es correcta
        this.respuestasUsuario.push({
            idPregunta,
            idOpcion,
            correcta: opcion.correcta
        });
    }

    // Método para calcular la calificación del cuestionario
    calificar() {
        const total = this.preguntas.length; // Total de preguntas
        const correctas = this.respuestasUsuario.filter(r => r.correcta).length; // Conteo de respuestas correctas
        const porcentaje = (correctas / total) * 100; // Porcentaje de aciertos

        // Retorna un objeto con los resultados del cuestionario
        return {
            total,
            correctas,
            incorrectas: total - correctas, // Calcula las respuestas incorrectas
            porcentaje: porcentaje.toFixed(2) // Porcentaje redondeado a 2 decimales
        };
    }

    // Método para obtener las respuestas del usuario con detalles adicionales
    obtenerRespuestas() {
        return this.respuestasUsuario.map(r => {
            const pregunta = this.preguntas.find(p => p.id === r.idPregunta); // Busca la pregunta correspondiente
            return {
                idPregunta: r.idPregunta,
                idOpcion: r.idOpcion,
                pregunta: pregunta ? pregunta.titulo : r.idPregunta, // Título de la pregunta o ID si no se encuentra
                correcta: r.correcta
            };
        });
    }

    // Método para reiniciar las respuestas del usuario
    reiniciar() {
        this.respuestasUsuario = []; // Vacía el arreglo de respuestas
    }
}

// Variables globales para gestionar el estado del cuestionario
let listaPreguntas = []; // Arreglo para almacenar las preguntas
let test = new Test(listaPreguntas); // Instancia de la clase Test
let posicionPregunta = 0; // Índice de la pregunta actual

// Funciones de utilidad

// Función para crear botones de navegación (Anterior, Siguiente, Finalizar)
const crearBotones = (index, total) => {
    let html = "";
    if (index > 0) html += `<button class="ghost prev" data-target="${index - 1}" type="button">Anterior</button>`; // Botón Anterior si no es la primera pregunta
    if (index < total - 1) html += `<button class="ghost next" data-target="${index + 1}" type="button">Siguiente</button>`; // Botón Siguiente si no es la última pregunta
    if (index === total - 1) html += `<button class="ghost finish" type="button">Finalizar</button>`; // Botón Finalizar en la última pregunta
    return html;
};

// Función para mezclar aleatoriamente las opciones de una pregunta
const mezclarOpciones = (pregunta) => {
    const opciones = [...pregunta.opciones]; // Copia las opciones de la pregunta
    for (let i = opciones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Índice aleatorio
        [opciones[i], opciones[j]] = [opciones[j], opciones[i]]; // Intercambia opciones
    }
    return opciones; // Retorna las opciones mezcladas
};

// Función para generar el HTML de las opciones de una pregunta
const obtenerOpcionesHTML = (pregunta) => {
    const opciones = mezclarOpciones(pregunta); // Obtiene las opciones mezcladas
    return opciones.map(opcion => `
        <div id="option-${opcion.id}-${pregunta.id}" class="option">
            <span class="bullet"><span class="dot-small"></span></span>
            <span class="option-text">${opcion.texto}</span>
        </div>
    `).join(''); // Retorna el HTML de todas las opciones
};

// Función para actualizar la barra de progreso del cuestionario
const actualizarBarraProgreso = (posicion) => {
    const totalPreguntas = listaPreguntas.length; // Total de preguntas
    const porcentaje = ((posicion + 1) / totalPreguntas) * 100; // Porcentaje de avance
    const barra = document.querySelector('.progress .bar'); // Elemento de la barra de progreso
    if (barra) {
        barra.style.width = porcentaje + '%'; // Actualiza el ancho de la barra
    }
};

// Función para mostrar un mensaje de error si no se selecciona una opción
const mostrarError = (preguntaElement) => {
    let errorElement = preguntaElement.querySelector('.error-message'); // Busca el elemento de mensaje de error
    if (!errorElement) {
        errorElement = document.createElement('div'); // Crea un nuevo elemento si no existe
        errorElement.className = 'error-message';
        errorElement.style.cssText = 'color: #dc2626; margin-top: 10px; font-size: 14px;'; // Estilos del mensaje
        preguntaElement.querySelector('.q-footer').prepend(errorElement); // Agrega el mensaje al pie de la pregunta
    }
    errorElement.textContent = 'Por favor, selecciona una opción antes de continuar'; // Muestra el mensaje
    
    setTimeout(() => {
        errorElement.textContent = ''; // Borra el mensaje después de 3 segundos
    }, 3000);
};

// Función para configurar los eventos de interacción con la pregunta
const configurarEventosPregunta = (preguntaElement, index) => {
    const btnNext = preguntaElement.querySelector(".next"); // Botón Siguiente
    const btnPrev = preguntaElement.querySelector(".prev"); // Botón Anterior
    const btnFinish = preguntaElement.querySelector(".finish"); // Botón Finalizar
    const options = preguntaElement.querySelectorAll(".option"); // Opciones de la pregunta

    // Función para verificar si se ha seleccionado una opción
    const tieneOpcionSeleccionada = () => 
        preguntaElement.querySelector('.option.selected') !== null;

    if (btnNext) {
        btnNext.onclick = () => {
            if (tieneOpcionSeleccionada()) {
                mostrarPregunta(listaPreguntas, index + 1); // Muestra la siguiente pregunta
            } else {
                mostrarError(preguntaElement); // Muestra un error si no hay opción seleccionada
            }
        };
    }

    if (btnPrev) {
        btnPrev.onclick = () => {
            mostrarPregunta(listaPreguntas, index - 1); // Muestra la pregunta anterior
        };
    }

    if (btnFinish) {
        btnFinish.onclick = () => {
            if (tieneOpcionSeleccionada()) {
                const calificacion = test.calificar(); // Calcula la calificación
                alert(`¡Cuestionario completado! ${calificacion.porcentaje}%`); // Muestra el resultado
                listarPreguntasVerticalConRespuestas(test.obtenerRespuestas()); // Muestra las respuestas
                actualizarResumen(calificacion.incorrectas, calificacion.porcentaje); // Actualiza el resumen
            } else {
                mostrarError(preguntaElement); // Muestra un error si no hay opción seleccionada
            }
        };
    }

    // Configura el evento de clic para cada opción
    options.forEach((option) => {
        option.onclick = () => {
            options.forEach((opt) => opt.classList.remove("selected")); // Desmarca todas las opciones
            option.classList.add("selected"); // Marca la opción seleccionada
            
            const errorElement = preguntaElement.querySelector('.error-message'); // Borra el mensaje de error si existe
            if (errorElement) errorElement.textContent = '';
            
            const id = option.id; // Obtiene el ID de la opción
            const partes = id.split("-"); // Divide el ID en partes
            const idOpcion = partes[1]; // ID de la opción
            const idPregunta = partes[2]; // ID de la pregunta
            
            test.responder(idPregunta, idOpcion); // Registra la respuesta
        };
    });
};

// Función para mostrar una pregunta específica en el cuestionario
const mostrarPregunta = (listaPreguntas, posicionPregunta) => {
    actualizarBarraProgreso(posicionPregunta); // Actualiza la barra de progreso

    if (divStack.innerHTML === "") {
        // Genera el HTML para todas las preguntas si el contenedor está vacío
        listaPreguntas.forEach((pregunta, index) => {
            divStack.innerHTML += `
                <section id="pregunta-${index}" class="q-block">
                    <div class="q-meta">
                        <span class="pill">Pregunta ${index + 1}/${listaPreguntas.length}</span>
                        <span class="muted">Categoría: ${pregunta.categoria}</span>
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

    // Gestiona las clases CSS para mostrar la pregunta actual y animar las demás
    const preguntas = divStack.querySelectorAll(".q-block");
    preguntas.forEach((pregunta, index) => {
        pregunta.classList.remove("active", "exit-left", "exit-right");
        
        if (index === posicionPregunta) {
            pregunta.classList.add("active"); // Muestra la pregunta actual
            configurarEventosPregunta(pregunta, index); // Configura los eventos
        } else if (index < posicionPregunta) {
            pregunta.classList.add("exit-left"); // Oculta preguntas anteriores
        } else {
            pregunta.classList.add("exit-right"); // Oculta preguntas siguientes
        }
    });
};

// Función para mostrar todas las preguntas con las respuestas del usuario
const listarPreguntasVerticalConRespuestas = (respuestasUsuario = []) => {
    divStack.innerHTML = ""; // Limpia el contenedor

    listaPreguntas.forEach((pregunta, index) => {
        const respuestaSeleccionada = respuestasUsuario.find(r => r.idPregunta === pregunta.id); // Busca la respuesta del usuario
        
        // Genera el HTML para las opciones, indicando si son correctas o incorrectas
        const opcionesHTML = pregunta.opciones.map(op => {
            const esSeleccionada = respuestaSeleccionada && respuestaSeleccionada.idOpcion === op.id;
            let textoExtra = "";
            
            if (op.correcta) textoExtra = " (Correcta)"; // Marca la opción correcta
            if (esSeleccionada && !op.correcta) textoExtra = " (Incorrecta)"; // Marca la opción incorrecta seleccionada
            
            return `
                <div class="option ${esSeleccionada ? "selected" : ""}" data-id="${op.id}">
                    <span class="bullet"><span class="dot-small"></span></span>
                    <span class="option-text">${op.texto}<strong>${textoExtra}</strong></span>
                </div>`;
        }).join("");

        // Agrega retroalimentación si está disponible
        let retroHTML = "";
        if (respuestaSeleccionada) {
            const opcionElegida = pregunta.opciones.find(o => o.id === respuestaSeleccionada.idOpcion);
            if (opcionElegida && opcionElegida.retroalimentacion) {
                retroHTML = `<div class="retroalimentacion">${opcionElegida.retroalimentacion}</div>`;
            }
        }

        // Agrega el HTML de la pregunta al contenedor
        divStack.innerHTML += `
            <section id="${pregunta.id}" class="q-block" style="margin-bottom: 20px;">
                <div class="q-meta">
                    <span class="pill">Pregunta ${index + 1}/${listaPreguntas.length}</span>
                    <span class="muted">Categoría: ${pregunta.categoria}</span>
                </div>
                <h2 class="q-title">${pregunta.titulo}</h2>
                <div class="options">${opcionesHTML}</div>
                ${retroHTML}
            </section>`;
    });

    // Ajusta el estilo de las preguntas para mostrarlas todas
    const preguntas = divStack.querySelectorAll(".q-block");
    preguntas.forEach(p => {
        p.style.position = "relative";
        p.style.left = "0";
        p.style.opacity = "1";
    });
};

// Función para actualizar el resumen del cuestionario
const actualizarResumen = (fallos, calificacion) => {
    summaryDiv.innerHTML = `Total de fallos: ${fallos} </br> Calificación: ${calificacion}%`; // Muestra los fallos y la calificación
};

// Función para reiniciar el examen
const reiniciarExamen = async () => {
    if (test) test.reiniciar(); // Reinicia las respuestas del usuario
    divStack.innerHTML = ''; // Limpia el contenedor de preguntas
    
    const preguntasAPI = await obtenerPreguntas(5); // Obtiene 5 preguntas de la API
    listaPreguntas = preguntasAPI.map(mapearPreguntaAPI); // Mapea las preguntas al formato adecuado
    
    test = new Test(listaPreguntas); // Crea una nueva instancia de Test
    posicionPregunta = 0; // Reinicia la posición de la pregunta
    
    mostrarPregunta(listaPreguntas, 0); // Muestra la primera pregunta
    actualizarBarraProgreso(posicionPregunta); // Actualiza la barra de progreso
};

// Listeners de eventos
btnReiniciar.addEventListener("click", reiniciarExamen); // Asocia el evento de clic al botón de reinicio

// Evento que se ejecuta cuando el DOM está completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll("button"); // Selecciona todos los botones
    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            this.style.transform = "scale(0.98)"; // Efecto visual al hacer clic
            setTimeout(() => {
                this.style.transform = ""; // Restaura el estado original después de 150ms
            }, 150);
        });
    });
    
    iniciarTest(); // Inicia el cuestionario
});

// Función para iniciar el cuestionario
const iniciarTest = async () => {
    const preguntasAPI = await obtenerPreguntas(5); // Obtiene 5 preguntas de la API
    listaPreguntas = preguntasAPI.map(mapearPreguntaAPI); // Mapea las preguntas al formato adecuado
    test = new Test(listaPreguntas); // Crea una nueva instancia de Test
    posicionPregunta = 0; // Establece la posición inicial
    divStack.innerHTML = ''; // Limpia el contenedor
    mostrarPregunta(listaPreguntas, 0); // Muestra la primera pregunta
    actualizarBarraProgreso(posicionPregunta); // Actualiza la barra de progreso
};