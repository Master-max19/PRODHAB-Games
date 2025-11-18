class AdminHeaderComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const hideButtons = this.hasAttribute("hide-buttons");

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family:"Raleway", sans-serif; }

        header {
          background: #1f4388;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          flex-wrap: wrap;
          gap: 1rem;
          font-family:"Raleway", sans-serif;
        }
        .title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 auto;       
          flex: 1 1 100%;       
          text-align: center; 
          word-break: break-word;
          overflow-wrap: anywhere;
        }


        .btn-group {
        margin-left: auto;
          display: ${hideButtons ? "none" : "flex"};
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .btn-agregar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: white;
          color: #4f46e5;
          border: 2px solid #4f46e5;
          padding: 0.5rem 1rem;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease-in-out;
          min-width: 120px;
          flex: 1 1 auto;
        }

        .btn-agregar:hover {
          background: #eef2ff;
          transform: scale(1.05);
        }

        form-test-component { display: none; }

        @media (max-width: 480px) {
          header { flex-direction: column; align-items: flex-start; }
          .btn-group { width: 100%; gap: 0.5rem; }
          .btn-agregar { width: 100%; }
          .title { font-size: 1.5rem; font-weight: 600; display: block; margin: 0 auto; width: fit-content; }
        }
      </style>
          <header>
            <div class="title">${this.getAttribute("title") || "Test"}</div>
            <div class="btn-group">
              <button class="btn-agregar">
                <span><b style="font-size: 20px">+</b></span> Crear pregunta
              </button>
            </div>
          </header>

    `;
  }
 static get observedAttributes() {
  return ["title", "hide-buttons"];
}


attributeChangedCallback(name, oldValue, newValue) {
  if (name === "title" && this.shadowRoot) {
    const titleEl = this.shadowRoot.querySelector(".title");
    if (titleEl) titleEl.textContent = newValue;
  }

  if (name === "hide-buttons" && this.shadowRoot) {
    const btnGroup = this.shadowRoot.querySelector(".btn-group");
    if (btnGroup) {
      btnGroup.style.display = this.hasAttribute("hide-buttons") ? "none" : "flex";
    }
  }
}



  connectedCallback() {
    const btnAgregar = this.shadowRoot.querySelector(".btn-agregar");
    if (btnAgregar) {
      btnAgregar.addEventListener("click", () => this.mostrarFormulario());
    }
  }

  mostrarFormulario() {
    const formTest = document.querySelector("form-test-component");
    if (formTest) {
      formTest.style.display = "block";
      formTest.setAttribute("modo", "registrar");
      if (typeof formTest.mostrar === "function") formTest.mostrar();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  ocultarFormulario() {
    const formTest = document.querySelector("form-test-component");
    if (formTest) formTest.ocultar();
  }
}

customElements.define("admin-header-component", AdminHeaderComponent);
