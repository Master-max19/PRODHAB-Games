// completarTextoService.js
import { CONFIG_JUEGO_PRODHAB } from "../juegosEnvironments.js";
import { apiFetch } from "../util/juegoFunctionUtility.js";
import { obtenerJuegoPalabras } from "../util/localGamesFunctions.js";

/* ---------------------- UTILIDADES INTERNAS ---------------------- */

function normalizarTextoCompletar(texto) {
    return texto
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function transformarFraseOrdenSecuencial(texto, palabras) {
    const palabrasLimpias = palabras
        .map(p => p.trim())
        .filter(p => p.length > 0);

    const coincidencias = [];
    const textoMinus = normalizarTextoCompletar(texto);

    palabrasLimpias.forEach(palabraOriginal => {
        const norma = normalizarTextoCompletar(palabraOriginal);
        const escape = palabraOriginal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b${escape}\\b`, "gi");

        let match;
        while ((match = regex.exec(texto)) !== null) {
            const inicio = match.index;
            const fin = regex.lastIndex;

            coincidencias.push({
                palabra: match[0],
                inicio,
                fin,
                normalizado: norma
            });
        }
    });

    coincidencias.sort((a, b) => a.inicio - b.inicio);

    const unicos = [];
    const posicionesUsadas = [];

    for (const c of coincidencias) {
        if (!posicionesUsadas.some(pos => c.inicio < pos.fin && c.fin > pos.inicio)) {
            unicos.push(c);
            posicionesUsadas.push(c);
        }
    }

    let formato = texto;
    const matches = [];
    let offset = 0;
    let contador = 1;

    unicos.forEach(coincidencia => {
        const inicio = coincidencia.inicio + offset;
        const fin = coincidencia.fin + offset;
        const reemplazo = `___${contador++}___`;

        formato = formato.slice(0, inicio) + reemplazo + formato.slice(fin);
        matches.push(coincidencia.palabra);

        offset += reemplazo.length - (fin - inicio);
    });

    const usadas = new Set(matches.map(m => normalizarTextoCompletar(m)));
    const distractores = palabrasLimpias.filter(
        p => !usadas.has(normalizarTextoCompletar(p))
    );

    return { formato, matches, distractores };
}

/* --------------------------- API PUBLICA --------------------------- */

export async function obtenerDatosCompletarTexto(idJuego) {
    if (!idJuego) {
        const params = new URLSearchParams(window.location.search);
        idJuego = params.get("idCompletar");
    }

    const response = await fetch(
        `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/completar-texto/${idJuego}`
    );

    if (!response.ok) throw new Error(`Error: ${response.status}`);

    const data = await response.json();
    if (!data.exito) throw new Error(data.mensaje);

    return data;
}


export async function obtenerRondas(idJuego = 3) {
    try {
        // Si no viene el ID, buscarlo en la URL
        if (!idJuego) {
            const params = new URLSearchParams(window.location.search);
            idJuego = params.get("idCompletar");
        }

        idJuego = Number.parseInt(idJuego);

        const jsonFile = CONFIG_JUEGO_PRODHAB.getJsonUrl() || "";

        let data = null;

        if (jsonFile && jsonFile.toLowerCase().endsWith(".json")) {
            data = await obtenerJuegoPalabras(jsonFile, idJuego);
        } else {
            data = await obtenerDatosCompletarTexto(idJuego);
        }

        if (!Array.isArray(data.rondas)) return [];

        const rondasFormateadas = data.rondas
            .map(ronda => {
                if (!Array.isArray(ronda.palabras) || ronda.palabras.length === 0)
                    return null;

                const palabrasLimpias = ronda.palabras
                    .map(p => p.trim())
                    .filter(p => p.length > 0);

                if (palabrasLimpias.length === 0) return null;

                const { formato, matches, distractores } =
                    transformarFraseOrdenSecuencial(ronda.texto, palabrasLimpias);

                if (matches.length === 0) return null;

                return { texto: formato, espacios: matches, distractores };
            })
            .filter(r => r !== null);

        return {
            idJuego,
            nombre: data.nombre ?? "",
            rondas: rondasFormateadas,
            descripcion: data.descripcion ?? "",
            detalle: data.detalle ?? ""

        };
    } catch (error) {
        console.error("Error en obtenerRondas:", error);

        return {
            exito: false,
            rondas: []
        };
    }
}

export async function obtenerRondasMapeadas(idJuego = 3) {
    const data = await obtenerDatosCompletarTextoAdmin(idJuego);
    if (!Array.isArray(data.rondas)) return { tema: data.descripcion, rondas: [] };

    const rondas = data.rondas.map(ronda => ({
        id: `${ronda.idPregunta}`,
        titulo: ronda.texto,
        subItems: (ronda.palabras || []).map(p => ({
            id: `${p.idRespuesta}`,
            texto: p.texto
        }))
    }));

    return { tema: data.descripcion, rondas };
}

export async function obtenerDatosCompletarTextoAdmin(idJuego = 3) {
    const data = await apiFetch(
        `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/completar-texto/admin/${idJuego}`,
        { method: "GET" }
    );

    if (!data) throw new Error("No se recibió respuesta del servidor");
    if (!data.exito) throw new Error(data.mensaje);

    return data;
}

export async function eliminarRonda(idRonda) {
    if (!idRonda) throw new Error("Debes proporcionar el ID de la ronda");

    const data = await apiFetch(
        `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/completar-texto/ronda/${idRonda}`,
        {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }
    );

    if (!data) return null;
    if (!data.exito) throw new Error(data.mensaje);

    return data;
}

export async function crearRonda(idJuego, enunciado) {
    if (!idJuego) throw new Error("Debes proporcionar el ID del juego");
    if (!enunciado) throw new Error("Debes proporcionar el enunciado de la ronda");

    const data = await apiFetch(
        `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/completar-texto/crear-ronda/${idJuego}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "*/*"
            },
            body: JSON.stringify({ enunciado })
        }
    );

    if (!data) return null;
    if (!data.exito) throw new Error(data.mensaje);

    return data;
}

export async function guardarSubitems(idItem, respuestas) {
    if (!idItem) throw new Error("Debes proporcionar el ID del item");
    if (!Array.isArray(respuestas)) throw new Error("Respuestas inválidas");

    const data = await apiFetch(
        `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/completar-texto/opciones/${idItem}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ respuestas })
        }
    );

    if (!data) return null;
    if (!data.exito) throw new Error(data.mensaje);

    return data;
}

export async function eliminarSubitem(idOpcion) {
    if (!idOpcion) throw new Error("Debes proporcionar el ID del subitem");

    const data = await apiFetch(
        `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/completar-texto/opcion-completar/${idOpcion}`,
        {
            method: "DELETE",
            headers: { accept: "*/*" }
        }
    );

    if (!data) return null;
    if (data.exito === false) throw new Error(data.mensaje);

    return data;
}

export async function actualizarRonda(id, enunciado) {
    const data = await apiFetch(
        `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/completar-texto/${id}`,
        {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enunciado })
        }
    );

    if (!data) return null;

    return data;
}
