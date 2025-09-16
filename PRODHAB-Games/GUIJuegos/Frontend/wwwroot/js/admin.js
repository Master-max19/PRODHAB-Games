import { getAdminData } from "./auth-service.js";

const out = document.getElementById("adminOut");
const show = (v) => out.textContent = typeof v === "string" ? v : JSON.stringify(v, null, 2);

(async () => {
  try {
    //const data = await getAdminData();
    //show(data);
  } catch (err) {
    alert("Acceso denegado o sesión expirada");
    window.location.href = "/Login";
  }
})();

// Simula la carga de contenido dinámico en el área central
const contentArea = document.getElementById("content-area");

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const section = btn.dataset.section;

    switch (section) {
      case "usuarios":
        contentArea.innerHTML = "<h2>Registrar Usuarios</h2><p>Aquí irá el formulario para crear usuarios.</p>";
        break;
      case "agregar":
        contentArea.innerHTML = "<h2>Agregar Pregunta</h2><p>Formulario para agregar una nueva pregunta.</p>";
        break;
      case "modificar":
        contentArea.innerHTML = "<h2>Modificar Preguntas/Respuestas</h2><p>Listado para seleccionar y editar.</p>";
        break;
      case "logout":
        contentArea.innerHTML = "<h2>Cerrando Sesión...</h2>";
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        break;
      default:
        contentArea.innerHTML = "<h2>Bienvenido, Admin</h2><p>Selecciona una opción.</p>";
    }
  });
});
