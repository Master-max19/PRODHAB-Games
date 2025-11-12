/**
 * Crea una nueva instancia de la clase Test.
 *
 * @param {Array} preguntas - Lista de preguntas que conforman el test. Cada pregunta
 *                            debe incluir su ID, título, categoría y opciones.
 *
 * Inicializa:
 * - `this.preguntas`: almacena todas las preguntas del test.
 * - `this.respuestasUsuario`: mantiene las respuestas seleccionadas por el usuario,
 *                              comienza vacío.
 */


class Test {
    constructor(preguntas) {
        this.preguntas = preguntas;
        this.respuestasUsuario = [];
    }


    /*
La función 'responder' registra la selección del usuario de manera organizada y consistente.

Primero, los identificadores de la pregunta y de la opción vienen del frontend como cadenas de texto,
por ejemplo "pregunta1" o "o2". Estos IDs no son solo números: llevan un prefijo que indica si se trata
de una pregunta o de una opción. Para poder compararlos y buscarlos en las estructuras internas del test,
se normalizan, es decir, se eliminan los prefijos y se convierten a números puros. Esto asegura que los 
IDs coincidan correctamente con los que tiene el backend y evita confusiones si hay varios IDs similares 
entre preguntas y opciones.

Luego, 'responder' busca la pregunta correspondiente en la lista de preguntas del test y dentro de esa 
pregunta encuentra la opción seleccionada.

Dependiendo de si la pregunta es de opción única o múltiple, la manera de registrar la selección cambia:

- Para preguntas de opción múltiple, puede haber varias opciones seleccionadas. El método revisa si la 
  respuesta de esa pregunta ya existe y agrega o quita la opción seleccionada según sea necesario.

- Para preguntas de opción única, solo puede quedar seleccionada una opción. Si ya había una respuesta, 
  se reemplaza por la nueva selección.

Finalmente, todas las selecciones se almacenan en 'respuestasUsuario', que es la lista que mantiene el estado 
de las respuestas del usuario mientras realiza el test. Esta lista se puede consultar después para generar 
el JSON que se enviará al backend y calcular aciertos, calificaciones o guardar resultados.
*/



    /**
     * Registra la selección de una opción para una pregunta en el test.
     *
     * @param {*} idPregunta El identificador de la pregunta, recibido desde un elemento HTML,
     *                       con el formato "pregunta${idPregunta}".
     * @param {*} idOpcion   El identificador de la opción seleccionada, recibido desde un elemento HTML,
     *                       con el formato "o${idOpcion}".
     * @returns Nada. Actualiza internamente el estado de las respuestas del usuario.
     */


    responder(idPregunta, idOpcion) {
        const preguntaId = Number(String(idPregunta).replace(/^pregunta/, ''));
        const opcionId = Number(String(idOpcion).replace(/^o/, ''));
        const pregunta = this.preguntas.find(p => Number(String(p.id).replace(/^pregunta/, '')) === preguntaId);
        if (!pregunta) {
            console.warn(`Pregunta no encontrada: idPregunta=${preguntaId}`);
            return;
        }

        const opcion = pregunta.opciones.find(o => Number(String(o.id).replace(/^o/, '')) === opcionId);
        if (!opcion) {
            console.warn(`Opción no encontrada: idOpcion=${opcionId}, idPregunta=${preguntaId}`);
            return;
        }

        if (pregunta.categoria === 'multiple') {
            let respuesta = this.respuestasUsuario.find(r => r.idPregunta === preguntaId);
            if (!respuesta) {
                respuesta = { idPregunta: preguntaId, idOpciones: [] };
                this.respuestasUsuario.push(respuesta);
            }

            const idx = respuesta.idOpciones.indexOf(opcionId);
            if (idx === -1) {
                respuesta.idOpciones.push(opcionId);
            } else {
                respuesta.idOpciones.splice(idx, 1);
            }
        } else {
            const index = this.respuestasUsuario.findIndex(r => r.idPregunta === preguntaId);
            const nuevaRespuesta = { idPregunta: preguntaId, idOpcion: opcionId };
            if (index !== -1) {
                this.respuestasUsuario[index] = nuevaRespuesta;
            } else {
                this.respuestasUsuario.push(nuevaRespuesta);
            }
        }
    }


