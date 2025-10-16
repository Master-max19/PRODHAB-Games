class SimpleTableComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.data = [];
    this.columns = [];
    this.page = 1;
    this.pageSize = 3;
    this.editingId = null;
    this.showAdd = true;
    this.showEdit = true;
    this.showDelete = true;
    this.showRefresh = true; // Nuevo flag
  }

  connectedCallback() {
    this._render();
  }

  set dataSource(arr) {
    if (Array.isArray(arr)) {
      this.data = arr.map((item, index) => ({ ...item, _id: index }));
      if (!this.columns.length) {
        this.columns = Object.keys(arr[0] || {}).filter((k) => k !== "_id");
      }
      this.page = 1;
      this._render();
    }
  }

  set config(opts) {
    this.showAdd = opts?.showAdd ?? true;
    this.showEdit = opts?.showEdit ?? true;
    this.showDelete = opts?.showDelete ?? true;
    this.showRefresh = opts?.showRefresh ?? true; // Configuración externa
    this.columns = opts?.columns ?? this.columns;
    this._render();
  }

  _render() {
    const style = `
      <style>
        :host { display: block; max-width: 800px; margin: 20px auto; font-family: system-ui, sans-serif; padding: 10px; }
        .toolbar { display: flex; justify-content: flex-end; margin-bottom: 10px; gap: 8px; }
        button { padding: 8px 12px; border: none; border-radius: 6px; background: #2563eb; color: white; cursor: pointer; transition: background 0.2s; }
        button:hover { background: #1e40af; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        input { width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #ccc; }
        .table-container { overflow-x: auto; border-radius: 6px; box-shadow: 0 0 6px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; min-width: 500px; }
        th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; vertical-align: middle; }
        td button { margin-right: 6px; }
        .button-group { display: flex; gap: 6px; flex-wrap: wrap; }
        .pagination { margin-top: 12px; display: flex; gap: 8px; justify-content: center; align-items: center; flex-wrap: wrap; }
        @media (max-width: 600px) { table, th, td { font-size: 14px; } button { padding: 6px 10px; font-size: 14px; } th, td { padding: 8px; } }
      </style>
    `;

    const totalPages = Math.max(1, Math.ceil(this.data.length / this.pageSize));
    if (this.page > totalPages) this.page = totalPages;
    const start = (this.page - 1) * this.pageSize;
    const pageRows = this.data.slice(start, start + this.pageSize);

    const headersHtml = this.columns.map((c) => `<th>${c}</th>`).join("");
    const rowsHtml = pageRows.length
      ? pageRows
        .map((item) => {
          const cells = this.columns
            .map((col) => {
              if (this.editingId === item._id) {
                return `<td><input type="text" value="${this._escapeHtml(item[col] ?? "")}" data-field="${col}" /></td>`;
              }
              return `<td>${this._escapeHtml(item[col] ?? "")}</td>`;
            })
            .join("");

          const buttons = [
            this.showEdit ? `<button data-action="edit">Editar</button>` : "",
            this.showDelete ? `<button data-action="delete">Eliminar</button>` : "",
          ].join("");

          const editingButtons = `
              <div class="button-group">
                <button data-action="save">Guardar</button>
                <button data-action="cancel">Cancelar</button>
              </div>
            `;

          return `<tr data-id="${item._id}">${cells}<td>${this.editingId === item._id ? editingButtons : buttons}</td></tr>`;
        })
        .join("")
      : `<tr><td colspan="${this.columns.length + 1}">No hay datos</td></tr>`;

    const paginationHtml = `
      <button ${this.page <= 1 ? "disabled" : ""} data-action="prev">◀</button>
      <span>Página ${this.page} de ${totalPages}</span>
      <button ${this.page >= totalPages ? "disabled" : ""} data-action="next">▶</button>
    `;

    this.shadowRoot.innerHTML = `
      ${style}
      <div class="toolbar">
        ${this.showAdd ? `<button data-action="add" ${this.editingId !== null ? "disabled" : ""}>➕ Agregar</button>` : ""}
        ${this.showRefresh ? `<button data-action="refresh">Refrescar</button>` : ""}
      </div>
      <div class="table-container">
        <table>
          <thead><tr>${headersHtml}<th>Acciones</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
      <div class="pagination">${paginationHtml}</div>
    `;

    this.shadowRoot.querySelectorAll("button").forEach((btn) =>
      btn.addEventListener("click", () => this._handleAction(btn))
    );
  }

  _handleAction(btn) {
    const action = btn.dataset.action;
    if (!action) return;

    if (action === "refresh") {
      this.dispatchEvent(new CustomEvent("refresh-table", { bubbles: true, composed: true }));
      return;
    }

    if (action === "add") return this._startAdd();
    if (action === "prev") return this._changePage(this.page - 1);
    if (action === "next") return this._changePage(this.page + 1);

    const id = btn.closest("tr")?.dataset.id;
    const row = this.data.find((r) => r._id == id);

    if (action === "edit") {
      if (this.editingId !== null) return;
      this.editingId = row._id;
      this._render();
      this.dispatchEvent(new CustomEvent("edit-row", { detail: row, bubbles: true, composed: true }));
    }

    if (action === "delete") {
      const event = new CustomEvent("before-delete-row", { detail: row, bubbles: true, composed: true, cancelable: true });
      this.dispatchEvent(event);
      if (event.defaultPrevented) return;
      this.data = this.data.filter((r) => r._id != id);
      this.dispatchEvent(new CustomEvent("delete-row", { detail: row, bubbles: true, composed: true }));
      this._render();
    }

    if (action === "save") {
      const inputs = Array.from(this.shadowRoot.querySelectorAll(`tr[data-id="${id}"] input`));
      const newValues = {};
      inputs.forEach((inp) => (newValues[inp.dataset.field] = inp.value.trim()));
      const event = new CustomEvent("before-save-row", { detail: { row, newValues }, bubbles: true, composed: true, cancelable: true });
      if (!this.dispatchEvent(event)) return;
      Object.assign(row, newValues);
      this.editingId = null;
      this._render();
      this.dispatchEvent(new CustomEvent("save-row", { detail: row, bubbles: true, composed: true }));
    }

    if (action === "cancel") {
      if (Object.values(row).some((v) => v === "Nueva descripción")) {
        this.data = this.data.filter((r) => r._id != id);
      }
      this.editingId = null;
      this._render();
    }
  }

  _startAdd() {
    if (this.editingId !== null) return;
    const newId = this.data.length ? Math.max(...this.data.map((r) => r._id)) + 1 : 0;
    const newRow = { _id: newId };
    this.columns.forEach((c) => (newRow[c] = "Nueva descripción"));
    this.data.unshift(newRow);
    this.editingId = newId;
    this.page = 1;
    this._render();
  }

  _changePage(n) {
    const totalPages = Math.max(1, Math.ceil(this.data.length / this.pageSize));
    if (n < 1 || n > totalPages) return;
    this.page = n;
    this._render();
  }

  _escapeHtml(str) {
    return str?.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") || "";
  }
}

customElements.define("simple-table-component", SimpleTableComponent);
