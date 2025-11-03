class ModalComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this._confirmListener = null; // Listener para confirmación

    this.shadowRoot.innerHTML = `
      <style>
        :host { font-family: "Raleway", Arial, sans-serif; }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          z-index: 2000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          padding-top: 40px;
        }
        .modal-overlay.active { opacity: 1; visibility: visible; }
        .modal-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          width: 90%; max-width: 500px; max-height: 90vh;
          display: flex; flex-direction: column;
          transform: translateY(-20px);
          transition: transform 0.3s ease;
          margin-top: 60px;
        }
        .modal-overlay.active .modal-container { transform: translateY(0); }
        .modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 0; line-height: 1; }
        .modal-content { padding: 20px; overflow-y: auto; flex-grow: 1; }
        .modal-footer {
          padding: 16px 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .modal-btn { padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s ease; }
        .modal-cancel-btn { background-color: #f5f5f5; border: 1px solid #ddd; color: #333; }
        .modal-cancel-btn:hover { background-color: #e9e9e9; }
        .modal-confirm-btn { background-color: #1f4388; border: 1px solid #6200ee; color: white; }
        .modal-confirm-btn:hover { background-color: #3700b3; border-color: #3700b3; }
      </style>

      <div class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 id="modal-title">Título</h3>
            <button class="modal-close-btn" id="modal-close">&times;</button>
          </div>
          <div id="modal-content" class="modal-content">Contenido del modal</div>
          <div class="modal-footer">
            <button id="modal-cancel-btn" class="modal-btn modal-cancel-btn">Cancelar</button>
            <button id="modal-confirm-btn" class="modal-btn modal-confirm-btn">Confirmar</button>
          </div>
        </div>
      </div>
    `;

    this.overlay = this.shadowRoot.querySelector(".modal-overlay");
    this.titleEl = this.shadowRoot.querySelector("#modal-title");
    this.contentEl = this.shadowRoot.querySelector("#modal-content");

    const confirmBtn = this.shadowRoot.getElementById("modal-confirm-btn");
    const cancelBtn = this.shadowRoot.getElementById("modal-cancel-btn");
    const closeBtn = this.shadowRoot.getElementById("modal-close");

    // Botones
    closeBtn.addEventListener("click", () => this.close());
    cancelBtn.addEventListener("click", () => this._handleCancel());
    confirmBtn.addEventListener("click", () => this._handleConfirm());

    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });
  }

  // Manejo interno de confirm y cancelar
  _handleConfirm() {
    if (this._confirmListener) this._confirmListener();
    this.close();
  }

  _handleCancel() {
    this.close();
  }

  /**
   * Abre el modal
   * @param {Object} options
   *  - title: título
   *  - content: contenido
   *  - confirm: si mostrar botones Confirmar/Cancelar
   * @param {Function} onConfirm Función a ejecutar al confirmar (opcional)
   */
  open({ title = "Título", content = "Contenido", confirm = false } = {}, onConfirm = null) {
    this.titleEl.textContent = title;
    this.contentEl.textContent = content;
    this._confirmListener = confirm ? onConfirm : null;

    const confirmBtn = this.shadowRoot.getElementById("modal-confirm-btn");
    const cancelBtn = this.shadowRoot.getElementById("modal-cancel-btn");

    if (confirm) {
      confirmBtn.style.display = "inline-block";
      cancelBtn.textContent = "Cancelar";
    } else {
      confirmBtn.style.display = "none";
      cancelBtn.textContent = "Cerrar";
    }

    this.overlay.classList.add("active");
  }

  close() {
    this.overlay.classList.remove("active");
    this._confirmListener = null;
  }
}

customElements.define("modal-component", ModalComponent);
