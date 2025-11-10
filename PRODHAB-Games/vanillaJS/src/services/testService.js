const obtenerPreguntasTest = async (idTest) => {

    try {
        // Si no se pasa idTest, intenta obtenerlo desde la URL
        if (!idTest) {
            const params = new URLSearchParams(window.location.search);
            idTest = params.get('idTest'); // valor por defecto = 1
        }

        const res = await fetch(`${CONFIG.apiUrl}/api/Test/preguntas/${Number(idTest)}`);
        if (!res.ok) throw new Error('Error al obtener preguntas');
        return await res.json();
    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
};


const enviarRespuestasTest = async (respuestas, idTest) => {
    try {
        if (!idTest) {
            const params = new URLSearchParams(window.location.search);
            idTest = params.get('idTest'); // valor por defecto = 1
        }

        const response = await fetch(`${CONFIG.apiUrl}/api/Test/evaluar/${idTest}`, {
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
            id: 'o' + r.idRespuesta,
            texto: r.texto,
            correcta: r.esCorrecta
        }))
        .filter(r => r.texto && r.texto.trim() !== "");
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
