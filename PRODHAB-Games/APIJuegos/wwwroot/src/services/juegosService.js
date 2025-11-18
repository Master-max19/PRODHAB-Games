const juegoService = (() => {


    async function obtenerJuegos() {
        try {
            const resp = await fetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Juego`);
            if (!resp.ok) {
                throw new Error(`Error al obtener los juegos: ${resp.status} ${resp.statusText}`);
            }
            return await resp.json();
        } catch (err) {
            console.error("Error en obtenerJuegos:", err);
            throw err;
        }
    }

    /**
 * Obtiene los juegos por tipo
 * @param {number} idTipoJuego
 * @returns {Promise<Array>} Lista de juegos
 */
    async function obtenerJuegosPorTipo(idTipoJuego) {
        try {
            const resp = await utilFetch.apiFetch(
                `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Juego/buscar?idTipoJuego=${encodeURIComponent(idTipoJuego)}`
            );
            return resp; // utilFetch.apiFetch ya maneja JSON y errores
        } catch (err) {
            console.error("Error en obtenerJuegosPorTipo:", err);
            throw err;
        }
    }

    /**
     * Actualiza un juego existente por su ID.
     * @param {number} id - ID del juego a actualizar.
     * @param {object} datos - Objeto con los campos a actualizar.
     * @returns {Promise<object>} Respuesta del servidor.
     */
    async function actualizarJuego(id, datos) {
        try {
            const resp = await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Juego/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datos),
            });
            return resp;
        } catch (err) {
            console.error("Error en actualizarJuego:", err);
            throw err;
        }
    }


    /**
     * Crea un nuevo juego (POST)
     */
    async function crearJuego(datos) {
        try {
            const resp = await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Juego`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });
            return resp; // utilFetch.apiFetch ya maneja JSON y errores
        } catch (err) {
            console.error("Error en crearJuego:", err);
            throw err;
        }
    }

    /**
 * Elimina un juego por su ID (DELETE)
 */
    async function eliminarJuego(id) {
        try {
            await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Juego/${id}`, {
                method: "DELETE",
            });
            return true; // si apiFetch no lanza error, la eliminación fue exitosa
        } catch (err) {
            console.error("Error en eliminarJuego:", err);
            throw err;
        }
    }

    return { obtenerJuegos, obtenerJuegosPorTipo, actualizarJuego, crearJuego, eliminarJuego };

})();