import { CONFIG_JUEGO_PRODHAB } from "../juegosEnvironments.js";
import { apiFetch } from "../util/juegoFunctionUtility.js";

export async function obtenerPreguntasTestJuego(idTest) {
  try {
    // Si no se pasa idTest, intentar obtenerlo de la URL
    if (!idTest) {
      const params = new URLSearchParams(window.location.search);
      idTest = params.get("idJuego") || 1; // default 1 si no hay
    }

    // Verificar sesión
    if (!sessionStorage.getItem("sesion_admin_juegos_prodhab")) {
      console.warn("Usuario no autorizado");
      return []; // siempre devolver array
    }

    const preguntas = await apiFetch(
      `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/test/admin/${idTest}/con-respuestas`,
      { credentials: "include" }
    );

    return Array.isArray(preguntas) ? preguntas : [];
  } catch (error) {
    console.error("Error fetching preguntas:", error);
    return []; // siempre devolver array
  }
}

export async function crearPregunta(pregunta, idTest) {
  try {
    const response = await apiFetch(
      `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Pregunta/juego/${idTest}/con-respuestas`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pregunta),
      }
    );

    if (response.error || response.mensaje) {
      return { error: true, detalle: response };
    }

    return response;
  } catch (error) {
    console.error("Error creando pregunta:", error);
    return { error: true, detalle: error.message };
  }
}

export async function actualizarPregunta(pregunta, idPregunta) {
  try {
    const response = await apiFetch(
      `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Pregunta/con-respuestas/${idPregunta}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pregunta),
      }
    );

    if (response.mensaje || response.error) {
      return { error: true, detalle: response };
    }

    return response;
  } catch (error) {
    console.error("Error actualizando pregunta:", error);
    return { error: true, detalle: error.message };
  }
}

export async function eliminarPregunta(idPregunta) {
  if (!idPregunta) throw new Error("Debes proporcionar el ID de la pregunta");

  try {
    const data = await apiFetch(
      `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Pregunta/${idPregunta}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    return data ?? { exito: true };
  } catch (err) {
    console.error("Error eliminando pregunta:", err);
    throw err;
  }
}

export async function cambiarEstadoPregunta(idPregunta, activa) {
  if (!idPregunta) throw new Error("Debes proporcionar el ID de la pregunta");

  try {
    const data = await apiFetch(
      `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Pregunta/estado/${idPregunta}/${Boolean(activa)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );

    return data ?? { success: true, idPregunta, activa: Boolean(activa) };
  } catch (err) {
    console.error("Error cambiando estado de la pregunta:", err);
    throw err;
  }
}
