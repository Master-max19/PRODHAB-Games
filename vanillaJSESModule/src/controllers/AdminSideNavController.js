// archivo: modules/admin-sidenav.js
// ES Module

import { crearTablaDinamica } from "./AdminJuegosController.js";
import { logout as authLogout } from "../services/authService.js"; // ajusta según tu path real

export function inicializarSidenav() {
  const sidenav = document.querySelector("#admin-side-nav-menu");
  if (!sidenav) return;

  sidenav.addEventListener("irATest", () => {
    crearTablaDinamica(1, "id-admin-juegos-sidenav-option2", "Administrar Test");
  });

  sidenav.addEventListener("irAOrdenar", () => {
    crearTablaDinamica(2, "id-admin-juegos-sidenav-option3", "Ordenar palabras");
  });

  sidenav.addEventListener("irACompletar", () => {
    crearTablaDinamica(3, "id-admin-juegos-sidenav-option4", "Completar texto");
  });

  sidenav.addEventListener("irASopa", () => {
    crearTablaDinamica(4, "id-admin-juegos-sidenav-option5", "Sopa de letras");
  });

  sidenav.addEventListener("logout", async () => {
    sessionStorage.removeItem("sesion_admin_juegos_prodhab");

    try {
      const exito = await authLogout();
      if (!exito) console.warn("No se pudo cerrar sesión en el servidor");
    } catch (err) {
      console.error("Error en logout:", err);
    }

    const fondoLogin = document.querySelector(".fondo-login");
    const sideNav = document.querySelector("side-nav-component");

    if (fondoLogin) fondoLogin.style.display = "block";
    if (sideNav) sideNav.style.display = "none";

    sidenav.navigate("#/inicio");
  });

  // Inicializar vista predeterminada
  sidenav.navigate("#/inicio");
}
