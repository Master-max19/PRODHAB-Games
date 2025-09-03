
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



        if (pregunta.categoria === 'multiple') {
            let respuesta = this.respuestasUsuario.find(r => r.idPregunta === idPregunta);
            if (!respuesta) {
                respuesta = { idPregunta, idOpciones: [], correcta: false };
                this.respuestasUsuario.push(respuesta);
            }

            const idx = respuesta.idOpciones.indexOf(idOpcion);
            if (idx === -1) {
                respuesta.idOpciones.push(idOpcion);
            } else {
                respuesta.idOpciones.splice(idx, 1);
            }
            const opcionesCorrectas = pregunta.opciones.filter(o => o.correcta).map(o => o.id);
            respuesta.correcta =
                respuesta.idOpciones.length === opcionesCorrectas.length &&
                respuesta.idOpciones.every(id => opcionesCorrectas.includes(id));

            console.log(opcionesCorrectas)

        } else {
            // Pregunta única
            const index = this.respuestasUsuario.findIndex(r => r.idPregunta === idPregunta);
            const nuevaRespuesta = {
                idPregunta,
                idOpcion,
                correcta: opcion.correcta
            };
            if (index !== -1) {
                this.respuestasUsuario[index] = nuevaRespuesta;
            } else {
                this.respuestasUsuario.push(nuevaRespuesta);
            }

        }
    }



    calificar() {
        const total = this.preguntas.length;
        const correctas = this.respuestasUsuario.filter(r => r.correcta).length;
        const porcentaje = (correctas / total) * 100;

        console.log('soluciones')
        console.log(this.obtenerRespuestas())

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
                // Para preguntas múltiples devolvemos idOpciones, para únicas idOpcion
                idOpcion: r.idOpcion || null,
                idOpciones: r.idOpciones || null,
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
    const opciones = pregunta.opciones; // <-- sin copiar, usamos el original
    for (let i = opciones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opciones[i], opciones[j]] = [opciones[j], opciones[i]]; // intercambio in-place
    }
    return opciones; // devuelve el mismo array pero ahora mezclado
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
                divStack.innerHTML = `      <div class="spinner"></div>
                <span class="cargando">Cargando... </span>`;

                setTimeout(() => {
                    const calificacion = test.calificar();
                    mostrarResultados(test.obtenerRespuestas());
                    actualizarResumen(calificacion.incorrectas, calificacion.correctas, calificacion.porcentaje);
                }, 1000); // 4000 ms = 4 segundos


            } else {
                mostrarError(preguntaElement);
            }
        };
    }

    options.forEach((option) => {
        option.onclick = () => {
            const tipo = preguntaElement.getAttribute("data-tipo");

            if (tipo === "unica") {
                // deselecciona todas y selecciona solo esta
                options.forEach((opt) => opt.classList.remove("selected"));
                option.classList.add("selected");
            } else if (tipo === "multiple") {
                // alterna selección para múltiple
                option.classList.toggle("selected");
            }

            const errorElement = preguntaElement.querySelector('.error-message');
            if (errorElement) errorElement.textContent = '';

            const id = option.id;
            const partes = id.split("-");
            const idOpcion = String(partes[1]);
            const idPregunta = String(partes[2]);
            test.responder(idPregunta, idOpcion);

        };
    });
};


function mostrarTipoPregunta(categoria) {
    return categoria === 'multiple' ? 'Selección múltiple' : 'Selección única';
}

