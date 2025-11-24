// archivo: adminUserPanelController.js
// ES Module

import { cambiarClave, crearUsuario, desactivarUsuario } from '../services/usuarioService.js';
import { mostrarMensajeModal } from '../util/juegoFunctionUtility.js'

export function inicializarAdminUserPanel() {
  const panel = document.querySelector("admin-user-panel");

  if (!panel) return;

  // Crear usuario
  panel.addEventListener("crear-usuario-request", async (e) => {
    try {
      const result = await crearUsuario(e.detail);
      if (result) {
        mostrarMensajeModal("Mensaje", "Usuario creado exitósamente.", false);
      }
    } catch (err) {
      mostrarMensajeModal("Mensaje", err.message, false);
    }
  });

  // Cambiar clave
  panel.addEventListener("cambiar-clave-request", async (e) => {
    try {
      const { correo, nuevaClave } = e.detail;
      const result = await cambiarClave(correo, nuevaClave);
      if (result) {
        mostrarMensajeModal("Mensaje", "Contraseña actualizada exitósamente.", false);
        panel.resetearContenido();
      }
    } catch (err) {
      mostrarMensajeModal("Mensaje", err.message, false);
    }
  });

  // Desactivar usuario
  panel.addEventListener("desactivar-usuario-request", async (e) => {
    try {
      const { correo } = e.detail;
      const result = await desactivarUsuario(correo);
      if (result) {
        mostrarMensajeModal("Mensaje", "Cuenta ha sido desactivada.", false);
        panel.resetearContenido();
      }
    } catch (err) {
      mostrarMensajeModal("Mensaje", err.message, false);
    }
  });
}