    /**
 * Genera el payload de respuestas seleccionadas por el usuario, listo para enviar al backend.
 *
 * Este método recorre todas las preguntas del test y construye un arreglo de objetos
 * donde cada objeto contiene:
 *  - idPregunta: el ID numérico de la pregunta.
 *  - opciones: un array con las opciones de la pregunta, indicando si fueron seleccionadas.
 *
 * Solo se incluyen en el resultado las preguntas donde al menos una opción haya sido seleccionada.
 * 
 * Además, convierte los IDs de preguntas y opciones desde el formato de frontend
 * ("preguntaX" / "oY") a números puros para mantener consistencia con el backend.
 *
 * @returns {Array} Array de objetos representando las respuestas seleccionadas, por ejemplo:
 * [
 *   {
 *     idPregunta: 1,
 *     opciones: [
 *       { idOpcion: 2, seleccionada: true },
 *       { idOpcion: 3, seleccionada: false }
 *     ]
 *   },
 *   ...
 * ]
 */

    obtenerRespuestas() {
        const respuestas = this.preguntas.map(pregunta => {
            const preguntaId = Number(String(pregunta.id).replace(/^pregunta/, '')); // Numeric ID
            const respuesta = this.respuestasUsuario.find(r => r.idPregunta === preguntaId);
            const opciones = pregunta.opciones.map(opcion => ({
                idOpcion: Number(String(opcion.id).replace(/^o/, '')), // Numeric ID
                seleccionada: respuesta ?
                    (pregunta.categoria === 'multiple' ?
                        respuesta.idOpciones?.includes(Number(String(opcion.id).replace(/^o/, ''))) || false :
                        respuesta.idOpcion === Number(String(opcion.id).replace(/^o/, ''))) :
                    false
            }));
            return {
                idPregunta: preguntaId,
                opciones
            };
        }).filter(r => r.opciones.some(o => o.seleccionada));
        console.log('Payload enviado:', JSON.stringify(respuestas, null, 2));
        return respuestas;
    }

    /**
 * Reinicia el test, borrando todas las respuestas seleccionadas por el usuario.
 * 
 * - Vacía el arreglo `respuestasUsuario`, eliminando todas las selecciones.
 * - Limpia `shuffledOptionsMap`, que controla el orden aleatorio de las opciones.
 *
 * Después de llamar a este método, el test vuelve a su estado inicial,
 * listo para que el usuario comience de nuevo.
 */




    obtenerCantidadOpcionesCorrectas(detalle) {
        if (!Array.isArray(detalle)) return 0;

        try {
            let totalCorrectasSeleccionadas = 0;

            detalle.forEach(pregunta => {
                pregunta.opciones.forEach(op => {
                    if (op.esCorrecta && op.seleccionada) {
                        totalCorrectasSeleccionadas++;
                    }
                });
            });

            return totalCorrectasSeleccionadas;
        } catch (error) {
            console.error("Error al contar opciones correctas:", error);
            return 0;
        }
    }




    reiniciar() {
        this.respuestasUsuario = [];
        //   this.shuffledOptionsMap.clear();
    }



