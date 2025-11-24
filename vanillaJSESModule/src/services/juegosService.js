import { CONFIG_JUEGO_PRODHAB } from "../juegosEnvironments.js";
import { apiFetch } from "../util/juegoFunctionUtility.js";
import { obtenerListaJuegos } from "../util/localGamesFunctions.js";

export async function obtenerJuegos() {
    try {
        const jsonFile = CONFIG_JUEGO_PRODHAB.getJsonUrl() || "";
        
        if (jsonFile.toLowerCase().endsWith(".json")) {
            const dataLocal = await obtenerListaJuegos(jsonFile);
            console.log(dataLocal)
            return dataLocal; 
        }
        const resp = await fetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Juego`);

        if (!resp.ok) {
            throw new Error(`Error al obtener los juegos: ${resp.status} ${resp.statusText}`);
        }

        const dataApi = await resp.json();
        return dataApi;

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
export async function obtenerJuegosPorTipo(idTipoJuego) {
    try {
        const resp = await apiFetch(
            `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Juego/buscar?idTipoJuego=${encodeURIComponent(idTipoJuego)}`
        );
        return resp;
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
export async function actualizarJuego(id, datos) {
    try {
        const resp = await apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Juego/${id}`, {
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
export async function crearJuego(datos) {
    try {
        const resp = await apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Juego`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
        });
        return resp;
    } catch (err) {
        console.error("Error en crearJuego:", err);
        throw err;
    }
}

/**
 * Elimina un juego por su ID (DELETE)
 */
export async function eliminarJuego(id) {
    try {
        await apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Juego/${id}`, {
            method: "DELETE",
        });
        return true;
    } catch (err) {
        console.error("Error en eliminarJuego:", err);
        throw err;
    }
}
