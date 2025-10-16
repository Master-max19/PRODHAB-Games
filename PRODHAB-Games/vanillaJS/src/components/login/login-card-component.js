class LoginCardComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { 
          --accent: #4f46e5; 
          display: block; 
          font-family: Raleway, sans-serif; 
          width: 100%; 
          height: 100%;
          box-sizing: border-box;
        }
        .wrap { 
          width: 100%; 
          height: 100%;
          display: flex; 
          justify-content: center; 
          align-items: center; 
        }
        .card { 
          width: 100%; 
          max-width: 360px; 
          background: #fff; 
          border-radius: 12px; 
          box-shadow: 0 6px 20px rgba(0,0,0,0.2); 
          padding: 24px; 
          box-sizing: border-box; 
        }
        h1 { 
          text-align: center; 
          font-size: 1.3rem; 
          margin-bottom: 20px; 
          color: #333; 
        }
        .form-field { 
          position: relative; 
          margin-bottom: 16px; 
        }
        label { 
          display: block; 
          margin-bottom: 6px; 
          color: #444; 
          font-size: 0.9rem; 
        }
        input { 
          width: 100%; 
          padding: 10px 80px 10px 12px;
          border-radius: 8px; 
          border: 1px solid #ddd; 
          font-size: 0.95rem; 
          box-sizing: border-box; 
          height: 40px;
        }
        input:focus { 
          border-color: var(--accent); 
          outline: none; 
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1); 
        }
        .password-container { 
          position: relative;
          display: flex;
          align-items: center;
        }
        .show-pass { 
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none; 
          border: none; 
          cursor: pointer; 
          font-size: 0.9rem; 
          color: #555; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          height: 40px; 
          width: 60px; 
          padding: 6px 12px; 
          border-radius: 6px; 
          font-weight: 600;
        }
        button.btn { 
          width: 100%; 
          background: var(--accent); 
          color: #fff; 
          border: none; 
          padding: 10px; 
          border-radius: 8px; 
          font-weight: 600; 
          cursor: pointer; 
          font-size: 1rem; 
          margin-top: 8px; 
        }
        button.btn:hover { 
          background: #3728b9; 
        }
        .recover { 
          text-align: center; 
          margin-top: 12px; 
        }
        .recover a { 
          color: var(--accent); 
          text-decoration: none; 
          font-size: 0.9rem; 
        }
        .recover a:hover { 
          text-decoration: underline; 
        }
        .password-error { 
          color: red; 
          font-size: 0.8rem; 
          margin-top: 5px; 
        }
        @media (max-width: 480px) { 
          .card { 
            padding: 16px; 
            max-width: 90%; 
          }
          input, button.btn { 
            font-size: 0.9rem; 
          }
          .show-pass {
            font-size: 0.8rem;
            width: 50px; 
            padding: 6px 8px; 
          }
        }
      </style>

      <div class="wrap">
        <div class="card">
          <h1>Iniciar sesión</h1>
          <form id="form">
            <div class="form-field">
              <label for="email">Correo</label>
              <input id="email" type="email" required />
            </div>

            <label for="password">Contraseña</label>
            <div class="form-field password-container">
              <input id="password" type="password" required />
              <button type="button" class="show-pass" id="togglePass">Mostrar</button>
            </div>

            <div id="passwordError" class="password-error"></div>

            <button type="submit" class="btn">Entrar</button>
            <div class="recover"><a href="#">¿Olvidaste tu contraseña?</a></div>
          </form>
        </div>
      </div>
    `;

    // Referencias
    this._form = this.shadowRoot.getElementById('form');
    this._email = this.shadowRoot.getElementById('email');
    this._password = this.shadowRoot.getElementById('password');
    this._togglePass = this.shadowRoot.getElementById('togglePass');
    this._passwordError = this.shadowRoot.getElementById('passwordError');

    // Enlazar métodos
    this._onSubmit = this._onSubmit.bind(this);
    this._onTogglePass = this._onTogglePass.bind(this);
    this._onPasswordInput = this._onPasswordInput.bind(this);
  }

  connectedCallback() {
    this._form.addEventListener('submit', this._onSubmit);
    this._togglePass.addEventListener('click', this._onTogglePass);
    this._password.addEventListener('input', this._onPasswordInput);
  }

  disconnectedCallback() {
    this._form.removeEventListener('submit', this._onSubmit);
    this._togglePass.removeEventListener('click', this._onTogglePass);
    this._password.removeEventListener('input', this._onPasswordInput);
  }

  _onTogglePass() {
    const input = this._password;
    input.type = input.type === 'password' ? 'text' : 'password';
    this._togglePass.textContent = input.type === 'password' ? 'Mostrar' : 'Ocultar';
  }

  _onSubmit(e) {
    e.preventDefault();
    const email = this._email.value.trim();
    const password = this._password.value.trim();

    if (!email || !password) {
      this._passwordError.textContent = 'Por favor, completa ambos campos.';
      return;
    }

    // Limpia mensaje de error previo
    this._passwordError.textContent = '';

    // Lanza evento personalizado
    this.dispatchEvent(
      new CustomEvent('login', {
        detail: { email, password },
        bubbles: true,
        composed: true,
      })
    );
  }

  _onPasswordInput() {
    const password = this._password.value.trim();

    // ✅ Corregido: antes tenías "password.length < 0"
    if (password.length === 0) {
      this._passwordError.textContent = 'Por favor, ingrese la contraseña.';
    } else {
      this._passwordError.textContent = '';
    }
  }

  showError(message) {
    this._passwordError.textContent = message;
  }
}

customElements.define('login-card-component', LoginCardComponent);