const mostrarPregunta = (listaPreguntas, posicionPregunta) => {
    actualizarBarraProgreso(posicionPregunta);

    if (divStack.innerHTML === "") {
        listaPreguntas.forEach((pregunta, index) => {
            divStack.innerHTML += `
                <section id="pregunta-${index}" class="q-block" data-tipo="${pregunta.categoria}">
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
            configurarEventosPregunta(pregunta, index);
        } else if (index < posicionPregunta) {
            pregunta.classList.add("exit-left");
        } else {
            pregunta.classList.add("exit-right");
        }
    });
};


const mostrarResultados = (respuestasUsuario = []) => {
    divStack.innerHTML = "";

    listaPreguntas.forEach((pregunta, index) => {
        const respuestaSeleccionada = respuestasUsuario.find(r => r.idPregunta === pregunta.id);

        const opcionesHTML = pregunta.opciones.map(op => {
            // Para múltiples: idOpciones es array; para única: es un valor
            const esSeleccionada = respuestaSeleccionada && (
                (respuestaSeleccionada.idOpciones && respuestaSeleccionada.idOpciones.includes(op.id))
                || respuestaSeleccionada.idOpcion === op.id
            );


            let iconoExtra = "";

            if (op.correcta) {
                iconoExtra = `<img src="correcta.svg" alt="Correcto" class="icono-respuesta" 
        onerror="this.outerHTML='✔️'">`;
            }

            if (esSeleccionada && !op.correcta) {
                iconoExtra = `<img src="incorrecta.svg" alt="Incorrecto" class="icono-respuesta" 
        onerror="this.outerHTML='❌'">`;
            }

            return `
                <div class="option ${esSeleccionada ? "selected" : ""}" data-id="${op.id}">
                    <span class="bullet"><span class="dot-small"></span></span>
                    <span class="option-text">${op.texto}<strong>${iconoExtra}</strong></span>
                </div>`;
        }).join("");

        // Retroalimentación: mostrar la de cada opción marcada
        let retroHTML = "";
        if (respuestaSeleccionada) {
            const opcionesMarcadas = respuestaSeleccionada.idOpciones ||
                (respuestaSeleccionada.idOpcion ? [respuestaSeleccionada.idOpcion] : []);


            const retroArray = opcionesMarcadas.map(idOp => {
                const opcion = pregunta.opciones.find(o => o.id === idOp);
                return opcion && opcion.retroalimentacion
                    ? `<div class="retroalimentacion">${opcion.retroalimentacion}</div>`
                    : "";
            });

            retroHTML = retroArray.join("");
        }

        divStack.innerHTML += `
            <section id="${pregunta.id}" class="q-block" style="margin-bottom: 20px;">
                <div class="q-meta">
                    <span class="pill">Pregunta ${index + 1}/${listaPreguntas.length}</span>
                    <span class="muted">${mostrarTipoPregunta(pregunta.categoria)}</span>
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

    console.log(test.obtenerRespuestas());
};


const actualizarResumen = (fallos, correctas, calificacion, reiniciar = false) => {
    if (reiniciar) {
        summaryDiv.innerHTML = ``;
        document.getElementById('pet-test-text').innerHTML = '¿Listo para alcanzar el 100%?';
        return;
    }

    summaryDiv.innerHTML = `Respuestas correctas: ${correctas} </br> Total de fallos: ${fallos} </br> Calificación: ${calificacion}%`;
    const nota = parseInt(calificacion);
    let mensaje = ``;
    if (nota === 100) {
        mensaje = "¡Excelente! lograste el 100%";
    } else if (nota >= 80) {
        mensaje = `Muy bueno has obtenido ${calificacion}%`;
    } else if (nota >= 70) {
        mensaje = `Bien has obtenido ${calificacion}%`;
    } else {
        mensaje = `Has obtenido ${calificacion}%, aún puedes mejorar`;
    }


    document.getElementById('pet-test-text').innerHTML = mensaje;
}


const reiniciarExamen = async () => {
    if (test) test.reiniciar();
    divStack.innerHTML = '';

    const preguntasAPI = await obtenerPreguntas(5);
    listaPreguntas = preguntasAPI
        .map(mapearPreguntaAPI)
        .filter(p => p !== null);


    test = new Test(listaPreguntas);
    posicionPregunta = 0;

    mostrarPregunta(listaPreguntas, 0);
    actualizarBarraProgreso(posicionPregunta);
    actualizarResumen(0, 0, 0, true)
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
    if (preguntasAPI.length > 0) {
        listaPreguntas = preguntasAPI
            .map(mapearPreguntaAPI)
            .filter(p => p !== null);

        test = new Test(listaPreguntas);
        posicionPregunta = 0;
        divStack.innerHTML = '';
        mostrarPregunta(listaPreguntas, 0);
        actualizarBarraProgreso(posicionPregunta);
        actualizarResumen(0, 0, 0, true)
    } else {
        divStack.innerHTML = '<p>Error al cargar el test</p>';
    }
};
