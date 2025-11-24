export  class AdminUserPanelComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }


  resetearContenido() {
    const contentArea = this.shadowRoot.getElementById("content-area");
    if (contentArea) {
      contentArea.style.display = "block"; 
      contentArea.innerHTML = `
        <h2>Bienvenido, Administrador</h2>
        <p>Selecciona una opción para gestionar usuarios.</p>
      `;
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
<style>
*{
 font-family: "Raleway", Arial, sans-serif;
 }
  :host { display:block; max-width:1200px; margin:30px auto; background:white; padding:20px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.1);        }
  *, *::before, *::after { box-sizing:border-box; }
  h2,h3 { color:#0d47a1; text-align:center; margin-top:0; }
  p { text-align:center; color:#455a64; }
  .user-actions { display:flex; justify-content:center; flex-wrap:wrap; gap: 10px; margin-bottom:16px; }
  button { background-color: #1e355e; color: #ffffffff; border:none; padding:10px 16px; border-radius:6px; cursor:pointer; font-weight:500; transition:0.3s; }
  form { display:flex; flex-direction:column; gap:10px; background:#f9f9f9; padding:16px; border-radius:8px; }
  .input-group { position:relative; }
  input, select { padding:10px; border:1px solid #ccc; border-radius:4px; width:100%; font-size:14px; }
  .toggle-password { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; color:#1976d2; cursor:pointer; font-size:13px; font-weight:500; padding:0; }
  .user-message { text-align:center; font-weight:500; }
  .success { color:#2e7d32; }
  .error { color:#c62828; }
  @media (max-width:480px){ :host{padding:12px;} button{flex:1 1 100%;} }
</style>

<div id="content-area">
  <h2>Bienvenido, Administrador</h2>
  <p>Selecciona una opción para gestionar usuarios.</p>
</div>

<div class="user-actions">
  <button data-action="crear">Crear Usuario</button>
  <button data-action="cambiarClave">Cambiar Contraseña</button>
  <button data-action="desactivar">Desactivar Usuario</button>
<button type="button" data-action="cancelar">Cancelar</button>

</div>
        `;

    this.shadowRoot
      .querySelectorAll(".user-actions button")
      .forEach((btn) => {
        btn.addEventListener("click", (e) =>
          this.handleAction(e.target.dataset.action)
        );
      });
    this.shadowRoot.querySelectorAll('button[data-action="cancelar"]').forEach(btn => {
      btn.addEventListener("click", () => this.resetearContenido());
    });

  }

  handleAction(action) {
    const contentArea = this.shadowRoot.getElementById("content-area");

    if (action === "crear") {
      contentArea.innerHTML = `
<h3>Crear Usuario</h3>
<form id="crearUsuarioForm">
  <input maxlength="100" type="email" id="correo" placeholder="Correo electrónico" required>
  <div class="input-group">
    <input maxlength="100" type="password" id="password" placeholder="Contraseña" required>
    <button type="button" class="toggle-password" data-target="password">Mostrar</button>
  </div>
  <select id="idRol" required>
    <option value="">Seleccionar rol...</option>
    <option value="1">Administrador</option>
    <option value="2">Usuario</option>
  </select>
  <button type="submit">Registrar</button>

  <div id="crearUsuarioMsg" class="user-message"></div>
</form>`;
      this.shadowRoot
        .getElementById("crearUsuarioForm")
        .addEventListener("submit", (e) => this.crearUsuario(e));
      this.addTogglePassword();
    }

    if (action === "cambiarClave") {
      contentArea.innerHTML = `
<h3>Cambiar Contraseña</h3>
<form id="cambiarClaveForm">
  <input maxlength="100" type="email" id="correoUsuarioClave" placeholder="Correo del usuario" required>
  <div class="input-group">
    <input  maxlength="100" type="password" id="nuevaClave" placeholder="Nueva contraseña" required>
    <button type="button" class="toggle-password" data-target="nuevaClave">Mostrar</button>
  </div>
  <button type="submit">Actualizar</button>
  <div id="cambiarClaveMsg" class="user-message"></div>
</form>`;
      this.shadowRoot
        .getElementById("cambiarClaveForm")
        .addEventListener("submit", (e) => this.cambiarClave(e));
      this.addTogglePassword();
    }

    if (action === "desactivar") {
      contentArea.innerHTML = `
<h3>Desactivar Usuario</h3>
<form id="eliminarUsuarioForm">
  <input maxlength="100" type="email" id="correoUsuarioEliminar" placeholder="Correo del usuario" required>
  <button type="submit">Desactivar</button>
  <div id="eliminarUsuarioMsg" class="user-message"></div>
</form>`;
      this.shadowRoot
        .getElementById("eliminarUsuarioForm")
        .addEventListener("submit", (e) => this.desactivarUsuario(e));
    }
  }

  addTogglePassword() {
    this.shadowRoot
      .querySelectorAll(".toggle-password")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const input = this.shadowRoot.getElementById(
            btn.dataset.target
          );
          const isPassword = input.type === "password";
          input.type = isPassword ? "text" : "password";
          btn.textContent = isPassword ? "Ocultar" : "Mostrar";
        });
      });
  }

  async crearUsuario(e) {
    e.preventDefault();
    const correo = this.shadowRoot.getElementById("correo").value;
    const password = this.shadowRoot.getElementById("password").value;
    const idRol = parseInt(this.shadowRoot.getElementById("idRol").value);
    this.dispatchEvent(
      new CustomEvent("crear-usuario-request", {
        detail: { correo, password, idRol },
      })
    );
  }

  async cambiarClave(e) {
    e.preventDefault();
    const correo = this.shadowRoot
      .getElementById("correoUsuarioClave")
      .value.trim();
    const nuevaClave = this.shadowRoot.getElementById("nuevaClave").value;
    this.dispatchEvent(
      new CustomEvent("cambiar-clave-request", {
        detail: { correo, nuevaClave },
      })
    );
  }

  async desactivarUsuario(e) {
    e.preventDefault();
    const correo = this.shadowRoot
      .getElementById("correoUsuarioEliminar")
      .value.trim();
    this.dispatchEvent(
      new CustomEvent("desactivar-usuario-request", {
        detail: { correo },
      })
    );
  }
}

customElements.define("admin-user-panel", AdminUserPanelComponent);