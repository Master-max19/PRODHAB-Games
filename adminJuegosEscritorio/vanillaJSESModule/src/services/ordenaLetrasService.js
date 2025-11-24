import { CONFIG_JUEGO_PRODHAB } from "../juegosEnvironments.js";
import { obtenerJuegoPalabras } from "../util/localGamesFunctions.js";

// Normaliza texto: minúsculas + sin espacios al inicio/final
function normalizeText(str) {
  return str.toLowerCase().trim();
}

export async function obtenerTextoYPalabras(idOrdenar) {
  try {
    // Obtener idOrdenar desde URL si no viene por parámetro
    if (!idOrdenar) {
      const params = new URLSearchParams(window.location.search);
      idOrdenar = params.get("idOrdenar");
    }

    if (!idOrdenar) {
      throw new Error("No se proporcionó idOrdenar");
    }

    const jsonFile = CONFIG_JUEGO_PRODHAB.getJsonUrl() || "";
    let data = null;

    // Cargar datos desde API o desde JSON local
    if (!jsonFile || !jsonFile.toLowerCase().endsWith(".json")) {
      const res = await fetch(
        `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/PalabraJuego/solo-palabras/${idOrdenar}`
      );
      if (!res.ok) throw new Error("Error al cargar palabras desde la API");
      data = await res.json();
    } else {
      data = await obtenerJuegoPalabras(jsonFile, Number.parseInt(idOrdenar));
    }

    const texto = data.descripcion || "";
    const palabrasObjetivoRaw = data.palabras || [];

    // Normalizamos una sola vez las palabras objetivo para comparación rápida
    const palabrasSet = new Set(
      palabrasObjetivoRaw
        .map((p) => normalizeText(p))
        .filter(Boolean) // elimina vacíos o null
    );

    // Regex que captura SOLO palabras completas (letras con acentos y ñ)
    // Esto evita que coincida "sol" dentro de "resolver"
    const REGEX_PALABRA_COMPLETA = /[a-záéíóúüñ]+/gi;

    // Resaltado seguro: solo palabras completas que existan exactamente en la lista
    const textoResaltado = texto.replace(
      REGEX_PALABRA_COMPLETA,
      (palabraOriginal) => {
        const palabraNormalizada = normalizeText(palabraOriginal);

        // Solo resaltar si la palabra completa está en el conjunto objetivo
        if (palabrasSet.has(palabraNormalizada)) {
          return `<b>${palabraOriginal}</b>`;
        }
        return palabraOriginal;
      }
    );

    // Devolver todo lo necesario
    return {
      idJuego: data.idJuego || idOrdenar,
      texto: texto,
      palabras: palabrasObjetivoRaw,        // palabras originales (con mayúsculas/acentos como venían)
      palabrasNormalizadas: [...palabrasSet], // opcional, para depuración
      tema: data.nombre || "",
      detalle: data.detalle || "",
      textoResaltado: textoResaltado,       // ¡Aquí está el texto con <b> correctas!
    };

  } catch (err) {
    console.error("Error en obtenerTextoYPalabras:", err);
    return {
      idJuego: idOrdenar || "",
      texto: "",
      palabras: [],
      tema: "",
      detalle: "",
      textoResaltado: "",
    };
  }
}