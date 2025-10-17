const UsuarioService = {
  async obtenerUsuarios() {
    try {
      const data = await apiFetch(`${CONFIG.apiUrl}/api/usuarios`);
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
      await apiFetch(`${CONFIG.apiUrl}/api/usuarios/${encodeURIComponent(correo)}`, {
        method: "DELETE"
      });
      return true;
    } catch (error) {
      console.error("Error eliminar usuario:", error);
      return false;
    }
  },

  async crearUsuario({ correo, password, rolId, activo = true }) {
    try {
      return await apiFetch(`${CONFIG.apiUrl}/api/usuarios/register`, {
        method: "POST",
        body: JSON.stringify({ correo, password, rolId, activo }),
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error crear usuario:", error.message);
      throw error;
    }
  },

  async desactivarUsuario(correo) {
    try {
      return await apiFetch(`${CONFIG.apiUrl}/api/usuarios/desactivar/${encodeURIComponent(correo)}`, {
        method: "PUT"
      });
    } catch (error) {
      console.error("Error desactivar usuario:", error.message);
      throw error;
    }
  }
};
