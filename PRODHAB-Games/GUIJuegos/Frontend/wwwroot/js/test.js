const divStack = document.getElementById("div-stack");
const summaryDiv = document.querySelector(".summary");
const btnReiniciar = document.getElementById("btn-reiniciar");

class Test {
    constructor(preguntas) {
        this.preguntas = preguntas;
        this.respuestasUsuario = [];
    }

    responder(idPregunta, idOpcion) {
        const pregunta = this.preguntas.find(p => p.id === idPregunta);
        if (!pregunta) return;

        const opcion = pregunta.opciones.find(o => o.id === idOpcion);
        if (!opcion) return;

        this.respuestasUsuario.push({
            idPregunta,
            idOpcion,
            correcta: opcion.correcta
        });
    }

    calificar() {
        const total = this.preguntas.length;
        const correctas = this.respuestasUsuario.filter(r => r.correcta).length;
        const porcentaje = (correctas / total) * 100;

        return {
            total,
            correctas,
            incorrectas: total - correctas,
            porcentaje: porcentaje.toFixed(2)
        };
    }

    obtenerRespuestas() {
        return this.respuestasUsuario.map(r => {
            const pregunta = this.preguntas.find(p => p.id === r.idPregunta);
            return {
                idPregunta: r.idPregunta,
                idOpcion: r.idOpcion,
                pregunta: pregunta ? pregunta.titulo : r.idPregunta,
                correcta: r.correcta
            };
        });
    }

    reiniciar() {
        this.respuestasUsuario = [];
    }
}

let listaPreguntas = [];
let test = new Test(listaPreguntas);
let posicionPregunta = 0;

// Funciones de utilidad
const crearBotones = (index, total) => {
    let html = "";
    if (index > 0) html += `<button class="ghost prev" data-target="${index - 1}" type="button">Anterior</button>`;
    if (index < total - 1) html += `<button class="ghost next" data-target="${index + 1}" type="button">Siguiente</button>`;
    if (index === total - 1) html += `<button class="ghost finish" type="button">Finalizar</button>`;
    return html;
};

const mezclarOpciones = (pregunta) => {
    const opciones = [...pregunta.opciones];
    for (let i = opciones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
    }
    return opciones;
};

const obtenerOpcionesHTML = (pregunta) => {
    const opciones = mezclarOpciones(pregunta);
    return opciones.map(opcion => `
        <div id="option-${opcion.id}-${pregunta.id}" class="option">
            <span class="bullet"><span class="dot-small"></span></span>
            <span class="option-text">${opcion.texto}</span>
        </div>
    `).join('');
};

const actualizarBarraProgreso = (posicion) => {
    const totalPreguntas = listaPreguntas.length;
    const porcentaje = ((posicion + 1) / totalPreguntas) * 100;
    const barra = document.querySelector('.progress .bar');
    if (barra) {
        barra.style.width = porcentaje + '%';
    }
};

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

