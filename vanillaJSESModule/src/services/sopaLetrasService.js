import { CONFIG_JUEGO_PRODHAB } from "../juegosEnvironments.js";
import { obtenerJuegoPalabras } from "../util/localGamesFunctions.js";

export async function obtenerDatosSopa(idSopa) {
    try {
        // Leer ID desde la URL si no se envió
        if (!idSopa) {
            const params = new URLSearchParams(window.location.search);
            idSopa = parseInt(params.get("idSopa"));
        }

        if (!idSopa || isNaN(idSopa)) {
            throw new Error("idSopa inválido");
        }

        // Determinar si debe leer JSON o API
        const jsonFile = CONFIG_JUEGO_PRODHAB.getJsonUrl();

        let data = null;

        // Si hay JSON y termina en .json → cargar JSON local
        if (jsonFile && jsonFile.toLowerCase().endsWith(".json")) {
            data = await obtenerJuegoPalabras(jsonFile, idSopa);
        } else {
            // Cargar desde API
            const res = await fetch(
                `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/PalabraJuego/solo-palabras/${idSopa}`
            );

            if (!res.ok) {
                throw new Error("Error al obtener datos desde la API");
            }

            data = await res.json();
        }

        return {
            idJuego: data.idJuego,
            descripcion: data.descripcion,
            detalle: data.detalle || "",
            nombre: data.nombre || "Sopa de letras",
            palabras: Array.isArray(data.palabras)
                ? data.palabras.map(p => p.toUpperCase())
                : []
        };

    } catch (err) {
        console.error("SopaLetrasService:", err);

        // Datos de fallback
        return {
            idJuego: null,
            descripcion: "Países",
            detalle: "Encuentra los nombres de países en la sopa de letras.",
            palabras: ["JAPÓN", "BRASIL", "FRANCIA", "CANADÁ"]
        };
    }
}
