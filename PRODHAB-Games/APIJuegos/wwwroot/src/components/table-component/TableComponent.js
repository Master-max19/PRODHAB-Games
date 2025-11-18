
class TableComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.data = [];
    this.columns = [];
    this.hiddenColumns = [];

    this.page = 1;
    this.pageSize = 5;
    this.editingRowId = null;
    this._nextId = 1;
    this._onClick = this._onClick.bind(this);
    this._onChangePageSize = this._onChangePageSize.bind(this);
  }

  connectedCallback() {
    const eventName = this.id || "table-component-ready";
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail: { tabla: this }
    }));

    this._deriveColumns();
    this._render();
    this.shadowRoot.addEventListener("click", this._onClick);
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("click", this._onClick);
  }
  set columnNames(obj) {
    this._columnNames = obj;
    this._render();
  }


  set dataSource(arr) {
    if (Array.isArray(arr)) {
      this.data = arr.map((r) => {
        if (r._id == null) r._id = this._nextId++;
        return { ...r };
      });
      this._deriveColumns();
      this.page = 1;
      this._render();
    }
  }

  _deriveColumns() {
    const keys = new Set(this.columns);
    this.data.forEach((row) =>
      Object.keys(row).forEach((k) => {
        if (!k.startsWith("_")) keys.add(k);
      })
    );
    this.columns = [...keys];
  }

  _onClick(e) {
    const t = e.target;
    const action = t.closest("[data-action]");
    if (!action) return;
    const act = action.dataset.action;
    const id = action.closest("[data-row-id]")?.dataset.rowId;
    if (act === "add") return this._addRow();
    if (act === "prev") return this._changePage(this.page - 1);
    if (act === "next") return this._changePage(this.page + 1);
    if (act === "delete") return this._deleteRow(Number(id));
    if (act === "edit") return this._startEdit(Number(id));
    if (act === "save") return this._saveRow(Number(id));
    if (act === "cancel") return this._cancelEdit(Number(id));
    if (act === "goto")
      return this._gotoPage(Number(action.dataset.page));
  }

  _onChangePageSize(e) {
    this.pageSize = Number(e.target.value) || 5;
    this.page = 1;
    this._render();
  }

  _render() {
    const total = this.data.length;
    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    if (this.page > totalPages) this.page = totalPages;
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    const pageRows = this.data.slice(start, end);

    const style = `

:host {
  font-family: "Raleway", Arial, sans-serif;
  display: flex;
  justify-content: center; 
  padding: 12px;
  box-sizing: border-box;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
  width: 100%;
  max-width: 1200px; 
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.toolbar .left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar .right {
  display: flex;
  align-items: center;
  gap: 8px;
}

button,
select {
  font: inherit;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
}

button.primary {
  background: rgb(31, 67, 136);
  color: white;
  border: none;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  margin: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  table-layout: fixed;
  word-wrap: break-word;
  margin: 0;
}

th,
td {
  padding: 10px 8px;
  border-bottom: 1px solid #eef2f6;
  text-align: left;
  white-space: normal;
  word-break: break-word; 
  vertical-align: middle;
  min-height: 40px; 
}

th {
  font-weight: 600;
  color: #374151;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.01), transparent);
}

td.actions {
  white-space: nowrap;
}

td input.inline-input {
  width: 100%; 
  height: 32px; 
  box-sizing: border-box;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-size: 0.95rem;
  font-family: inherit;
}

.pagination {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end; 
}

.pages {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.muted {
  color: #6b7280;
  font-size: 0.9rem;
}

.inline-input {
  width: 100%;
  box-sizing: border-box;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.small {
  font-size: 0.85rem;
}

@media (max-width: 500px) {
  .card {
    padding: 8px;
  }

  .table-wrap {
    width: 100%;
    overflow-x: auto; 
  }

  table,
  thead,
  tbody,
  th,
  td,
  tr {
    display: block;
    width: 100%;
    box-sizing: border-box;
    margin: 0;
  }

  tr {
    margin-bottom: 12px;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 10px;
  }

  td {
    display: flex;
    justify-content: space-between;
    padding: 6px 8px;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  th,
  td {
    padding: 10px 8px;
    border-bottom: 1px solid #eef2f6;
    text-align: left;
    white-space: normal;
    word-break: normal;
    overflow-wrap: break-word;
    vertical-align: middle;
    min-height: 40px;
  }

  td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #555;
    flex: 1;
    margin-right: 10px;
  }

  th {
    display: none;
  }

  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .pagination {
    justify-content: center;
    width: 100%;
    margin-top: 10px;
  }
}

    `;

    const visibleCols = this.columns.filter(
      (c) => !this.hiddenColumns?.includes(c)
    );

    const headerCols = visibleCols
      .map((c) => `<th>${this._pretty(c)}</th>`)
      .join("");

    const header = `
      <div class="toolbar">
        <div class="left">
          <button data-action="add" class="primary">+ Agregar</button>
          <div class="small muted">Filas: ${total}</div>
        </div>
        <div>
          <label class="small muted" style="margin-right:8px">Tamaño:</label>
          <select id="pageSizeSelect" class="small">
            <option value="3"${this.pageSize === 3 ? " selected" : ""
      }>3</option>
            <option value="5"${this.pageSize === 5 ? " selected" : ""
      }>5</option>
            <option value="10"${this.pageSize === 10 ? " selected" : ""
      }>10</option>
            <option value="20"${this.pageSize === 20 ? " selected" : ""
      }>20</option>
          </select>
        </div>
      </div>
    `;

    const rowsHtml =
      pageRows
        .map((row) => {
          const rid = row._id;
          const isEditing = this.editingRowId === rid;
          const cells = visibleCols
            .map((col) => {
              const val = row[col] ?? "";
              return isEditing
                ? `<td data-label="${this._pretty(col)}">
  <input data-col="${col}" class="inline-input" value="${utilHtmlJuegos.escapeAttr(val)}">
</td>
`
                : `<td data-label="${this._pretty(col)}">${val === "" ? "" : utilHtmlJuegos.escapeHtml(val)
                }</td>`;
            })
            .join("");
          const actions = isEditing
            ? `<td data-label="Acciones" class="actions"><button data-action="save">Guardar</button><button data-action="cancel" style="margin-left:6px">✖</button></td>`
            : `<td data-label="Acciones" class="actions"><button data-action="edit">Editar</button><button data-action="delete" style="margin-left:6px">Eliminar</button></td>`;
          return `<tr data-row-id="${rid}" data-db-id="${row.id ?? ""
            }">${cells}${actions}</tr>`;
        })
        .join("") ||
      `<tr><td colspan="${this.columns.length + 1
      }" class="muted small">No hay registros.</td></tr>`;

    const paginationHtml = this._paginationControls(total, totalPages);

    this.shadowRoot.innerHTML = `
      <style>${style}</style>
      <div class="card">
        ${header}
        <div class="table-wrap">
          <table>
            <thead><tr>${headerCols}<th style="width:160px">Acciones</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
        <div class="toolbar" style="margin-top:10px;justify-content:space-between;flex-wrap:wrap">
          <div class="pagination">${paginationHtml}</div>
          <div class="small muted">Página ${this.page} de ${totalPages}</div>
        </div>
      </div>
    `;

    const sel = this.shadowRoot.getElementById("pageSizeSelect");
    if (sel) sel.addEventListener("change", this._onChangePageSize);

    if (this.editingRowId != null) {
      const firstInput = this.shadowRoot.querySelector(
        `[data-row-id="${this.editingRowId}"] input`
      );
      if (firstInput) firstInput.focus();
    }
  }

  _paginationControls(total, totalPages) {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(1, this.page - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start < maxButtons - 1)
      start = Math.max(1, end - maxButtons + 1);
    for (let p = start; p <= end; p++)
      pages.push(
        `<button data-action="goto" data-page="${p}"${p === this.page
          ? ' style="font-weight:700;background:#eef2ff"'
          : ""
        }>${p}</button>`
      );
    return `<button data-action="prev"${this.page <= 1 ? " disabled" : ""
      }>◀</button><span class="pages">${pages.join(
        ""
      )}</span><button data-action="next"${this.page >= totalPages ? " disabled" : ""
      }>▶</button>`;
  }

  _changePage(n) {
    const totalPages = Math.max(
      1,
      Math.ceil(this.data.length / this.pageSize)
    );
    if (n < 1 || n > totalPages) return;
    this.page = n;
    this._render();
  }
  _gotoPage(n) {
    this._changePage(n);
  }

  _addRow() {
    if (this.editingRowId !== null) return;


    if (this.columns.length === 0) {
      this.columns = Object.keys(this._columnNames || {});
    }

    const newRow = {};
    this.columns.forEach((c) => (newRow[c] = ""));
    newRow._id = this._nextId++;
    newRow._isNew = true;
    this.data.unshift(newRow);
    this.editingRowId = newRow._id;
    this.page = 1;
    this._deriveColumns();
    this._render();
  }


  _startEdit(id) {
    this.editingRowId = id;
    this._render();
  }

  _saveRow(id) {
    const rowEl = this.shadowRoot.querySelector(`[data-row-id="${id}"]`);
    if (!rowEl) return;

    const inputs = rowEl.querySelectorAll("input[data-col]");
    const newData = {};
    inputs.forEach((inp) => (newData[inp.dataset.col] = inp.value ?? ""));

    const row = this.data.find((r) => r._id === id);
    const wasNew = row._isNew || false;

    const event = new CustomEvent("row-save-request", {
      detail: { id, row: { ...row, ...newData }, isNew: wasNew },
      cancelable: true,
    });

    if (!this.dispatchEvent(event)) return;

    Object.assign(row, newData);
    delete row._isNew;
    this.editingRowId = null;
    this._deriveColumns();
    this._render();

    this.dispatchEvent(
      new CustomEvent("row-saved", {
        detail: { id, row: { ...row }, isNew: wasNew },
      })
    );
  }

  _deleteRow(id) {
    const event = new CustomEvent("row-delete-request", {
      detail: { id },
      cancelable: true,
    });

    if (!this.dispatchEvent(event)) {
      return;
    }

    this.data = this.data.filter((r) => r._id !== id);
    this._render();
    this.dispatchEvent(
      new CustomEvent("row-deleted", { detail: { id } })
    );
  }

  _cancelEdit(id) {
    const row = this.data.find((r) => r._id === id);
    if (!row) return;
    const isBlank = this.columns.every((c) => (row[c] ?? "") === "");
    if (isBlank) this.data = this.data.filter((r) => r._id !== id);
    this.editingRowId = null;
    this._render();
  }

  _pretty(key) {
    if (!key) return "";
    if (this._columnNames && this._columnNames[key]) return this._columnNames[key];
    return String(key)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

customElements.define("table-component", TableComponent);