const configurarEventosPregunta = (preguntaElement, index) => {
    const btnNext = preguntaElement.querySelector(".next");
    const btnPrev = preguntaElement.querySelector(".prev");
    const btnFinish = preguntaElement.querySelector(".finish");
    const options = preguntaElement.querySelectorAll(".option");

    const tieneOpcionSeleccionada = () => 
        preguntaElement.querySelector('.option.selected') !== null;

    if (btnNext) {
        btnNext.onclick = () => {
            if (tieneOpcionSeleccionada()) {
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

    if (btnFinish) {
        btnFinish.onclick = () => {
            if (tieneOpcionSeleccionada()) {
                const calificacion = test.calificar();
               // alert(`¡Cuestionario completado! ${calificacion.porcentaje}%`);
                listarPreguntasVerticalConRespuestas(test.obtenerRespuestas());
                actualizarResumen(calificacion.incorrectas, calificacion.porcentaje);
            } else {
                mostrarError(preguntaElement);
            }
        };
    }

    options.forEach((option) => {
        option.onclick = () => {
            options.forEach((opt) => opt.classList.remove("selected"));
            option.classList.add("selected");
            
            const errorElement = preguntaElement.querySelector('.error-message');
            if (errorElement) errorElement.textContent = '';
            
            const id = option.id;
            const partes = id.split("-");
            const idOpcion = partes[1];
            const idPregunta = partes[2];
            
            test.responder(idPregunta, idOpcion);
        };
    });
};

const mostrarPregunta = (listaPreguntas, posicionPregunta) => {
    actualizarBarraProgreso(posicionPregunta);

    if (divStack.innerHTML === "") {
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

    const preguntas = divStack.querySelectorAll(".q-block");
    preguntas.forEach((pregunta, index) => {
        pregunta.classList.remove("active", "exit-left", "exit-right");
        
        if (index === posicionPregunta) {
            pregunta.classList.add("active");
            configurarEventosPregunta(pregunta, index);
        } else if (index < posicionPregunta) {
            pregunta.classList.add("exit-left");
        } else {
            pregunta.classList.add("exit-right");
        }
    });
};

const listarPreguntasVerticalConRespuestas = (respuestasUsuario = []) => {
    divStack.innerHTML = "";

    listaPreguntas.forEach((pregunta, index) => {
        const respuestaSeleccionada = respuestasUsuario.find(r => r.idPregunta === pregunta.id);
        
        const opcionesHTML = pregunta.opciones.map(op => {
            const esSeleccionada = respuestaSeleccionada && respuestaSeleccionada.idOpcion === op.id;
            let textoExtra = "";
            
            if (op.correcta) textoExtra = " (Correcta)";
            if (esSeleccionada && !op.correcta) textoExtra = " (Incorrecta)";
            
            return `
                <div class="option ${esSeleccionada ? "selected" : ""}" data-id="${op.id}">
                    <span class="bullet"><span class="dot-small"></span></span>
                    <span class="option-text">${op.texto}<strong>${textoExtra}</strong></span>
                </div>`;
        }).join("");

        let retroHTML = "";
        if (respuestaSeleccionada) {
            const opcionElegida = pregunta.opciones.find(o => o.id === respuestaSeleccionada.idOpcion);
            if (opcionElegida && opcionElegida.retroalimentacion) {
                retroHTML = `<div class="retroalimentacion">${opcionElegida.retroalimentacion}</div>`;
            }
        }

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

    const preguntas = divStack.querySelectorAll(".q-block");
    preguntas.forEach(p => {
        p.style.position = "relative";
        p.style.left = "0";
        p.style.opacity = "1";
    });
};

const actualizarResumen = (fallos, calificacion) => {
    summaryDiv.innerHTML = `Total de fallos: ${fallos} </br> Calificación: ${calificacion}%`;
};

const reiniciarExamen = async () => {
    if (test) test.reiniciar();
    divStack.innerHTML = '';
    
    const preguntasAPI = await obtenerPreguntas(5);
    listaPreguntas = preguntasAPI.map(mapearPreguntaAPI);
    
    test = new Test(listaPreguntas);
    posicionPregunta = 0;
    
    mostrarPregunta(listaPreguntas, 0);
    actualizarBarraProgreso(posicionPregunta);
};



// Event Listeners
btnReiniciar.addEventListener("click", reiniciarExamen);

document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll("button");
    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            this.style.transform = "scale(0.98)";
            setTimeout(() => {
                this.style.transform = "";
            }, 150);
        });
    });
    
    iniciarTest();
});

const iniciarTest = async () => {
    const preguntasAPI = await obtenerPreguntas(5);
    listaPreguntas = preguntasAPI.map(mapearPreguntaAPI);
    test = new Test(listaPreguntas);
    posicionPregunta = 0;
    divStack.innerHTML = '';
    mostrarPregunta(listaPreguntas, 0);
    actualizarBarraProgreso(posicionPregunta);
};