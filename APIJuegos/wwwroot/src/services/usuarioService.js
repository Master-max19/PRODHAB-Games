import { CONFIG_JUEGO_PRODHAB } from "../juegosEnvironments.js";
import { apiFetch } from "../util/juegoFunctionUtility.js";


export async function obtenerUsuarios() {
  try {
    const sesionStr = sessionStorage.getItem("sesion_admin_juegos_prodhab");
    if (!sesionStr) return [];

    const sesionObj = JSON.parse(sesionStr);
    const rol = (sesionObj.rol || "").toLowerCase();

    if (rol !== "administrador") return [];

    const data = await apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/usuario`);
    if (!data) return [];

    return data.map(item => ({
      correo: item.correo,
      estado: item.estado ? "Activo" : "Inactivo",
      rol: (item.rol || "").toLowerCase(),
      fechaCreacion: new Date(item.fechaCreacion).toLocaleDateString(),
    }));
  } catch (error) {
    console.error("Error fetching usuarios:", error);
    return [];
  }
}

export async function eliminarUsuario(correo) {
  try {
    await apiFetch(
      `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/usuario/${encodeURIComponent(correo)}`,
      { method: "DELETE" }
    );
    return true;
  } catch (error) {
    console.error("Error eliminar usuario:", error);
    return false;
  }
}

export async function crearUsuario({ correo, password, idRol, activo = true }) {
  try {
    return await apiFetch(
      `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/usuario/register`,
      {
        method: "POST",
        body: JSON.stringify({ correo, password, idRol: Number(idRol), activo }),
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error crear usuario:", error.message);
    throw error;
  }
}

export async function desactivarUsuario(correo) {
  try {
    return await apiFetch(
      `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/usuario/desactivar/${encodeURIComponent(correo)}`,
      { method: "PUT" }
    );
  } catch (error) {
    console.error("Error desactivar usuario:", error.message);
    throw error;
  }
}

export async function cambiarClave(correo, nuevaClave) {
  try {
    return await apiFetch(
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

export async function solicitarCodigo(correo) {
  try {
    const res = await fetch(
      `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/usuario/solicitar/${encodeURIComponent(correo)}`,
      { method: "POST" }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || "Error solicitando código");

    return data;
  } catch (error) {
    console.error("Error solicitando código:", error);
    throw error;
  }
}

export async function restablecerClave(correo, codigo, nuevaClave) {
  try {
    const res = await fetch(
      `${CONFIG_JUEGO_PRODHAB.apiUrl}/api/usuario/restablecer`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Correo: correo, Codigo: codigo, NuevaClave: nuevaClave })
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || "Error restableciendo contraseña");

    return data;
  } catch (error) {
    console.error("Error restableciendo contraseña:", error);
    throw error;
  }
}
