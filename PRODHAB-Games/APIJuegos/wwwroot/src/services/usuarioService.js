const usuarioService = (() => {
  async function obtenerUsuarios() {
    try {
      const sesionStr = sessionStorage.getItem("sesion_admin_juegos_prodhab");
      if (!sesionStr) return [];

      const sesionObj = JSON.parse(sesionStr);
      const rol = (sesionObj.rol || "").toLowerCase(); // convertimos a minúsculas

      if (rol !== "administrador") return []; // comparamos en minúsculas

      const data = await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/usuario`);
      if (!data) return [];

      return data.map(item => ({
        correo: item.correo,
        estado: item.estado ? "Activo" : "Inactivo",
        rol: (item.rol || "").toLowerCase(), // opcional: también normalizamos los roles de los usuarios
        fechaCreacion: new Date(item.fechaCreacion).toLocaleDateString(),
      }));
    } catch (error) {
      console.error("Error fetching usuarios:", error);
      return [];
    }
  }

  async function eliminarUsuario(correo) {
    try {
      await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/usuario/${encodeURIComponent(correo)}`, {
        method: "DELETE"
      });
      return true;
    } catch (error) {
      console.error("Error eliminar usuario:", error);
      return false;
    }
  }

  async function crearUsuario({ correo, password, idRol, activo = true }) {
    try {
      return await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/usuario/register`, {
        method: "POST",
        body: JSON.stringify({ correo, password, idRol: Number(idRol), activo }),
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error crear usuario:", error.message);
      throw error;
    }
  }

  async function desactivarUsuario(correo) {
    try {
      return await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/usuario/desactivar/${encodeURIComponent(correo)}`, {
        method: "PUT"
      });
    } catch (error) {
      console.error("Error desactivar usuario:", error.message);
      throw error;
    }
  }

  async function cambiarClave(correo, nuevaClave) {
    try {
      return await utilFetch.apiFetch(
        `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/usuario/actualizar-clave/${encodeURIComponent(correo)}`,
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


  async function solicitarCodigo(correo) {
    try {
      const res = await fetch(
        `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/usuario/solicitar/${encodeURIComponent(correo)}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.mensaje || "Error solicitando código");

      return data; // { mensaje: "Código enviado exitosamente" }
    } catch (error) {
      console.error("Error solicitando código:", error);
      throw error;
    }
  }

  async function restablecerClave(correo, codigo, nuevaClave) {
    try {
      const res = await fetch(
        `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/usuario/restablecer`,
        {
          method: "POST", // ⚠️ tu backend usa POST, no PUT
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Correo: correo, Codigo: codigo, NuevaClave: nuevaClave })
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.mensaje || "Error restableciendo contraseña");

      return data; // { mensaje: "Contraseña actualizada correctamente" }
    } catch (error) {
      console.error("Error restableciendo contraseña:", error);
      throw error;
    }
  }

  return { obtenerUsuarios, eliminarUsuario, crearUsuario, desactivarUsuario, cambiarClave, solicitarCodigo, restablecerClave }

})();