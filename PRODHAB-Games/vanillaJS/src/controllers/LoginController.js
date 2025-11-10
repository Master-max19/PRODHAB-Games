(() => {
    const fondoLogin = document.querySelector(".fondo-login");
    const sideNav = document.querySelector("side-nav-component");

    const menuBase = [
        { id: "id-admin-juegos-sidenav-option0", title: "Inicio", path: "#/inicio", event: "irAInicio" },
        { id: "id-admin-juegos-sidenav-option1", title: "Administrar usuarios", path: "#/html", event: "irAUsuario" },
        { id: "id-admin-juegos-sidenav-option2", title: "Administrar test", path: "#/admin", event: "irATest" },
        { id: "id-admin-juegos-sidenav-option3", title: "Ordenar palabras", path: "#/ordenar", event: "irAOrdenar" },
        { id: "id-admin-juegos-sidenav-option4", title: "Administrar completar texto", path: "#/completar", event: "irACompletar" },
        { id: "id-admin-juegos-sidenav-option5", title: "Administrar sopa de letras", path: "#/sopa", event: "irASopa" },
        { type: "button", title: "Cerrar sesión", event: "logout" },
    ];
    if (sideNav) sideNav.menuOptions = [{ id: "id-admin-juegos-sidenav-option0", title: "Inicio", path: "#/inicio", event: "irAInicio" }];

    function actualizarVista() {
        if (sideNav && fondoLogin) {
            fondoLogin.style.display = "none";
            sideNav.style.display = "block";
        }
    }

    async function controlarLogin(ev) {
        const loginCard = document.querySelector("login-card-component");

        const { email, password } = ev.detail;

        try {
            const exito = await AuthService.login(email, password);

            if (exito) {
                const sesion = {
                    autenticado: true,
                    rol: exito.rol
                };

                sessionStorage.setItem("sesion_admin_juegos_prodhab", JSON.stringify(sesion));

                actualizarVista();

                let menuActual = [...menuBase];
                if (exito.rol.toLowerCase() !== "administrador") {
                    menuActual = menuActual.filter(op => op.id !== "id-admin-juegos-sidenav-option1");
                }

                if (sideNav) sideNav.menuOptions = menuActual;

                await TablaUsuariosController.cargarDatos();

                const testViewer = document.querySelector("test-viewer-component");
                if (testViewer) testViewer.onUserLogin();
            }

            if (sessionStorage.getItem("sesion_admin_juegos_prodhab")) {
                actualizarVista();
                loginCard.clearFields()

            }

        } catch (err) {
            const shadow = loginCard.shadowRoot;
            const errorDiv = shadow.getElementById("passwordError");
            errorDiv.textContent = "Credenciales incorrectas";
        }
    }

    document.addEventListener("login-card-event", controlarLogin);

    const sesionGuardada = sessionStorage.getItem("sesion_admin_juegos_prodhab");
    if (sesionGuardada) {
        const sesion = JSON.parse(sesionGuardada);
        let menuActual = [...menuBase];
        if (sesion.rol.toLowerCase() !== "administrador") {
            menuActual = menuActual.filter(op => op.id !== "id-admin-juegos-sidenav-option1");
        }
        if (sideNav) sideNav.menuOptions = menuActual;
        actualizarVista();
    }
})();
