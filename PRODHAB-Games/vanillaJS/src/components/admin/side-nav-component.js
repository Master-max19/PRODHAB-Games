class SidenavComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Arial, sans-serif;
          background-color: #f9faff;
        }
        .sidenav {
          height: 100vh;
          width: 0;
          position: fixed;
          top: 0;
          left: 0;
          background-color: #f0f7ff;
          overflow-x: hidden;
          transition: 0.4s;
          padding-top: 60px;
          z-index: 999;
          border-right: 1px solid #d0e0ff;
        }
        .sidenav a, .sidenav button {
          display: block;
          padding: 15px 25px;
          font-size: 18px;
          color: #1e3a8a;
          text-decoration: none;
          border-radius: 8px;
          margin: 5px 10px;
          transition: all 0.3s;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
        }
        .sidenav a:hover, .sidenav button:hover {
          background-color: #e1edff;
          color: #4f83cc;
          transform: translateX(5px);
        }
        .sidenav a.active {
          background-color: #1e3a8a;
          color: #fff;
        }
        .menu-btn {
          font-size: 28px;
          cursor: pointer;
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1000;
          color: #1e3a8a;
          background-color: #ffffffcc;
          border: none;
          border-radius: 6px;
          padding: 5px 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        ::slotted(.option) {
          display: none;
        }
        ::slotted(.option.active) {
          display: block;
        }
      </style>

      <button id="menu-btn" class="menu-btn">&#9776;</button>
      <div class="sidenav" id="sidenav"></div>
      <div class="content">
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    this.sidenav = this.shadowRoot.querySelector("#sidenav");
    this.menuBtn = this.shadowRoot.querySelector("#menu-btn");
    this.slot = this.shadowRoot.querySelector("slot");

    this.menuBtn.addEventListener("click", () => this.openSidenav());
  }

  set menuOptions(options) {
    this.options = options;
    this.renderMenu();
  }



  renderMenu() {
  this.sidenav.innerHTML = "";

  // Botón de cierre en la esquina superior derecha
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×"; // icono de cierre
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "0px";
  closeBtn.style.right = "1px";
  closeBtn.style.fontSize = "28px";
  closeBtn.style.background = "none";
  closeBtn.style.border = "none";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.color = "#1e3a8a";
  closeBtn.addEventListener("click", () => this.closeSidenav());
  this.sidenav.appendChild(closeBtn);

  this.options.forEach((opt) => {
    let el;
    if (opt.type === "button") {
      el = document.createElement("button");
      el.textContent = opt.title;
      el.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent(opt.event, { detail: opt.detail || {} }));
      });
    } else {
      el = document.createElement("a");
      el.href = opt.path;
      el.dataset.route = true;
      el.textContent = opt.title;
      el.addEventListener("click", (e) => {
        e.preventDefault();
        this.navigate(opt.path);
        this.closeSidenav();
      });
    }
    this.sidenav.appendChild(el);
  });
}

openSidenav() {
  this.sidenav.style.width = "250px";
  this.menuBtn.style.display = "none"; // ocultar botón hamburguesa
}

closeSidenav() {
  this.sidenav.style.width = "0";
  this.menuBtn.style.display = "block"; // mostrar botón hamburguesa
}


  navigate(hash) {
    // Buscar todas las secciones dentro del slot
    const sections = this.querySelectorAll(".option");
    sections.forEach(sec => sec.classList.remove("active"));

    const targetId = this.options.find(o => o.path === hash)?.id;
    if (targetId) {
      const target = this.querySelector(`#${targetId}`);
      if (target) target.classList.add("active");
    }

    // Activar link en el menú
    this.shadowRoot.querySelectorAll("a[data-route]").forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === hash);
    });
  }

openSidenav() {
  this.sidenav.style.width = "250px";
  this.menuBtn.style.display = "none"; // ocultar botón hamburguesa
}

closeSidenav() {
  this.sidenav.style.width = "0";
  this.menuBtn.style.display = "block"; // mostrar botón hamburguesa
}
}

customElements.define("side-nav-component", SidenavComponent);
