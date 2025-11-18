const RangoEvaluacionService = (() => {
  async function obtenerPorJuego(idJuego) {
    try {
      const data = await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/RangoEvaluacion/juego/${idJuego}`);
      return data.map(u => ({
        idRangoEvaluacion: u.idRangoEvaluacion,
        idJuego: u.idJuego,
        rangoMinimo: u.rangoMinimo,
        rangoMaximo: u.rangoMaximo,
        mensaje: u.mensaje
      }));
    } catch (error) {
      console.error("Error obteniendo rangos:", error);
      throw error; // lanzar el error para que la UI lo capture
    }
  }

  async function crear(rango, idJuego) {
    try {
      return await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/RangoEvaluacion/${idJuego}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rango)
      });
    } catch (error) {
      console.error("Error creando rango:", error);
      throw error;
    }
  }

  async function editar(idRangoEvaluacion, rango) {
    try {
      return await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/RangoEvaluacion/${idRangoEvaluacion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rango)
      });
    } catch (error) {
      console.error("Error editando rango:", error);
      throw error;
    }
  }

  async function eliminar(idRangoEvaluacion) {
    try {
      const res = await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/RangoEvaluacion/${idRangoEvaluacion}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      return { success: true, data: res };
    } catch (error) {
      console.error("Error eliminando rango:", error);
      throw error;
    }
  }
  return { obtenerPorJuego, crear, editar, eliminar }


})();


