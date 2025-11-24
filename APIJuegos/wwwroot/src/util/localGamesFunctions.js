export const cargarTest = async (jsonUrl, idJuego) => {
    console.log(await obtenerListaJuegos(jsonUrl))
    try {
        const resp = await fetch(jsonUrl);
        if (!resp.ok) throw new Error("No se pudo cargar el JSON");

        const data = await resp.json();
        let juego = null;

        // Caso 1: JSON con varios juegos
        if (Array.isArray(data.juegos)) {
            juego = data.juegos.find(j => j.juego.idJuego === idJuego)?.juego;
        }
        else if (data.juego && data.juego.idJuego === idJuego) {
            juego = data.juego;
        }


        if (juego.idTipoJuego !== 1) {
            console.error("Juego no es de tipo TEST.");
            return [];
        }

        if (!juego) throw new Error(`Juego con id ${idJuego} no encontrado`);

        return {
            exito: true,
            idJuego: juego.idJuego,
            nombre: juego.nombre,
            descripcion: juego.descripcion,
            detalle: juego.detalle,
            preguntas: juego.preguntas.map(p => ({
                idPregunta: p.pregunta.idPregunta,
                enunciado: p.pregunta.enunciado,
                tipo: p.pregunta.tipo,
                respuestas: p.respuestas.map(r => ({
                    idRespuesta: r.idRespuesta,
                    idPregunta: r.idPregunta,
                    texto: r.texto,
                    esCorrecta: r.esCorrecta,
                    retroalimentacion: r.retroalimentacion
                }))
            }))
        };

    } catch (error) {
        console.error("Error cargando juego:", error);
        return null;
    }
};

// evaluarTest.js
export async function evaluarTest(respuestasUsuario, urlJson, idJuego) {
    try {
        const resp = await fetch(urlJson);
        if (!resp.ok) throw new Error("No se pudo cargar el JSON");
        const data = await resp.json();
        let test;
        if (data.juegos) {
            test = data.juegos.find(j => j.juego.idJuego === idJuego)?.juego;
        } else if (data.juego && data.juego.idJuego === idJuego) {
            test = data.juego;
        }

        if (test.idTipoJuego !== 1) {
            console.error("Juego no es de tipo TEST.");
            return [];
        }



        if (!test) throw new Error(`Juego con id ${idJuego} no encontrado`);

        const correctasSet = {};
        const retroDict = {};

        for (const item of test.preguntas) {
            const idP = item.pregunta.idPregunta;
            correctasSet[idP] = new Set(
                item.respuestas
                    .filter(r => r.esCorrecta)
                    .map(r => r.idRespuesta)
            );

            retroDict[idP] = {};
            for (const r of item.respuestas) {
                retroDict[idP][r.idRespuesta] = r.retroalimentacion ?? "";
            }
        }

        let totalAciertos = 0;
        let totalFallos = 0;
        let totalPreguntas = respuestasUsuario.length;
        let cantidadTodosCorrectas = 0;
        let detalle = [];

        for (const r of respuestasUsuario) {
            const setCorrectas = correctasSet[r.idPregunta] ?? new Set();
            const retroMap = retroDict[r.idPregunta] ?? {};

            let aciertos = 0;
            let fallos = 0;
            const opcionesResultado = [];

            for (const o of r.opciones) {
                const esCorrecta = setCorrectas.has(o.idOpcion);
                if (o.seleccionada) {
                    if (esCorrecta) aciertos++;
                    else fallos++;
                }

                opcionesResultado.push({
                    idOpcion: o.idOpcion,
                    seleccionada: o.seleccionada,
                    esCorrecta,
                    retroalimentacion: retroMap[o.idOpcion] ?? "",
                });
            }

            const esMultiple = setCorrectas.size > 1;
            let puntos = 0;
            if (esMultiple) puntos = fallos === 0 ? aciertos / setCorrectas.size : 0;
            else puntos = fallos === 0 && aciertos === 1 ? 1 : 0;

            if (puntos === 1) cantidadTodosCorrectas++;

            totalAciertos += puntos;
            totalFallos += fallos;

            detalle.push({ idPregunta: r.idPregunta, opciones: opcionesResultado, puntos, fallos });
        }

        const calificacion = totalPreguntas > 0 ? (totalAciertos / totalPreguntas) * 100 : 0;

        return {
            nombre: test.nombre,
            descripcion: test.descripcion,
            detalleTest: test.detalle,
            totalPreguntas,
            totalAciertos: cantidadTodosCorrectas,
            totalFallos,
            calificacion,
            detalle,
            mensaje: "No te detengas, ¡tu aprendizaje apenas comienza!"
        };

    } catch (error) {
        return { error: error.message };
    }
}


export const obtenerListaJuegos = async (jsonUrl) => {
    try {
        const resp = await fetch(jsonUrl);
        if (!resp.ok) throw new Error("No se pudo cargar el JSON");

        const data = await resp.json();

        if (!data.juegos || !Array.isArray(data.juegos)) return [];

        // Retornar solo los campos esenciales de cada juego
        return data.juegos.map(j => {
            const juego = j.juego;
            return {
                idJuego: juego.idJuego,
                idTipoJuego: juego.idTipoJuego,
                nombre: juego.nombre,
                detalle: juego.detalle,
                descripcion: juego.descripcion,
                activo: true
            };
        });
    } catch (error) {
        console.error("Error al obtener la lista de juegos:", error);
        return [];
    }
};



export const obtenerJuegoPalabras = async (jsonUrl, idJuego) => {
    try {
        const resp = await fetch(jsonUrl);
        if (!resp.ok) throw new Error("No se pudo cargar el JSON");

        const data = await resp.json();

        // Validar que existan juegos
        if (!data.juegos || !Array.isArray(data.juegos)) {
            console.warn("No se encontraron juegos en el JSON");
            return null;
        }

        // Buscar el juego por id
        const juego = data.juegos.find(j => j.juego.idJuego === idJuego)?.juego;


        if (juego.tipoJuego === 1) {
            console.error("Juego no es de tipo Ordenar palabras, completar texto o sopa de letras.");
            return [];
        }

        if (!juego) {
            console.warn(`Juego con id ${idJuego} no encontrado`);
            return null;
        }

        // Retornar solo los datos del juego
        return juego;
    } catch (error) {
        console.error("Error al obtener el juego:", error);
        return null;
    }
};
