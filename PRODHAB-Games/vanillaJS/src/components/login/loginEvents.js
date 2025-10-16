(() => {
    // Todo lo que esté aquí dentro es privado
    const URL_ADMINISTRADOR =  CONFIG.routes.admin;
    const loginCard = document.querySelector("login-card-component");

    async function manejarLogin(ev) {
        const { email, password } = ev.detail;

        try {
            const exito = await AuthService.login(email, password);

            if (exito) {
                sessionStorage.setItem("sesion_admin_juegos_prodhab", "true");
                window.location.href = URL_ADMINISTRADOR;
            }

            if (sessionStorage.getItem("sesion_admin_juegos_prodhab")) {
                window.location.href = URL_ADMINISTRADOR;
            }
        } catch (err) {
            const shadow = loginCard.shadowRoot;
            const errorDiv = shadow.getElementById("passwordError");
            errorDiv.textContent = "Credenciales incorrectas";
        }
    }

    document.addEventListener("login", manejarLogin);
    if (sessionStorage.getItem("sesion_admin_juegos_prodhab")) {
        window.location.href = URL_ADMINISTRADOR;
    }
})(); 
