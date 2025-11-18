class SimpleTableComponent extends HTMLElement {

  get serviceId() {
    const id = this.getAttribute("service-id") || 1;
    return Number(id);
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.data = [];
    this.columns = [];
    this.editableColumns = [];
    this.page = 1;
    this.pageSize = 3;
    this.editingId = null;
    this.showAdd = true;
    this.showEdit = true;
    this.showDelete = true;
    this.showRefresh = true;
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
    this.showRefresh = opts?.showRefresh ?? true;
    this.columns = opts?.columns ?? this.columns;
    this.editableColumns = opts?.editableColumns ?? this.columns;
    this.externalActions = opts?.externalActions ?? [];
    this._render();
  }

  _render() {
    const style = `
      <style>
* {
  font-family: "Raleway", Arial, sans-serif;
}
:host {
  display: block;
  max-width: 1200px;
  margin: 20px auto;
  padding: 10px;
}
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;
}
button {
  padding: 6px 5px;
  border: none;
  border-radius: 6px;
  background: #1e355e;
  color: white;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  font-size: 0.9rem;
  min-width: 80px;
}
button:hover {
  background: #1f4388;
  transform: translateY(-1px);
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


textarea {
  width: 100%;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical; /* permite al usuario cambiar altura */
  min-height: 40px; /* altura mínima */
  box-sizing: border-box;
}

.table-container {
  overflow-x: auto;
  border-radius: 6px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}
th,
td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  text-align: left;
  vertical-align: middle;
}

td {
  word-break: break-word; 
  overflow-wrap: break-word;
  white-space: normal;
  hyphens: auto;
}



.button-group {
  display: flex;
  flex-wrap: nowrap; 
  gap: 10px;     
  align-items: center;
}

.prev,
.next {
  width: 20px; 
  height: 30px; 
  display: flex; 
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.pagination {
  margin-top: 12px;
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
.error {
  color: red;
  font-size: 0.9rem;
  margin-top: 10px;
  text-align: center;
}
@media (max-width: 600px) {
  table,
  th,
  td {
    font-size: 14px;
  }
  button {
    padding: 8px 12px;
    font-size: 0.85rem;
    min-width: 70px;
  }
  .toolbar,
  .button-group,
  .pagination {
    gap: 8px;
  }

    .button-group {
    flex-direction: column; 
    align-items: stretch; 
  }
  .button-group button {
    width: 100%; 
  }
}
      </style>
    `;

    const totalPages = Math.max(1, Math.ceil(this.data.length / this.pageSize));
    if (this.page > totalPages) this.page = totalPages;
    const start = (this.page - 1) * this.pageSize;
    const pageRows = this.data.slice(start, start + this.pageSize);

    const headersHtml = this.columns
      .map((c) => `<th>${utilHtmlJuegos.escapeHtml(c.label || c)}</th>`)
      .join("");

    const rowsHtml = pageRows.length
      ? pageRows
        .map((item) => {
          const cells = this.columns.map((col) => {
            const key = col.key || col; // si col es objeto, usa su key
            if (this.editingId === item._id && this.editableColumns.includes(key)) {
              return `<td><textarea rows="3" style="width:100%; resize:vertical;" data-field="${key}">${utilHtmlJuegos.escapeHtml(item[key] ?? "")}</textarea></td>`;
            }
            return `<td>${utilHtmlJuegos.escapeHtml(item[key] ?? "")}</td>`;
          }).join("");


          const defaultButtons = [
            this.showEdit ? `<button data-action="edit" title="Editar este registro">✎ Editar</button>` : "",
            this.showDelete ? `<button data-action="delete" title="Eliminar este registro">🗑 Eliminar</button>` : "",
          ];

          const externalButtons = this.externalActions?.map((a) => {
            const tooltip = a.tooltip ? `title="${utilHtmlJuegos.escapeHtml(a.tooltip)}"` : "";
            return `<button data-action="${a.action}" ${tooltip}>${a.label}</button>`;
          }) || [];


          const buttonsHtml = this.editingId === item._id
            ? `<div class="button-group"><button data-action="save">🗀 Guardar</button><button data-action="cancel">✖ Cancelar</button></div>`
            : `<div class="button-group">${[...defaultButtons, ...externalButtons].join("")}</div>`;

          return `<tr data-id="${item._id}">${cells}<td>${buttonsHtml}</td></tr>`;
        })
        .join("")
      : `<tr><td colspan="${this.columns.length + 1}">No hay datos</td></tr>`;

    const paginationHtml = `
      <button class="prev" ${this.page <= 1 ? "disabled" : ""} data-action="prev">◀</button>
      <span>Página ${this.page} de ${totalPages}</span>
      <button class="next" ${this.page >= totalPages ? "disabled" : ""} data-action="next">▶</button>
    `;

    this.shadowRoot.innerHTML = `
      ${style}
      <div class="toolbar">
        ${this.showAdd ? `<button data-action="add" ${this.editingId !== null ? "disabled" : ""}>+ Agregar</button>` : ""}
        ${this.showRefresh ? `<button data-action="refresh">↻ Refrescar</button>` : ""}
      </div>
      <div class="table-container">
        <table>
          <thead><tr>${headersHtml}<th>Acciones</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
      <div class="pagination">${paginationHtml}</div>
      ${this.errorMessage ? `<div class="error">${utilHtmlJuegos.escapeHtml(this.errorMessage)}</div>` : ""}
    `;

    this.shadowRoot.querySelectorAll("button").forEach((btn) => btn.addEventListener("click", () => this._handleAction(btn)));
  }

  _handleAction(btn) {
    const action = btn.dataset.action;
    if (!action) return;

    const id = btn.closest("tr")?.dataset.id;
    const row = this.data.find((r) => r._id == id);

    if (this.externalActions?.some((a) => a.action === action)) {
      this.dispatchEvent(new CustomEvent("row-action", { detail: { action, row }, bubbles: true, composed: true }));
      return;
    }

    if (action === "refresh") {
      this.dispatchEvent(new CustomEvent("refresh-table", { bubbles: true, composed: true }));
      return;
    }

    if (action === "add") return this._startAdd();
    if (action === "prev") return this._changePage(this.page - 1);
    if (action === "next") return this._changePage(this.page + 1);

    if (!row) return;

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
      // Selecciona inputs y textareas
      const fields = Array.from(
        this.shadowRoot.querySelectorAll(`tr[data-id="${id}"] input, tr[data-id="${id}"] textarea`)
      );

      const newValues = {};
      fields.forEach((el) => {
        newValues[el.dataset.field] = el.value.trim();
      });

      const event = new CustomEvent("before-save-row", {
        detail: { row, newValues },
        bubbles: true,
        composed: true,
        cancelable: true
      });

      if (!this.dispatchEvent(event)) return;

      Object.assign(row, newValues);
      this.editingId = null;
      this._render();

      this.dispatchEvent(new CustomEvent("save-row", { detail: row, bubbles: true, composed: true }));
    }

    if (action === "cancel") {
      if (row._isNew) {
        this.data = this.data.filter((r) => r._id != id);
      }
      this.editingId = null;
      this._render();
    }

  }

  _startAdd() {
    if (this.editingId !== null) return;
    const newId = this.data.length ? Math.max(...this.data.map((r) => r._id)) + 1 : 0;
    const newRow = { _id: newId, _isNew: true };
    this.columns.forEach((c) => (newRow[c] = ""));
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

}

customElements.define("simple-table-component", SimpleTableComponent);