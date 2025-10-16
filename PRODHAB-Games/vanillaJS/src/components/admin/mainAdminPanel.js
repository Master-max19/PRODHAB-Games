const panel = document.querySelector("admin-user-panel");

panel.addEventListener("crear-usuario-request", async (e) => {
    try {
        const result = await UsuarioService.crearUsuario(e.detail);
        console.log("Usuario creado:", result);
    } catch (err) {
        console.error("Error:", err.message);
    }
});

panel.addEventListener("cambiar-clave-request", async (e) => {
    try {
        const { correo, nuevaClave } = e.detail;
        const result = await AuthService.cambiarClave(correo, nuevaClave);
        console.log("Contraseña cambiada:", result);
        panel.resetearContenido();
    } catch (err) {
        console.error("Error:", err.message);
    }
});

panel.addEventListener("desactivar-usuario-request", async (e) => {
    try {
        const { correo } = e.detail;
        const result = await UsuarioService.desactivarUsuario(correo);
        console.log("Usuario desactivado:", result);
        panel.resetearContenido();

    } catch (err) {
        console.error("Error:", err.message);
    }
});
