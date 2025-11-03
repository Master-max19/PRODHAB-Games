const CRUDTestService = {


  async obtenerPreguntasTestJuego(idTest) {
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
        `${CONFIG.apiUrl}/api/test/admin/${idTest}/con-respuestas`,
        { credentials: "include" }
      );

      return Array.isArray(preguntas) ? preguntas : [];
    } catch (error) {
      console.error("Error fetching preguntas:", error);
      return []; // siempre devolver array
    }
  }
  ,
  async crearPregunta(pregunta, idTest) {
    try {
      return await apiFetch(`${CONFIG.apiUrl}/api/Pregunta/juego/${idTest}/con-respuestas`, {
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
      return await apiFetch(`${CONFIG.apiUrl}/api/Pregunta/con-respuestas/${idPregunta}`, {
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
      const res = await fetch(`${CONFIG.apiUrl}/api/Pregunta/${idPregunta}`, {
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
      const res = await fetch(`${CONFIG.apiUrl}/api/Pregunta/estado/${idPregunta}/${Boolean(activa)}`, {
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
