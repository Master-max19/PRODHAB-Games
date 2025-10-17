const RangoEvaluacionService = {
  // Obtener todos los rangos de un juego
  async obtenerPorJuego(idJuego) {
    try {
      const data = await apiFetch(`${CONFIG.apiUrl}/api/RangoEvaluacion/juego/${idJuego}`);
      return data.map(u => ({
        id: u.id,
        idJuegos: u.idJuegos,
        rangoMinimo: u.rangoMinimo,
        rangoMaximo: u.rangoMaximo,
        mensaje: decodeHtml(u.mensaje)
      }));
    } catch (error) {
      console.error("Error obteniendo rangos:", error);
      return [];
    }
  },

  // Crear un nuevo rango
  async crear(rango) {
    try {
      return await apiFetch(`${CONFIG.apiUrl}/api/RangoEvaluacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rango)
      });
    } catch (error) {
      console.error("Error creando rango:", error);
      return null;
    }
  },

  // Editar un rango existente
  async editar(id, rango) {
    try {
      return await apiFetch(`${CONFIG.apiUrl}/api/RangoEvaluacion/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rango)
      });
    } catch (error) {
      console.error("Error editando rango:", error);
      alert(error.message);
      return null;
    }
  },

  // Eliminar un rango
  async eliminar(id) {
    try {
      const res = await apiFetch(`${CONFIG.apiUrl}/api/RangoEvaluacion/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      return { success: true, data: res };
    } catch (error) {
      console.error("Error eliminando rango:", error);
      return null;
    }
  }
};

// Función para decodificar HTML seguro
function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
