class AdminHeaderComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Leer atributos iniciales
    const hideButtons = this.hasAttribute("hide-buttons");

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family:"Raleway", sans-serif; }

        header {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
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
          margin-left: 80px;
        }

        .btn-group {
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
<button class="btn-agregar" >
  <span><b style="font-size: 20px;">+</b></span> Crear pregunta
</button>
        </div>
      </header>
    `;
  }

  connectedCallback() {
    if (!this.hasAttribute("hide-buttons")) {
      const btnAgregar = this.shadowRoot.querySelector(".btn-agregar");
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
