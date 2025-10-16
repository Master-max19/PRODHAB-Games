const CRUDTestService = {
  async obtenerPreguntasTestJuego(idJuegos = 1) {
    try {
      return await apiFetch(`${CONFIG.apiUrl}/api/Preguntas/juego/${idJuegos}/con-respuestas`, {
        credentials: "include"
      });
    } catch (error) {
      console.error("Error fetching preguntas:", error);
      return [];
    }
  },

  async crearPregunta(pregunta, idJuegos) {
    try {
      return await apiFetch(`${CONFIG.apiUrl}/api/Preguntas/juego/${idJuegos}/con-respuestas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pregunta)
      });
    } catch (error) {
      console.error("Error creando pregunta:", error);
      return null;
    }
  },

  async actualizarPregunta(pregunta, idPregunta) {
    try {
      return await apiFetch(`${CONFIG.apiUrl}/api/Preguntas/con-respuestas/${idPregunta}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pregunta)
      });
    } catch (error) {
      console.error("Error actualizando pregunta:", error);
      return null;
    }
  },

  async eliminarPregunta(idPregunta) {
    try {
      const res = await fetch(`${CONFIG.apiUrl}/api/Preguntas/${idPregunta}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) throw new Error("Error al eliminar la pregunta");

      if (res.status === 204) return { success: true };
      return await res.json();
    } catch (error) {
      console.error("Error eliminando pregunta:", error);
      return null;
    }
  },

  async cambiarEstadoPregunta(idPregunta, activa) {
    try {
      const res = await fetch(`${CONFIG.apiUrl}/api/Preguntas/estado/${idPregunta}/${Boolean(activa)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) throw new Error("Error al cambiar el estado de la pregunta");

      if (res.status === 204) return { success: true, idPregunta, activa: Boolean(activa) };
      return await res.json();
    } catch (error) {
      console.error("Error cambiando estado de la pregunta:", error);
      return null;
    }
  }
};
