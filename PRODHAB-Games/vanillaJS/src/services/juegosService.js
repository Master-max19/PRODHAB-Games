const juegoService = {
    async obtenerJuegos() {
        try {
            const resp = await fetch(`${CONFIG.apiUrl}/api/Juego`);
            if (!resp.ok) {
                throw new Error(`Error al obtener los juegos: ${resp.status} ${resp.statusText}`);
            }
            return await resp.json();
        } catch (err) {
            console.error("Error en obtenerJuegos:", err);
            throw err;
        }
    },

    /**
 * Obtiene los juegos por tipo
 * @param {number} idTipoJuego
 * @returns {Promise<Array>} Lista de juegos
 */
    async obtenerJuegosPorTipo(idTipoJuego) {
        try {
            const resp = await fetch(`${CONFIG.apiUrl}/api/Juego/buscar?idTipoJuego=${encodeURIComponent(idTipoJuego)}`);
            if (!resp.ok) {
                throw new Error(`Error al obtener los juegos: ${resp.status} ${resp.statusText}`);
            }
            return await resp.json();
        } catch (err) {
            console.error("Error en obtenerJuegos:", err);
            throw err;
        }
    },
    /**
     * Actualiza un juego existente por su ID.
     * @param {number} id - ID del juego a actualizar.
     * @param {object} datos - Objeto con los campos a actualizar.
     * @returns {Promise<object>} Respuesta del servidor.
     */
    async actualizarJuego(id, datos) {
        try {
            const resp = await fetch(`${CONFIG.apiUrl}/api/Juego/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datos),
            });

            if (!resp.ok) {
                const errText = await resp.text();
                throw new Error(`Error ${resp.status}: ${errText}`);
            }

            return await resp.json();
        } catch (err) {
            console.error("Error en actualizarJuego:", err);
            throw err;
        }
    }
    ,

    /**
     * Crea un nuevo juego (POST)
     */
    async crearJuego(datos) {
        try {
            const resp = await fetch(`${CONFIG.apiUrl}/api/Juego`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });

            if (!resp.ok) {
                const errorData = await resp.json().catch(() => ({}));
                throw new Error(
                    `Error al crear el juego: ${errorData.message || resp.statusText}`
                );
            }

            return await resp.json();
        } catch (err) {
            console.error("Error en crearJuego:", err);
            throw err;
        }
    },
    /**
 * Elimina un juego por su ID (DELETE)
 */
    async eliminarJuego(id) {
        try {
            const resp = await fetch(`${CONFIG.apiUrl}/api/Juego/${id}`, {
                method: "DELETE",
            });

            if (!resp.ok) {
                const errorData = await resp.json().catch(() => ({}));
                throw new Error(
                    `Error al eliminar el juego: ${errorData.message || resp.statusText}`
                );
            }

            return true;
        } catch (err) {
            console.error("Error en eliminarJuego:", err);
            throw err;
        }
    },
};