// archivo: loginController.js
// ES Module

import { login } from '../services/authService.js';
import { solicitarCodigo, restablecerClave } from '../services/usuarioService.js';
import { cargarDatosUsuarios } from '../controllers/AdminUserController.js';
import { mostrarMensajeModal2, mostrarModalConInput } from '../util/juegoFunctionUtility.js';
import { CONFIG_JUEGO_PRODHAB } from '../juegosEnvironments.js';

export function inicializarLogin() {
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

  function recuperarCuenta() {
    mostrarModalConInput(
      "Recuperación de cuenta",
      "En caso de que no funcione, revise la documentación técnica para realizar el restablecimiento manual.",
      { type: "text", placeholder: "Correo electrónico" },
      (correoGlobal) => {
        solicitarCodigo(correoGlobal)
          .then(() => {
            mostrarMensajeModal2(
              "Correo enviado",
              "Te enviamos un código de verificación.",
              () => {
                mostrarModalConInput(
                  "Código de verificación",
                  "Ingresa el código enviado a tu correo:",
                  { type: "text", placeholder: "Código OTP" },
                  (codigoGlobal) => {
                    mostrarModalConInput(
                      "Nueva contraseña",
                      "Ingresa tu nueva contraseña:",
                      { type: "password", placeholder: "Nueva contraseña" },
                      (nuevaClaveGlobal) => {
                        restablecerClave(correoGlobal, codigoGlobal, nuevaClaveGlobal)
                          .then(() => {
                            mostrarMensajeModal2(
                              "Contraseña actualizada",
                              "Tu contraseña ha sido cambiada correctamente.",
                              false
                            );
                          })
                          .catch((err) => {
                            console.error(err);
                            mostrarMensajeModal2(
                              "Error",
                              err.message || "Ocurrió un problema. Verifica los datos e intenta nuevamente.",
                              false
                            );
                          });
                      }
                    );
                  }
                );
              }
            );
          })
          .catch((err) => {
            console.error(err);
            mostrarMensajeModal2(
              "Error",
              err.message || "No se pudo enviar el código de verificación.",
              false
            );
          });
      }
    );
  }

  async function controlarLogin(ev) {
    const loginCard = document.querySelector("login-card-component");
    const { email, password } = ev.detail;

    try {
      const exito = await login(email, password);

      if (exito) {
        const sesion = { autenticado: true, rol: exito.rol };
        sessionStorage.setItem("sesion_admin_juegos_prodhab", JSON.stringify(sesion));

        actualizarVista();

        let menuActual = [...menuBase];
        if (exito.rol.toLowerCase() !== "administrador") {
          menuActual = menuActual.filter(op => op.id !== "id-admin-juegos-sidenav-option1");
        }

        if (sideNav) sideNav.menuOptions = menuActual;

        const tablaUsuarioComponent = document.getElementById("tabla-usuario-component");

        await cargarDatosUsuarios(tablaUsuarioComponent);

        const testViewer = document.querySelector("test-viewer-component");
        if (testViewer) testViewer.onUserLogin();
      }

      if (sessionStorage.getItem("sesion_admin_juegos_prodhab")) {
        actualizarVista();
        loginCard.clearFields();
      }

    } catch (err) {
      const shadow = loginCard.shadowRoot;
      const errorDiv = shadow.getElementById("passwordError");
      errorDiv.textContent = "Credenciales incorrectas";
    }
  }

  document.addEventListener("recovery-event", recuperarCuenta);
  document.addEventListener("settings-event", () => {
    mostrarModalConInput(
      "Configuración del API",
      "Ingresa la nueva URL del API:",
      { type: "text", placeholder: CONFIG_JUEGO_PRODHAB.apiUrl },
      (nuevaUrl) => {
        if (nuevaUrl) {
          CONFIG_JUEGO_PRODHAB.setApiUrl(nuevaUrl);
          mostrarMensajeModal2(
            "URL actualizada",
            "La URL del API ahora es: " + CONFIG_JUEGO_PRODHAB.apiUrl,
            false
          );
        }
      }
    );
  });

  document.addEventListener("login-card-event", controlarLogin);

  // Si ya hay sesión guardada
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
}

