import { CONFIG_JUEGO_PRODHAB } from "../juegosEnvironments.js";
import { apiFetch } from "../util/juegoFunctionUtility.js";



export async function registrarJuego(idJuego) {
    try {
        const jsonFile = CONFIG_JUEGO_PRODHAB.getJsonUrl();

        if (!jsonFile || !jsonFile.toLowerCase().endsWith(".json")) {
            console.error("El archivo de configuración no es válido.");
            return null;
        }

        const response = await fetch(
            `${CONFIG_JUEGO_PRODHAB.apiUrl}/registrar/${idJuego}`,
            {
                method: "POST",
                headers: { Accept: "application/json" }
            }
        );

        if (!response.ok) throw new Error(`Error ${response.status}`);

        return await response.json();

    } catch (error) {
        console.error("Error al registrar el juego:", error.message);
        return null;
    }
}


export async function obtenerEstadisticas(idJuego = 17) {
    try {
        const data = await apiFetch(
            `${CONFIG_JUEGO_PRODHAB.apiUrl}/estadisticas/${idJuego}`,
            {
                method: "GET",
                headers: { Accept: "*/*" }
            }
        );

        if (!data) return null;

        return data;
    } catch (error) {
        console.error("Error al obtener estadísticas:", error.message);
        return null;
    }
}
