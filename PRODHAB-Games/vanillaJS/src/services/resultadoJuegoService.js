
const resultadoJuegoService = {

    /**
     * Registra un juego por ID y obtiene las estadísticas.
     * @param {number|string} idJuego - ID del juego (puede ser número o UUID)
     * @returns {Promise<Object|null>} - Datos de la estadística o null si hay error
     */
    async registrarJuego(idJuego) {
        try {
            const response = await fetch(`${CONFIG.apiUrl}/registrar/${idJuego}`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) throw new Error(`Error ${response.status}`);

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Error al registrar el juego:', error.message);
            return null;
        }
    },
    /**
     * Obtiene estadísticas de un test por ID.
     * @param {number|string} id - ID de la estadística a consultar. Default = 17
     * @returns {Promise<Object|null>} - Datos de la estadística o null si hay error
     */
async obtenerEstadisticas(idJuego = 17) {
    try {
        const data = await apiFetch(`${CONFIG.apiUrl}/estadisticas/${idJuego}`, {
            method: 'GET',
            headers: { 'Accept': '*/*' },
        });

        if (!data) return null; // sesión expirada o respuesta vacía

        return data;
    } catch (error) {
        console.error('Error al obtener estadísticas:', error.message);
        return null;
    }
}

}