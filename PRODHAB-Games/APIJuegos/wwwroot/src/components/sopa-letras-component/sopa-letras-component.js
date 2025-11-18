class SopaLetrasComponent extends HTMLElement {


    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.size = 14;
        this.grid = [];
        this.placed = [];
        this.found = new Set();
        this.selecting = false;
        this.path = [];
        this.firstClick = null;
        this.words = [];
        this.link = null;
        this.descripcion = null;
        this.title = "Sopa de Letras";
        this.nombre = null;
        this.timer = 0;
        this.timerInterval = null;
        this.idSopa = null;
        this.ABC = [..."ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"];
        this.DIRS = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
            { dx: 1, dy: 1 },
            { dx: -1, dy: -1 },
            { dx: 1, dy: -1 },
            { dx: -1, dy: 1 },
        ];

        this.init();
    }


    async init() {
        await this.parseAttributes();
        if (!this.words || this.words.length === 0) {
            this.shadowRoot.innerHTML = `<p>No hay palabras disponibles para generar la sopa de letras.</p>`;
            return;
        }

        this.render();   
        this.nuevoJuego(); 

        const modal1 = this.shadowRoot.getElementById("modal1");
        if (modal1?.open) modal1.open();
    }


    async parseAttributes() {
        const sizeAttr = this.getAttribute("size");
        const wordsAttr = this.getAttribute("words");
        const titleAttr = this.getAttribute("title");

        // Tamaño de la sopa
        if (sizeAttr && !isNaN(sizeAttr)) {
            const s = parseInt(sizeAttr);
            this.size = s >= 8 && s <= 25 ? s : 14;
        }

        if (wordsAttr) {
            this.words = wordsAttr
                .split(",")
                .map(w => w.trim().toUpperCase().replace(/\s+/g, "")) // quitar espacios
                .filter(w => w.length > 0 && w.length <= 14)          // solo palabras de 1 a 14 letras
                .slice(0, 15);
        } else {
            // Obtener palabras del servicio
            const res = await sopaLetrasService.obtenerDatosSopa(Number(this.getAttribute('id-sopa')) || null);
            this.idSopa = res.idJuego;
            if (res.idJuego == null) {
                this.shadowRoot.textContent = `<p>Juego no disponible.</p>`;
                return;
            }
            this.words = res.palabras
                .map(w => w.toUpperCase().replace(/\s+/g, ""))
                .filter(w => w.length > 0 && w.length <= 14);
            this.descripcion = res.descripcion;
            this.detalle = res.detalle;
            this.title = res.nombre || titleAttr;
            this.link = this.detalle;

        }
    }


    render() {
        const modal1Title = this.descripcion || this.getAttribute("modal1-title") || "Encuentra las palabras seleccionando de la primera a la última letra.";
        const modal1Video = this.getAttribute("modal1-video") || "video1.mp4";

        const modal2Title = this.getAttribute("modal2-title") || "¡Felicidades! Has completado la sopa de letras.";
        const modal2Video = this.getAttribute("modal2-video") || "video2.mp4";
        const modal2Link = this.link || this.getAttribute("modal2-link") || "https://www.prodhab.go.cr/";
        const superdatoImg = this.getAttribute("superdato-img") || "no_existe.png";

        this.shadowRoot.innerHTML = `
<style>
  :host {
    --bg: #f4f7fb;
    --panel: #fff;
    --card: #e9eef7;
    --ink: #1e293b;
    --accent: #2563eb;
    --ok: #16a34a;
    --muted: #64748b;
    --border: #dbe1ea;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  * { box-sizing: border-box; font-family: 'Raleway', sans-serif; }

  .app {
    width: 100%;
    max-width: 1100px;
    background: var(--panel);
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  }

  h2 {
    text-align: center;
    color: rgb(30, 53, 94);
    margin-bottom: 8px;
    font-size: 1.5rem;
  }

  .layout {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 12px;
  }

  .board {
    display: grid;
    gap: 2px;
    background: var(--card);
    border-radius: 8px;
    padding: 4px;
    border: 1px solid var(--border);
    width: 100%;
    height: auto;
    max-width: 100%;
    overflow: hidden;
    touch-action: none;
    aspect-ratio: 1/1;
  }

  .cell {
    width: 100%;
    aspect-ratio: 1/1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-weight: 700;
    user-select: none;
    font-size: clamp(10px, 2.5vw, 18px);
    transition: background .2s;
    min-width: 20px;
    min-height: 20px;
    color: #021034;
  }

  .cell.sel { background: #dbeafe; border-color: var(--accent); }
  .cell.found { 
    background: #dbeafe;
    border-color: #3b82f6;
    color: #1e3a8a;
  }
  .cell.dim { background: #fed7aa; }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative; 
  }

  .sidebar-title {
    margin: 0;
    font-size: 0.9rem;
    color: var(--ink);
    font-weight: 600;
  }

  .words { 
    display: grid; 
    gap: 6px;
    max-height: 350px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .words::-webkit-scrollbar {
    width: 6px;
  }

  .words::-webkit-scrollbar-track {
    background: var(--card);
    border-radius: 3px;
  }

  .words::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
  }

  .word {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: .4rem .6rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
  }

.word.found {
    border-color: #3b82f6;
    background: #dbeafe;
    color: #1e3a8a;
        font-weight: bold; 
}


  .footer { 
    display: flex; 
    flex-wrap: wrap;
    justify-content: space-between; 
    align-items: center;
    margin-top: 8px; 
    color: var(--muted); 
    font-size: .8rem;
    gap: 8px;
  }

  .timer {
    font-size: 0.9rem;
    color: var(--muted);
    font-weight: 600;
    padding: 6px 12px;
    background: #f0f4f8;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    display: none;
  }

  #btnRestart {
    width: 150px;
    padding: 6px 12px;
    border-radius: 6px;
    border: none;
    background: #021e5b;
    color: white;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
    height:30px;
  }

  #btnRestart:hover { background: #021034; }

.sidebar img {
  width: 120px;
  height: auto;
  display: block;
  margin: 0 auto 50px;
  user-select: none;     
  -webkit-user-drag: none;
  -moz-user-select: none;  
  -ms-user-select: none;   
}


  @media (max-width: 900px) { 
    .layout { grid-template-columns: 1fr; }
    .app { padding: 10px; }
    h2 { font-size: 1.3rem; }
    .words { max-height: 200px; }
  }

  @media (max-width: 600px) { 
    .app { padding: 8px; }
    .board { gap: 1px; }
    .cell { min-width: 16px; min-height: 16px; font-size: 11px; }
    .word { padding: .3rem .5rem; font-size: 0.8rem; }
    .footer { font-size: .7rem; }
    h2 { font-size: 1.1rem; }
    #btnRestart { width: 120px; bottom: 5px; right: 5px; }
  }

  @media (max-width: 375px) { 
    .cell { min-width: 14px; min-height: 14px; font-size: 9px; }
    #btnRestart { width: 120px; bottom: 5px; right: 5px; }
  }
</style>

<div class="app">
  <h2>${utilHtmlJuegos.escapeHtml(this.title)}</h2>
  <div class="layout">
    <section>
      <div id="board" class="board"></div>
      <div class="footer">
        <div>Encontradas: <strong id="foundCount">0</strong>/<span id="goal">0</span></div>
        <div id="msg"></div>
      </div>
    </section>

<section class="sidebar" style="display: flex; flex-direction: column; height: 100%; padding: 10px;">
  <p class="sidebar-title">Palabras a encontrar</p>
  <div id="words" class="words"></div>
  <img src="${superdatoImg}" 
       alt="superdato" 
       onerror="this.style.display='none';">
  <div style="display: flex; justify-content: flex-end; margin-top: auto;">
    <button id="btnRestart">Reiniciar juego</button>
  </div>
</section>


  </div>

  <modal-sopa 
    id="modal1"
    title="${utilHtmlJuegos.escapeHtml(modal1Title)}"
    video="${modal1Video}">
  </modal-sopa>

  <modal-sopa 
    id="modal2"
    title="${utilHtmlJuegos.escapeHtml(modal2Title)}" 
    video="${modal2Video}"
    link="${utilHtmlJuegos.escapeHtml(modal2Link)}"
    no-animation>
  </modal-sopa>
</div>
`;

        this.addEventListeners();
    }

    nuevoJuego() {

        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timer = 0;

        this.grid = Array.from({ length: this.size }, () =>
            Array(this.size).fill("")
        );

        this.placed.length = 0;
        this.path.length = 0;
        this.firstClick = null;
        this.found.clear();
        const sorted = [...this.words]
            .sort((a, b) => b.length - a.length)
            .filter((w) => w.length <= this.size);

        sorted.forEach((w) => this.colocarPalabra(w));
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (!this.grid[y][x]) this.grid[y][x] = this.ABC[Math.floor(Math.random() * this.ABC.length)];
            }
        }

        this.renderBoard();
        this.renderWords();
        const goal = this.shadowRoot.getElementById("goal");
        const foundCount = this.shadowRoot.getElementById("foundCount");
        const msg = this.shadowRoot.getElementById("msg");
        if (goal) goal.textContent = this.words.length;
        if (foundCount) foundCount.textContent = this.found.size;
        if (msg) msg.textContent = "";

        this.startTimer();
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    updateTimerDisplay() {
        const timerEl = this.shadowRoot.getElementById("timer");
        if (!timerEl) return;

        let timeText = "";
        if (this.timer < 60) {
            timeText = `${this.timer}s`;
        } else if (this.timer < 3600) {
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            timeText = `${minutes}m ${seconds}s`;
        } else {
            const hours = Math.floor(this.timer / 3600);
            const minutes = Math.floor((this.timer % 3600) / 60);
            const seconds = this.timer % 60;
            timeText = `${hours}h ${minutes}m ${seconds}s`;
        }

        timerEl.textContent = timeText;
    }

    colocarPalabra(word) {
        const dirs = this.shuffle([...this.DIRS]);
        const reversed = Math.random() < 0.5;
        const w = reversed ? [...word].reverse().join("") : word;
        let bestSpot = null;
        let bestOverlap = -1;

        for (const dir of dirs) {
            let minX = 0,
                maxX = this.size - 1,
                minY = 0,
                maxY = this.size - 1;
            if (dir.dx === 1) maxX = this.size - w.length;
            if (dir.dx === -1) minX = w.length - 1;
            if (dir.dy === 1) maxY = this.size - w.length;
            if (dir.dy === -1) minY = w.length - 1;

            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    let overlap = 0,
                        valid = true;
                    for (let i = 0; i < w.length; i++) {
                        const nx = x + i * dir.dx,
                            ny = y + i * dir.dy;
                        const c = this.grid[ny][nx];
                        if (nx < 0 || ny < 0 || nx >= this.size || ny >= this.size) {
                            valid = false;
                            break;
                        }
                        if (c && c !== "" && c !== w[i]) {
                            valid = false;
                            break;
                        }
                        if (c === w[i]) overlap++;
                    }
                    if (valid && overlap > bestOverlap) {
                        bestOverlap = overlap;
                        bestSpot = { x, y, dir };
                    }
                }
            }
        }

        if (bestSpot) {
            const { x, y, dir } = bestSpot;
            const coords = [];
            for (let i = 0; i < w.length; i++) {
                const nx = x + i * dir.dx,
                    ny = y + i * dir.dy;
                this.grid[ny][nx] = w[i];
                coords.push([nx, ny]);
            }
            this.placed.push({ word, coords });
            return true;
        }
        return false;
    }

    renderBoard() {
        const board = this.shadowRoot.getElementById("board");
        if (!board) return;
        board.innerHTML = "";
        board.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const div = document.createElement("div");
                div.className = "cell";
                div.dataset.x = x;
                div.dataset.y = y;
                div.textContent = this.grid[y][x] || "";
                div.addEventListener("mousedown", this.startSel.bind(this));
                div.addEventListener("mouseenter", this.extendSel.bind(this));
                div.addEventListener("mouseup", this.endSel.bind(this));
                div.addEventListener("click", this.handleClick.bind(this));
                div.addEventListener(
                    "touchstart",
                    this.startSelTouch.bind(this),
                    { passive: false }
                );
                div.addEventListener(
                    "touchmove",
                    this.extendSelTouch.bind(this),
                    { passive: false }
                );
                div.addEventListener(
                    "touchend",
                    this.touchEndHandler.bind(this),
                    { passive: false }
                );
                board.appendChild(div);
            }
        }
    }

 renderWords() {
    const cont = this.shadowRoot.getElementById("words");
    if (!cont) return;
    cont.innerHTML = "";
    this.words.forEach((w) => {
        const div = document.createElement("div");
        div.className = "word";
        div.id = `w-${w}`;

        const span = document.createElement("span");
        span.textContent = w; // Escapado seguro
        const small = document.createElement("small");
        small.id = `s-${w}`;
        small.textContent = "—";

        div.appendChild(span);
        div.appendChild(small);
        cont.appendChild(div);
    });
}

    startSel(e) {
        this.selecting = true;
        this.clearTemp();
        this.addToPath(e.currentTarget);
    }

    extendSel(e) {
        if (this.selecting) this.addToPath(e.currentTarget);
    }

    startSelTouch(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const el = this.shadowRoot.elementFromPoint(
            touch.clientX,
            touch.clientY
        );
        if (el && el.classList.contains("cell")) {
            const x = parseInt(el.dataset.x),
                y = parseInt(el.dataset.y);
            if (!this.firstClick) {
                this.firstClick = { x, y };
                this.clearTemp();
                el.classList.add("sel");
                this.selecting = false;
            } else {
                const line = this.getLineBetween(this.firstClick, { x, y });
                if (line) {
                    this.clearTemp();
                    this.path = line;
                    this.path.forEach((pt) =>
                        this.getCell(pt.x, pt.y)?.classList.add("sel")
                    );
                    this.endSel();
                } else {
                    this.clearTemp();
                    this.firstClick = { x, y };
                    el.classList.add("sel");
                }
                this.firstClick = null;
            }
        }
    }

    extendSelTouch(e) {
        e.preventDefault();
        if (!this.firstClick) return;
        const touch = e.changedTouches[0];
        const el = this.shadowRoot.elementFromPoint(
            touch.clientX,
            touch.clientY
        );
        if (el && el.classList.contains("cell")) {
            const x = parseInt(el.dataset.x),
                y = parseInt(el.dataset.y);
            const line = this.getLineBetween(this.firstClick, { x, y });
            if (line) {
                this.clearTemp();
                this.path = line;
                this.path.forEach((pt) =>
                    this.getCell(pt.x, pt.y)?.classList.add("sel")
                );
            }
        }
    }

    touchEndHandler(e) {
        e.preventDefault();
        if (this.path.length > 0) this.endSel();
    }

    handleClick(e) {
        const cell = e.currentTarget;
        const x = parseInt(cell.dataset.x),
            y = parseInt(cell.dataset.y);
        if (!this.firstClick) {
            this.firstClick = { x, y };
            this.clearTemp();
            cell.classList.add("sel");
        } else {
            const line = this.getLineBetween(this.firstClick, { x, y });
            if (line) {
                this.clearTemp();
                this.path = line;
                this.path.forEach((pt) =>
                    this.getCell(pt.x, pt.y)?.classList.add("sel")
                );
                this.endSel();
            } else {
                this.clearTemp();
                this.firstClick = { x, y };
                cell.classList.add("sel");
            }
            this.firstClick = null;
        }
    }

    getLineBetween(a, b) {
        const dx = b.x - a.x,
            dy = b.y - a.y;
        const stepX = Math.sign(dx),
            stepY = Math.sign(dy);
        if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy))
            return null;
        const len = Math.max(Math.abs(dx), Math.abs(dy)) + 1;
        if (len > this.size) return null;
        const arr = [];
        let x = a.x,
            y = a.y;
        for (let i = 0; i < len; i++) {
            if (x < 0 || x >= this.size || y < 0 || y >= this.size) return null;
            arr.push({ x, y });
            x += stepX;
            y += stepY;
        }
        return arr;
    }

    async endSel() {
        if (!this.path.length) return;
        this.selecting = false;
        const palabra = this.path.map((c) => this.grid[c.y][c.x]).join("");
        const palabraR = [...palabra].reverse().join("");

        const match = this.placed.find((p) => {
            const s = p.coords.map((c) => this.grid[c[1]][c[0]]).join("");
            const sR = [...s].reverse().join("");
            if (
                (s === palabra || sR === palabra) &&
                s.length === palabra.length
            ) {
                const pathCoords = this.path.map((c) => [c.x, c.y]);
                const isExactMatch =
                    JSON.stringify(pathCoords) === JSON.stringify(p.coords) ||
                    JSON.stringify(pathCoords) ===
                    JSON.stringify([...p.coords].reverse());
                return isExactMatch;
            }
            return false;
        });

        if (match && !this.found.has(match.word)) {
            this.found.add(match.word);
            this.path.forEach((c) =>
                this.getCell(c.x, c.y)?.classList.add("found")
            );
            const wordEl = this.shadowRoot.getElementById(`w-${match.word}`);
            if (wordEl) wordEl.classList.add("found");
            const foundCount = this.shadowRoot.getElementById("foundCount");
            if (foundCount) foundCount.textContent = this.found.size;
            if (this.found.size === this.words.length) {
                let timeText = "";
                if (this.timer < 60) {
                    timeText = `${this.timer}s`;
                } else if (this.timer < 3600) {
                    const minutes = Math.floor(this.timer / 60);
                    const seconds = this.timer % 60;
                    timeText = `${minutes}m ${seconds}s`;
                } else {
                    const hours = Math.floor(this.timer / 3600);
                    const minutes = Math.floor((this.timer % 3600) / 60);
                    const seconds = this.timer % 60;
                    timeText = `${hours}h ${minutes}m ${seconds}s`;
                }

                const msg = this.shadowRoot.getElementById("msg");
                if (msg) msg.textContent = `¡Felicidades! Lo lograste en ${timeText}`;


                await resultadoJuegoService.registrarJuego(Number(this.getAttribute("id-sopa")) || this.idSopa || null);

                if (this.timerInterval) clearInterval(this.timerInterval);
                const modal = this.shadowRoot.getElementById("modal2");
                if (modal) modal.open();
            }
        } else {
            this.path.forEach((c) =>
                this.getCell(c.x, c.y)?.classList.add("dim")
            );
            setTimeout(
                () =>
                    this.path.forEach((c) =>
                        this.getCell(c.x, c.y)?.classList.remove("dim")
                    ),
                300
            );
        }
        this.clearTemp(true);
    }

    addToPath(cellEl) {
        if (!cellEl || !cellEl.classList) return;
        const x = parseInt(cellEl.dataset.x),
            y = parseInt(cellEl.dataset.y);
        if (
            this.path.length &&
            this.path[this.path.length - 1].x === x &&
            this.path[this.path.length - 1].y === y
        )
            return;
        this.path.push({ x, y });
        cellEl.classList.add("sel");
    }

    clearTemp(keep = false) {
        this.shadowRoot
            .querySelectorAll(".cell.sel")
            .forEach((c) => c.classList.remove("sel"));
        if (!keep)
            this.shadowRoot
                .querySelectorAll(".cell.dim")
                .forEach((c) => c.classList.remove("dim"));
        this.path.length = 0;
    }

    getCell(x, y) {
        return this.shadowRoot.querySelector(
            `.cell[data-x="${x}"][data-y="${y}"]`
        );
    }

    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    addEventListeners() {
        const btnRestart = this.shadowRoot.getElementById("btnRestart");
        if (btnRestart)
            btnRestart.addEventListener("click", () => this.nuevoJuego());
    }

    disconnectedCallback() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    static get observedAttributes() {
        return ["words", "size", "title"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue || !this.isConnected) return;
        if (name === "words") {
            this.words = newValue.split(",").map((w) => w.trim().toUpperCase());
            this.nuevoJuego();
        } else if (name === "size") {
            const s = parseInt(newValue);
            this.size = s >= 8 && s <= 25 ? s : 14;
            this.nuevoJuego();
        } else if (name === "title") {
            this.title = newValue;
            const h2 = this.shadowRoot.querySelector("h2");
            if (h2) h2.textContent = newValue;
        }
    }
}

customElements.define("sopa-letras-component", SopaLetrasComponent);
