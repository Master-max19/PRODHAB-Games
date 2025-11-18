(() => {

    const sidenav = document.querySelector("#admin-side-nav-menu");

    sidenav.addEventListener("irATest", (e) => {
        window.prodhab_juegos.crearTablaDinamica(
            1,
            "id-admin-juegos-sidenav-option2",
            "Administrar Test"
        );
    });

    sidenav.addEventListener("irAOrdenar", (e) => {
        window.prodhab_juegos.crearTablaDinamica(
            2,
            "id-admin-juegos-sidenav-option3",
            "Ordenar palabras"
        );
    });

    sidenav.addEventListener("irACompletar", (e) => {
        window.prodhab_juegos.crearTablaDinamica(
            3,
            "id-admin-juegos-sidenav-option4",
            "Completar texto"
        );
    });

    sidenav.addEventListener("irASopa", (e) => {
        window.prodhab_juegos.crearTablaDinamica(
            4,
            "id-admin-juegos-sidenav-option5",
            "Sopa de letras"
        );
    });

    sidenav.addEventListener("logout", async () => {
        sessionStorage.removeItem("sesion_admin_juegos_prodhab");

        try {
            const exito = await authService.logout();
            if (!exito) console.warn("No se pudo cerrar sesión en el servidor");
        } catch (err) {
            console.error("Error en logout:", err);
        }
        const fondoLogin = document.querySelector(".fondo-login");
        const sideNav = document.querySelector("side-nav-component");

        if (fondoLogin && sideNav) {
            fondoLogin.style.display = "block";
            sideNav.style.display = "none";
        }
        sidenav.navigate("#/inicio");
    });

    sidenav.navigate("#/inicio");

})();