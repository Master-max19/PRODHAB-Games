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
  btn.addEventListener("click", async () => {
    const section = btn.dataset.section;

    switch (section) {
      case "usuarios":
        contentArea.innerHTML = `
    <div class="user-section">
      <h2>Gestión de Usuarios</h2>
      <div class="user-actions">
        <button id="crearUsuarioBtn">Crear Usuario</button>
        <button id="cambiarClaveBtn">Cambiar Contraseña</button>
        <button id="eliminarUsuarioBtn">Desactivar Usuario</button>
      </div>
      <div id="userFormArea"></div>
    </div>
  `;

        // 🔹 Crear Usuario
        document.getElementById("crearUsuarioBtn").addEventListener("click", () => {
          document.getElementById("userFormArea").innerHTML = `
      <form id="crearUsuarioForm" class="user-form">
        <h3>Crear Usuario</h3>
        <input type="email" id="correo" placeholder="Correo electrónico" required />
        <input type="password" id="password" placeholder="Contraseña" required />
        <select id="rolId" required>
          <option value="">Seleccionar rol...</option>
          <option value="1">Administrador</option>
          <option value="2">Usuario</option>
        </select>
        <button type="submit">Registrar</button>
        <div id="crearUsuarioMsg" class="user-message"></div>
      </form>
    `;

          document.getElementById("crearUsuarioForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const correo = document.getElementById("correo").value;
            const password = document.getElementById("password").value;
            const rolId = parseInt(document.getElementById("rolId").value);

            try {
              const res = await fetch("https://localhost:5133/api/usuarios/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ correo, password, rolId, activo: true })
              });

              const data = await res.json();
              const msg = document.getElementById("crearUsuarioMsg");
              msg.textContent = data.message || "Usuario creado";
              msg.className = "user-message success";
            } catch {
              const msg = document.getElementById("crearUsuarioMsg");
              msg.textContent = "Error al crear usuario";
              msg.className = "user-message error";
            }
          });
        });

        // 🔹 Cambiar Contraseña
        document.getElementById("cambiarClaveBtn").addEventListener("click", () => {
          document.getElementById("userFormArea").innerHTML = `
      <form id="cambiarClaveForm" class="user-form">
        <h3>Cambiar Contraseña</h3>
        <input type="email" id="correoUsuarioClave" placeholder="Correo del usuario" required />
        <input type="password" id="nuevaClave" placeholder="Nueva contraseña" required />
        <button type="submit">Actualizar</button>
        <div id="cambiarClaveMsg" class="user-message"></div>
      </form>
    `;

          document.getElementById("cambiarClaveForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const correo = document.getElementById("correoUsuarioClave").value.trim();
            const nuevaClave = document.getElementById("nuevaClave").value;

            try {
              const res = await fetch(`https://localhost:5133/api/usuarios/actualizar-clave/${encodeURIComponent(correo)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ NuevaClave: nuevaClave })
              });

              const data = await res.json();
              const msg = document.getElementById("cambiarClaveMsg");
              msg.textContent = data.message || "Clave actualizada";
              msg.className = "user-message success";
            } catch {
              const msg = document.getElementById("cambiarClaveMsg");
              msg.textContent = "Error de conexión al actualizar clave";
              msg.className = "user-message error";
            }
          });
        });

        // 🔹 Desactivar Usuario
        document.getElementById("eliminarUsuarioBtn").addEventListener("click", () => {
          document.getElementById("userFormArea").innerHTML = `
      <form id="eliminarUsuarioForm" class="user-form">
        <h3>Desactivar Usuario</h3>
        <input type="email" id="correoUsuarioEliminar" placeholder="Correo del usuario" required />
        <button type="submit">Desactivar</button>
        <div id="eliminarUsuarioMsg" class="user-message"></div>
      </form>
    `;

          document.getElementById("eliminarUsuarioForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const correo = document.getElementById("correoUsuarioEliminar").value.trim();

            try {
              const res = await fetch(`https://localhost:5133/api/usuarios/desactivar/${encodeURIComponent(correo)}`, {
                method: "PUT",
                credentials: "include"
              });

              const msg = document.getElementById("eliminarUsuarioMsg");
              const data = await res.json();
              msg.textContent = data.message || "Usuario desactivado correctamente";
              msg.className = res.ok ? "user-message success" : "user-message error";
            } catch {
              const msg = document.getElementById("eliminarUsuarioMsg");
              msg.textContent = "Error de conexión al desactivar usuario";
              msg.className = "user-message error";
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
        contentArea.innerHTML = "<h2>Cerrando sesión...</h2>";

        try {
          // 🔹 Llama al backend para borrar la cookie JWT
          const res = await fetch("https://localhost:5133/api/Auth/logout", {
            method: "POST",
            credentials: "include"
          });

          if (res.ok) {
            const data = await res.json();
            console.log(data.message || "Logout exitoso");
          } else {
            console.warn("El servidor no confirmó el cierre de sesión");
          }
        } catch (err) {
          console.error("Error al cerrar sesión:", err);
        }
        contentArea.innerHTML = `
          <h2>Cerrando sesión...</h2>
          <p>Por favor espera un momento...</p>
        `;
        // 🔹 Redirige después de 1 segundo
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        break;

      default:
        contentArea.innerHTML = "<h2>Bienvenido, Admin</h2><p>Selecciona una opción.</p>";
    }
  });
});
