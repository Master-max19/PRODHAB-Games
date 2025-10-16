const obtenerPreguntas = async (cantidad = 5) => {
    try {
        const res = await fetch(`http://localhost:5133/api/Preguntas/aleatorias?cantidad=${cantidad}`);
        if (!res.ok) throw new Error('Error al obtener preguntas');
        return await res.json();
    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
};


const mapearPreguntaAPI = (preguntaAPI) => {
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
        categoria: preguntaAPI.tipo,
        opciones
    };
};
