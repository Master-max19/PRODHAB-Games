class ResumenActividadComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
      <style>
        *{ font-family: "Raleway", Arial, sans-serif; }
        :host { display: block; max-width: 1200px; margin: 0 auto; }
        .card {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          padding: 24px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .metrics {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .metric {
          flex: 1;
          min-width: 150px;
          text-align: center;
          padding: 16px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          transition: transform 0.2s ease;
        }
        .metric:hover { transform: translateY(-3px); }
        .metric .icon {
          font-size: 36px;
          margin-bottom: 6px;
          display: block;
          font-weight: bold;
        }
        .metric.mes .icon { color: rgb(0,53,160); }
        .metric.ultimos .icon { color: #c74b27; }
        .metric.promedio .icon { color: #10b981; }
        .metric p { font-size: 0.9rem; color: #64748b; font-weight: 500; margin-bottom: 4px; }
        .metric h2 { font-size: 1.75rem; font-weight: 700; }
        .refresh-container { display: flex; justify-content: flex-end; }
        .refresh-btn {
          padding: 8px 16px;
          background: #043584ff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .refresh-btn:hover { background: #021f6aff; }
      </style>

      <div class="card">
        <div class="metrics">
          <div class="metric mes" title="">
            <span class="icon">✓</span>
            <p></p>
            <h2 id="mes-actual">0</h2>
          </div>
          <div class="metric ultimos" title="">
            <span class="icon">⏲</span>
            <p></p>
            <h2 id="ultimos-30">0</h2>
          </div>
          <div class="metric promedio" title="">
            <span class="icon">✎</span>
            <p></p>
            <h2 id="promedio">0%</h2>
          </div>
        </div>
        <div class="refresh-container">
          <button class="refresh-btn">⟳ Refrescar</button>
        </div>
      </div>
    `;

        this.refreshBtn = this.shadowRoot.querySelector(".refresh-btn");
        this.refreshBtn.addEventListener("click", () => this.fetchData());
    }

    static get observedAttributes() {
        return [
            "id-juego",
            "label-mes",
            "label-30dias",
            "label-promedio",
            "tooltip-mes",
            "tooltip-30dias",
            "tooltip-promedio",

        ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "id-juego":
                this.fetchData();
                break;
            case "label-mes":
                this.shadowRoot.querySelector(".mes p").textContent = newValue;
                break;
            case "label-30dias":
                this.shadowRoot.querySelector(".ultimos p").textContent = newValue;
                break;
            case "label-promedio":
                this.shadowRoot.querySelector(".promedio p").textContent = newValue;
                break;
            case "tooltip-mes":
                this.shadowRoot.querySelector(".mes").title = newValue;
                break;
            case "tooltip-30dias":
                this.shadowRoot.querySelector(".ultimos").title = newValue;
                break;
            case "tooltip-promedio":
                this.shadowRoot.querySelector(".promedio").title = newValue;
                break;
        }
    }

    async fetchData() {
        const idJuego = this.getAttribute("id-juego") || 17;
        const data = await resultadoJuegoService.obtenerEstadisticas(Number(idJuego));
        if (!data) return;

        this.updateData({
            mesActual: data.cantidadMesActual,
            ultimos30: data.cantidadRegistrosUlt30Dias,
            promedio: data.promedioNotaUlt30Dias,
        });
    }

    updateData({ mesActual, ultimos30, promedio }) {
        if (mesActual !== undefined) this.shadowRoot.getElementById("mes-actual").textContent = mesActual.toLocaleString();
        if (ultimos30 !== undefined) this.shadowRoot.getElementById("ultimos-30").textContent = ultimos30.toLocaleString();
        if (promedio !== undefined) this.shadowRoot.getElementById("promedio").textContent = promedio + "%";
    }
}

customElements.define("resumen-actividad-component", ResumenActividadComponent);



