const AuthService = {
  async login(username, password) {
    try {
      const res = await fetch(`${CONFIG.apiUrl}/api/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Credenciales inválidas");
      return await res.json();
    } catch (error) {
      console.error("Error iniciando sesión:", error);
      throw error;
    }
  },

  async logout() {
    try {
      await apiFetch(`${CONFIG.apiUrl}/api/Auth/logout`, {
        method: "POST"
      });
      return true;
    } catch (error) {
      console.error("Error cerrando sesión:", error);
      return false;
    }
  },

  async cambiarClave(correo, nuevaClave) {
    try {
      return await apiFetch(
        `${CONFIG.apiUrl}/api/Usuarios/actualizar-clave/${encodeURIComponent(correo)}`,
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
