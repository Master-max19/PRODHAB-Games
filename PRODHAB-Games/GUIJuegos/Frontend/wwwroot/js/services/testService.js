

const obtenerPreguntasTest = async (idJuegos = 1) => {
    try {
        const res = await fetch(`${CONFIG.apiUrl}/api/Preguntas/juegos/${idJuegos}`);
        if (!res.ok) throw new Error('Error al obtener preguntas');
        return await res.json();
    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
};


const enviarRespuestasTest = async (respuestas) => {
    try {
        const response = await fetch(`${CONFIG.apiUrl}/api/Juegos/evaluar/1`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(respuestas)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData.errors || errorData));
        }
        return await response.json();
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error;
    }
};


function convertirLinkConEstiloTest(texto) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return texto.replace(urlRegex, url => {
        return `<a href="${url}" target="_blank" style="color: blue; font-weight: bold;">haz clic aquí</a>`;
    });
}


const mezclarOpcionesTest = (pregunta) => {
    const opciones = [...pregunta.opciones]; // Copy to avoid mutating original
    for (let i = opciones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
    }
    return opciones;
};


const mapearPreguntaAPITest = (preguntaAPI) => {
    const opciones = preguntaAPI.respuestas
        .map(r => ({
            id: 'o' + r.id,
            texto: r.texto,
            correcta: r.es_correcta,
            retroalimentacion: r.retroalimentacion
        }))
        .filter(r => r.texto && r.texto.trim() !== ""); // eliminar respuestas vacías
    if (opciones.length === 0) return null;

    return {
        id: 'pregunta' + preguntaAPI.idPregunta,
        titulo: preguntaAPI.enunciado,
        categoria: (preguntaAPI.tipo).toLowerCase(),
        opciones
    };
};


const interpolarMensajeTest = (mensaje, variables) => {
    if (!mensaje) return "";
    const contieneVariables = /\$\{.+?\}/.test(mensaje);
    if (!contieneVariables) return mensaje;
    return mensaje.replace(/\$\{(.+?)\}/g, (_, key) => {
        return variables[key] !== undefined ? variables[key] : "";
    });
};
