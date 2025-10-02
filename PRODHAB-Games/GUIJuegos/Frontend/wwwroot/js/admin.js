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
        contentArea.innerHTML = `
    <h2>Gestión de Usuarios</h2>
    <div class="user-actions">
      <button id="crearUsuarioBtn">Crear Usuario</button>
      <button id="cambiarClaveBtn">Cambiar Contraseña</button>
      <button id="eliminarUsuarioBtn">Eliminar Usuario</button>
    </div>
    <div id="userFormArea"></div>
  `;

        // 🔹 Crear Usuario
        document.getElementById("crearUsuarioBtn").addEventListener("click", () => {
          document.getElementById("userFormArea").innerHTML = `
      <h3>Crear Usuario</h3>
      <form id="crearUsuarioForm">
        <input type="email" id="correo" placeholder="Correo" required /><br>
        <input type="password" id="password" placeholder="Contraseña" required /><br>
        <select id="rolId" required>
          <option value="1">Admin</option>
          <option value="2">Usuario</option>
        </select><br>
        <button type="submit">Registrar</button>
      </form>
      <div id="crearUsuarioMsg"></div>
    `;

          document.getElementById("crearUsuarioForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const correo = document.getElementById("correo").value;
            const password = document.getElementById("password").value;
            const rolId = parseInt(document.getElementById("rolId").value);

            try {
              const res = await fetch("https://localhost:7006/api/usuarios/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ correo, password, rolId, activo: true })
              });

              const data = await res.json();
              document.getElementById("crearUsuarioMsg").textContent = data.message || "Usuario creado";
            } catch (err) {
              document.getElementById("crearUsuarioMsg").textContent = "Error al crear usuario";
            }
          });
        });

        // 🔹 Cambiar Contraseña
        document.getElementById("cambiarClaveBtn").addEventListener("click", () => {
          document.getElementById("userFormArea").innerHTML = `
      <h3>Cambiar Contraseña</h3>
      <form id="cambiarClaveForm">
        <input type="number" id="idUsuarioClave" placeholder="ID Usuario" required /><br>
        <input type="password" id="nuevaClave" placeholder="Nueva Contraseña" required /><br>
        <button type="submit">Actualizar</button>
      </form>
      <div id="cambiarClaveMsg"></div>
    `;

          document.getElementById("cambiarClaveForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("idUsuarioClave").value;
            const nuevaClave = document.getElementById("nuevaClave").value;

            try {
              const res = await fetch(`https://localhost:7006/api/usuarios/actualizar-clave/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({NuevaClave: nuevaClave })
              });

              const data = await res.json();
              document.getElementById("cambiarClaveMsg").textContent = data.message || "Clave actualizada";
            } catch (err) {
              document.getElementById("cambiarClaveMsg").textContent = "Error al actualizar clave";
            }
          });
        });

        // 🔹 Eliminar Usuario (desactivar)
        document.getElementById("eliminarUsuarioBtn").addEventListener("click", () => {
          document.getElementById("userFormArea").innerHTML = `
      <h3>Eliminar Usuario</h3>
      <form id="eliminarUsuarioForm">
        <input type="number" id="idUsuarioEliminar" placeholder="ID Usuario" required /><br>
        <button type="submit">Desactivar</button>
      </form>
      <div id="eliminarUsuarioMsg"></div>
    `;

          document.getElementById("eliminarUsuarioForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("idUsuarioEliminar").value;

            try {
              const res = await fetch(`https://localhost:7006/api/usuarios/desactivar/${id}`, {
                method: "PUT",
                credentials: "include"
              });

              const data = await res.json();
              document.getElementById("eliminarUsuarioMsg").textContent = data.message || "Usuario desactivado";
            } catch (err) {
              document.getElementById("eliminarUsuarioMsg").textContent = "Error al desactivar usuario";
            }
          });
        });
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
