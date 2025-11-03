const RangoEvaluacionService = {
  async obtenerPorJuego(idJuego) {
    try {
      const data = await apiFetch(`${CONFIG.apiUrl}/api/RangoEvaluacion/juego/${idJuego}`);
      return data.map(u => ({
        idRangoEvaluacion: u.idRangoEvaluacion,
        idJuego: u.idJuego,
        rangoMinimo: u.rangoMinimo,
        rangoMaximo: u.rangoMaximo,
        mensaje: decodeHtml(u.mensaje)
      }));
    } catch (error) {
      console.error("Error obteniendo rangos:", error);
      throw error; // lanzar el error para que la UI lo capture
    }
  },

  async crear(rango) {
    try {
      return await apiFetch(`${CONFIG.apiUrl}/api/RangoEvaluacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rango)
      });
    } catch (error) {
      console.error("Error creando rango:", error);
      throw error;
    }
  },

  async editar(idRangoEvaluacion, rango) {
    try {
      return await apiFetch(`${CONFIG.apiUrl}/api/RangoEvaluacion/${idRangoEvaluacion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rango)
      });
    } catch (error) {
      console.error("Error editando rango:", error);
      throw error;
    }
  },

  async eliminar(idRangoEvaluacion) {
    try {
      const res = await apiFetch(`${CONFIG.apiUrl}/api/RangoEvaluacion/${idRangoEvaluacion}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      return { success: true, data: res };
    } catch (error) {
      console.error("Error eliminando rango:", error);
      throw error;
    }
  }
};

function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
