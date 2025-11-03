const usuarioService = {
  async obtenerUsuarios() {
    try {
      const data = await apiFetch(`${CONFIG.apiUrl}/api/usuario`);
      return data.map(item => ({
        correo: item.correo,
        estado: item.estado ? "Activo" : "Inactivo",
        rol: item.rol,
        fechaCreacion: new Date(item.fechaCreacion).toLocaleDateString(),
      }));
    } catch (error) {
      console.error("Error fetching usuarios:", error);
      return [];
    }
  },

  async eliminarUsuario(correo) {
    try {
      await apiFetch(`${CONFIG.apiUrl}/api/usuario/${encodeURIComponent(correo)}`, {
        method: "DELETE"
      });
      return true;
    } catch (error) {
      console.error("Error eliminar usuario:", error);
      return false;
    }
  },

  async crearUsuario({ correo, password, idRol, activo = true }) {
    try {
      return await apiFetch(`${CONFIG.apiUrl}/api/usuario/register`, {
        method: "POST",
        body: JSON.stringify({ correo, password, idRol: Number(idRol), activo }),
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error crear usuario:", error.message);
      throw error;
    }
  },

  async desactivarUsuario(correo) {
    try {
      return await apiFetch(`${CONFIG.apiUrl}/api/usuario/desactivar/${encodeURIComponent(correo)}`, {
        method: "PUT"
      });
    } catch (error) {
      console.error("Error desactivar usuario:", error.message);
      throw error;
    }
  },

    async cambiarClave(correo, nuevaClave) {
    try {
      return await apiFetch(
        `${CONFIG.apiUrl}/api/usuario/actualizar-clave/${encodeURIComponent(correo)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nuevaClave })
        }
      );
    } catch (error) {
      console.error("Error cambiando contraseña:", error.message);
      throw error;
    }
  }
};
