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


    reiniciar() {
        this.respuestasUsuario = [];
     //   this.shuffledOptionsMap.clear();

    }
}
