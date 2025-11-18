const authService = (() => {

  async function login(username, password) {
    try {
      const res = await fetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Auth/login`, {
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
  }

  async function logout() {
    try {
      await fetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/Auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      return true;
    } catch (error) {
      console.error("Error cerrando sesión:", error);
      return false;
    }
  }

  // 👇 Exponemos solo lo necesario (protege el scope)
  return { login, logout };

})();