    getTestStyle (){
         return `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: "Raleway", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  scroll-behavior: smooth;
}

.container {
  max-width: auto;
  margin: 0 auto;
}

header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
}

h1 {
  font-size: 2.5rem;
  color: #2563eb;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.2rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

.wrap {
  display: grid;
  place-items: center;
  width: 100%;
}

.card {
  width: 100%;
  max-width: 1000px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(2, 6, 23, 0.08);
  overflow: hidden;
}

.header,
.q-meta,
.footer-global,
.q-footer,
.left,
.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header {
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.brand .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
}

.meta {
  font-size: 14px;
  color: #64748b;
}

.content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

#div-stack {
  position: relative;
  width: 100%;
  min-height: 300px;
  margin-bottom: 20px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 4px solid #ccc;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: girar 1s linear infinite;
  margin: 0 auto;
  margin-top: 12vh;
}

#titulo-test {
  font-size: 20px;
}

@keyframes girar {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.cargando {
  position: absolute;
  top: 20vh;
  left: 50%;
  transform: translate(-50%, -50%);
}
.q-block {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  word-wrap: break-word;
  overflow-wrap: break-word;
  position: absolute;
  top: 0;
  left: 100%;
  width: 100%;
  opacity: 0;
  transition: all 0.5s ease;
  height: auto;
}

.q-block.active {
  left: 0;
  opacity: 1;
  position: relative;
}

.q-block.exit-left,
.q-block.exit-right {
  left: var(--exit-position, -100%);
  opacity: 0;
  position: absolute;
  visibility: hidden;
}

.q-block.exit-right {
  --exit-position: 100%;
}

.q-meta {
  justify-content: space-between;
  font-size: 14px;
  color: #64748b;
}

.q-title {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
  white-space: normal;
  overflow-wrap: normal;
  word-break: normal;
}

.options {
  display: grid;
  gap: 12px;
  height: auto;
  overflow: visible;
}

.option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  background: #fff;
  transition: 0.18s ease;
  flex: 1 1 auto;
  min-width: 0;
  white-space: normal;
  overflow-wrap: normal;
  word-break: normal;
}
.icono-respuesta {
  margin-left: 2px;
  width: 30px;
  height: 30px;
  vertical-align: middle;
  flex-shrink: 0;
}

.option:hover {
  box-shadow: 0 6px 14px rgba(2, 6, 23, 0.06);
  transform: translateY(-1px);
}

.option.selected {
  border-color: #2563eb;
  outline: 2px solid rgba(37, 99, 235, 0.15);
}

.option-text {
  flex: 1 1 auto;
  white-space: normal;
  overflow-wrap: break-word;
  font-size: 15px;
}

.bullet {
  width: 20px;
  height: 20px;
  border: 2px solid #64748b;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.option.selected .bullet {
  border-color: #2563eb;
}

.dot-small {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
}

.option.selected .dot-small {
  background: #2563eb;
}

.option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.q-footer {
  flex-wrap: wrap;
  justify-content: space-between;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #e5e7eb;
}

button {
  appearance: none;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #0f172a;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.18s ease;
  white-space: nowrap;
}

button.primary {
  background: #2563eb;
  color: #fff;
  border-color: transparent;
}

button.primary:hover {
  background: #1d4ed8;
}

button.ghost:hover {
  background: #f8fafc;
  color: black;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pill {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  color: #64748b;
  white-space: nowrap;
}

.result {
  display: none;
  padding: 12px 14px;
  border-radius: 10px;
  font-weight: 600;
}

.result.ok {
  background: #ecfdf5;
  color: #16a34a;
  border: 1px solid #86efac;
}

.result.bad {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.muted {
  color: #64748b;
}

.footer-global {
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

.summary {
  font-weight: 600;
  color: rgb(25, 41, 82);
  margin-left: 5px;
}

.instructions {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-left: 4px solid  rgb(0, 53, 160);;
}

.instructions h3 {
  color: rgb(0, 53, 160);
  margin-bottom: 10px;
}

.finish {
  background:  rgb(0, 53, 160);;
  color: #fff;
}

.retroalimentacion {
  margin-top: 10px;
  color: rgb(0, 84, 134);
  font-weight: bold;
}

.progress {
  height: 10px;
  background: #eef2ff;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  width: 100%;
  margin-bottom: 1px;
}

.bar {
  height: 100%;
  width: 30%;
  background: linear-gradient(90deg, #082666, #60a5fa);
  transition: width 0.3s ease;
}

#btn-reiniciar {
  background-color: rgb(0, 31, 111);
}

#btn-reiniciar:hover {
  transform: scale(1.05);
}

.content-pet {
  font-size: 12px;
  line-height: 1.4;
  font-size: 14px;
  text-align: center;
}

.content-pet img.pet-icon {
  width: 92px;
  height: 92px;
  object-fit: contain;
  vertical-align: middle;
  max-height: 92px;
  width: 100%;
}

#pet-test-text {
  max-width: 200px;
  white-space: normal;
  word-break: normal;
  overflow-wrap: normal;
}

@media (max-width: 768px) {
  .header,
  .q-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-global {
    flex-direction: row;
    flex-wrap: nowrap; /* no permitir que baje a otra línea */
    align-items: center; /* centrar vertical */
    justify-content: space-between; /* extremos; usa flex-start si quieres juntos */
  }

  .q-title {
    font-size: 18px;
  }

  .option {
    padding: 12px;
  }

  .q-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .left,
  .right {
    justify-content: space-between;
  }

  #div-stack {
    min-height: 400px;
  }

  .prev,
  .next,
  .finish {
    position: fixed;
    bottom: 10px;
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
    border-radius: 5px;
    cursor: pointer;
    z-index: 1000;
    background-color: #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  .prev,
  .next {
    border: 1px solid #ccc;
  }

  .prev {
    left: 10%;
  }

  .next,
  .finish {
    right: 10%;
  }

  .finish {
    background: rgb(0, 53, 160);;
    color: #fff;
    border-color: transparent;
  }
}
`;
    }



}
