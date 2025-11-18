/**
 * ==============================
 * Variables / objetos globales externos
 * ==============================
 */

/**
 * @element admin-user-panel
 * @description Componente del panel de administración de usuarios
 */

/**
 * ==============================
 * Servicios / funciones externas
 * ==============================
 */

/**
 * @function usuarioService.crearUsuario
 * @async
 * @description Crea un nuevo usuario en el backend
 */

/**
 * @function usuarioService.cambiarClave
 * @async
 * @description Cambia la contraseña de un usuario existente en el backend
 */

/**
 * @function usuarioService.desactivarUsuario
 * @async
 * @description Desactiva la cuenta de un usuario en el backend
 */

/**
 * @function utilModalJuegos.mostrarMensajeModal
 * @description Muestra un modal con mensaje o confirmación al usuario
 */



(() => {

    const panel = document.querySelector("admin-user-panel");

    if (panel) {
        panel.addEventListener("crear-usuario-request", async (e) => {
            try {
                const result = await usuarioService.crearUsuario(e.detail);
                if (result) {
                    utilModalJuegos.mostrarMensajeModal("Mensaje", "Usuario creado exitósamente.", false);
                }
            } catch (err) {
                utilModalJuegos.mostrarMensajeModal("Mensaje", err.message, false)
            }
        });

        panel.addEventListener("cambiar-clave-request", async (e) => {
            try {
                const { correo, nuevaClave } = e.detail;
                const result = await usuarioService.cambiarClave(correo, nuevaClave);
                if (result) {
                    utilModalJuegos.mostrarMensajeModal("Mensaje", "Contraseña actualizada exitósamente.", false)
                    panel.resetearContenido();
                }
            } catch (err) {
                utilModalJuegos.mostrarMensajeModal("Mensaje", err.message, false)
            }
        });

        panel.addEventListener("desactivar-usuario-request", async (e) => {
            try {
                const { correo } = e.detail;
                const result = await usuarioService.desactivarUsuario(correo);
                if (result) {
                    utilModalJuegos.mostrarMensajeModal("Mensaje", "Cuenta ha sido desactivada.", false)
                    panel.resetearContenido();
                }
            } catch (err) {
                utilModalJuegos.mostrarMensajeModal("Mensaje", err.message, false)
            }
        });
    }
})();