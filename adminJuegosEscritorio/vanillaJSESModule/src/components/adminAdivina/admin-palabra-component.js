export  class AdminPalabraComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._items = [];
        this._page = 1;
        this._itemsPerPage = 3;
        this._itemStates = new Map();

        this._defaultTexts = {
            placeholder: "Título del nuevo ítem principal...",
            addButton: "Añadir",
            itemsPerPageLabel: "Items por página:",
            noItems: "No hay ítems. Añade uno arriba.",
            subPlaceholder: "Añadir sub-elemento...",
            editButton: "Editar",
            deleteButton: "Eliminar",
            addSubButton: "Añadir",
            saveButton: "Guardar Cambios",
            saveTitle: "Guardar",
            cancelButton: "Cancelar",
            prev: "← Anterior",
            next: "Siguiente →",
            confirmDelete: "¿Eliminar bloque?",
            confirmDeleteSub: "¿Eliminar sub-elemento?",
            emptyTitle: "El título no puede estar vacío",
            emptySubItem: "El sub-elemento no puede estar vacío",
        };
        this._texts = { ...this._defaultTexts };
        this.shadowRoot.innerHTML = `
<style>
  :host { display:block; font-family:system-ui, -apple-system, "Segoe UI", Roboto, Arial; max-width:800px; margin:12px auto; }
  .title { font-size:1.5rem; font-weight:700; color:#333; margin-bottom:16px; }
  .card { padding:16px; border-radius:12px; background:#fff; box-shadow:0 4px 12px rgba(0,0,0,0.05); border:1px solid #e1e6f0; }
  header { display:flex; flex-direction:column; gap:8px; margin-bottom:12px; }
  .input-row { display:flex; gap:8px; flex-wrap:wrap; }
  input[type="text"], textarea { flex:1; padding:8px; border-radius:8px; border:1px solid #d6d6d6; font-family:inherit; }
  button { border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:600; }
  .btn-primary { background:#f2f4f6; color:rgb(0,0,0); }
  .btn-save { background:#2ecc71; color:white; }
  .btn-cancel { background:#f2f4f6; color:rgb(0,0,0); }
  .items-list { display:flex; flex-direction:column; gap:12px; }
  .item { border-left:6px solid #2ecc71; background:#f9f9f9; padding:12px; border-radius:8px; display:flex; flex-direction:column; gap:8px; }
  .title-row { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; flex-wrap:wrap; width:100%; }
  .title-text { font-weight:700; display:flex; align-items:center; gap:8px; min-width:0; flex:1; overflow:hidden; width:100%; }
  .title-content { min-width:0; width:100%; word-wrap:break-word; overflow-wrap:break-word; white-space:normal; max-width:100%; }
  .title-text span.check { color:#2ecc71; font-weight:900; }
  .btn-row { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; }
  .sublist { display:flex; flex-wrap:wrap; gap:6px; }
  .chip { padding:6px 8px; background:#f6f7fb; border-radius:999px; border:1px solid #e1e6f0; display:flex; align-items:center; gap:6px; font-size:0.9rem; }
  .pending-chip { background:#e6f3ff; border:1px solid #3498db; }
  .chip button { background:none; border:none; color:#d55; font-weight:700; cursor:pointer; padding:0 4px; }
  .add-sub { display:flex; gap:8px; align-items:center; margin-top:6px; }
  .save-row { display:flex; gap:8px; margin-top:8px; padding-top:8px; border-top:1px solid #e1e6f0; }
  .save-row.hidden { display:none; }
  .pagination { display:flex; justify-content:center; gap:8px; margin-top:12px; align-items:center; }
  .page-btn { padding:8px 12px; border-radius:8px; background:#3498db; color:white; cursor:pointer; }
  .page-btn[disabled] { background:#ccc; cursor:not-allowed; }
  .controls { display:flex; gap:8px; align-items:center; }
  .controls select { padding:6px 8px; border:1px solid #d6d6d6; border-radius:6px; }
</style>
<div class="card">
  <header>
    <div class="input-row">
      <input id="newItemInput" type="text">
      <button id="addItemBtn" class="btn-primary"></button>
    </div>
    <div class="controls">
      <label style="color:#888;font-size:0.9rem"></label>
      <select id="itemsPerPageSelect">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3" selected>3</option>
        <option value="4">4</option>
      </select>
    </div>
  </header>
  <section id="listArea" aria-live="polite">
    <div id="itemsList" class="items-list"></div>
<div class="pagination">
  <button id="prevBtn" class="page-btn"></button>
  <div id="pageInfo"></div>
  <button id="nextBtn" class="page-btn"></button>
</div>
  </section>
</div>`;
        this.$ = (sel) => this.shadowRoot.querySelector(sel);
    }

    static get observedAttributes() {
        return ["title"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "title" && this.shadowRoot) {
            const titleDiv = this.shadowRoot.querySelector(".title");
            if (titleDiv) titleDiv.textContent = newValue;
        }
    }

    connectedCallback() {
        const txt = {};
        [
            ["placeholder", "placeholder-text"],
            ["addButton", "add-button-text"],
            ["itemsPerPageLabel", "items-per-page-label-text"],
            ["subPlaceholder", "sub-placeholder-text"],
            ["editButton", "edit-button-text"],
            ["deleteButton", "delete-button-text"],
            ["addSubButton", "add-sub-button-text"],
            ["saveButton", "save-button-text"],
            ["cancelButton", "cancel-button-text"],
            ["prev", "prev-button-text"],
            ["next", "next-button-text"],
            ["confirmDelete", "confirm-delete-text"],
            ["emptyTitle", "empty-title-text"],
            ["emptySubItem", "empty-subitem-text"],
        ].forEach(([k, a]) => {
            const v = this.getAttribute(a);
            if (v !== null) txt[k] = v;
        });

        this._texts = { ...this._defaultTexts, ...txt };
        this._hidePagination = this.hasAttribute("hide-pagination");
        this._hideAddItem = this.hasAttribute("hide-add-item");
        this._hideDeleteButton = this.hasAttribute("hide-delete-button");

        // Crear título dinámico
        const t = this.getAttribute("title") || "Gestor de Items";
        const titleDiv = document.createElement("div");
        titleDiv.className = "title";
        titleDiv.textContent = t;

        const card = this.shadowRoot.querySelector(".card");
        if (card) {
            card.prepend(titleDiv);

            // Ocultar header si hide-add-item
            const header = card.querySelector("header");
            if (header && this._hideAddItem) header.style.display = "none";

            // Ocultar paginación si hide-pagination
            const paginacion = card.querySelector(".pagination");
            if (paginacion && this._hidePagination) paginacion.style.display = "none";
        }

        // Configurar textos
        const addItemBtn = this.$("#addItemBtn");
        if (addItemBtn) addItemBtn.textContent = this._texts.addButton;

        const label = this.$(".controls label");
        if (label) label.textContent = this._texts.itemsPerPageLabel;

        const input = this.$("#newItemInput");
        if (input) input.placeholder = this._texts.placeholder;

        const prev = this.$("#prevBtn");
        const next = this.$("#nextBtn");
        if (prev) prev.textContent = this._texts.prev;
        if (next) next.textContent = this._texts.next;

        this._bindGlobalEvents();
        this._render();
    }



    _bindGlobalEvents() {
        this.$("#addItemBtn").addEventListener("click", () =>
            this._addFromInput()
        );
        this.$("#newItemInput").addEventListener("keydown", (e) => {
            if (e.key === "Enter") this._addFromInput();
        });
        this.$("#itemsPerPageSelect").addEventListener("change", (e) => {
            this._itemsPerPage = parseInt(e.target.value, 10) || 3;
            this._page = Math.min(
                this._page,
                Math.ceil(this._items.length / this._itemsPerPage) || 1
            );
            this._render();
        });
        this.$("#prevBtn").addEventListener("click", () =>
            this.goToPage(this._page - 1)
        );
        this.$("#nextBtn").addEventListener("click", () =>
            this.goToPage(this._page + 1)
        );
    }

    _addFromInput() {
        const v = this.$("#newItemInput").value.trim();
        if (!v) {
            this._dispatch("validation-error", {
                message: this._texts.emptyTitle,
            });
            return;
        }
        const newItem = this.addItem(v);
        this._dispatch("item-saved", {
            titulo: v,
            isNew: true,
            id: newItem.id,
        });
        this.$("#newItemInput").value = "";
    }

    addItem(title) {
        const item = {
            id: crypto.randomUUID(),
            titulo: title.trim(),
            subItems: [],
        };
        this._items.push(item);
        this._page = Math.ceil(this._items.length / this._itemsPerPage);
        this._render();
        this._dispatch("item-added", { item });
        return item;
    }

    removeItem(idx) {
        const removed = this._items.splice(idx, 1)[0];
        this._itemStates.delete(removed.id);
        if (this._page > Math.ceil(this._items.length / this._itemsPerPage))
            this._page--;
        this._render();
        this._dispatch("item-removed", { item: removed });
        return true;
    }

    goToPage(p) {
        const total = Math.max(
            1,
            Math.ceil(this._items.length / this._itemsPerPage)
        );
        this._page = Math.min(Math.max(1, p), total);
        this._render();
    }

    getItems() {
        return JSON.parse(JSON.stringify(this._items));
    }

    loadItems(arr) {
        if (!Array.isArray(arr)) return;
        this._items = arr.map((item) => ({
            id: item.id ?? crypto.randomUUID(),
            titulo: item.titulo ?? "",
            subItems: Array.isArray(item.subItems)
                ? item.subItems.map((sub) =>
                    typeof sub === "string"
                        ? { id: crypto.randomUUID(), texto: sub }
                        : {
                            id: sub.id ?? crypto.randomUUID(),
                            texto: sub.texto ?? sub,
                        }
                )
                : [],
        }));
        this._page = 1;
        this._render();
    }

    _dispatch(name, detail) {
        this.dispatchEvent(
            new CustomEvent(name, { detail, bubbles: true, composed: true })
        );
    }

    _bindItemEvents(el, item, absIdx) {
        const editBtn = el.querySelector(".edit-btn");
        const delBtn = el.querySelector(".del-btn");
        const addSubBtn = el.querySelector(".add-sub-btn");
        const subInput = el.querySelector(".sub-input");

        let state = this._itemStates.get(item.id) || {
            editing: false,
            pendingSubItems: [],
            addingSubItem: false,
        };
        this._itemStates.set(item.id, state);

        if (editBtn) {
            editBtn.addEventListener("click", () => {
                state.editing = true;
                this._render();
            });
        }

        if (delBtn) {
            delBtn.addEventListener("click", async () => {
                if (!confirm(this._texts.confirmDelete)) return;
                this._dispatch("item-delete-requested", {
                    itemId: item.id,
                    absIdx,
                });
            });
        }

        if (addSubBtn && subInput) {
            addSubBtn.addEventListener("click", () => {
                const val = subInput.value.trim();
                if (!val) {
                    alert(this._texts.emptySubItem);
                    return;
                }
                state.pendingSubItems.push({
                    id: crypto.randomUUID(),
                    texto: val,
                });
                subInput.value = "";
                this._render();
            });
        }

        const subChips = el.querySelectorAll(".sublist .chip button");
        subChips.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const chipEl = e.target.closest(".chip");
                const subId = chipEl.dataset.id;

                const state = this._itemStates.get(item.id);
                if (state?.pendingSubItems) {
                    state.pendingSubItems = state.pendingSubItems.filter(
                        (s) => s.id !== subId
                    );
                }

                this._render();
            });
        });
    }

    _render() {
        const list = this.$("#itemsList");
        list.innerHTML = "";
        const total = this._items.length;
        const totalPages = Math.max(1, Math.ceil(total / this._itemsPerPage));
        if (this._page > totalPages) this._page = totalPages;

        if (total === 0) {
            list.innerHTML = `<div style="color:#888;padding:12px;text-align:center;border:1px dashed #eee;border-radius:8px;">${this._texts.noItems}</div>`;
        } else {
            const start = (this._page - 1) * this._itemsPerPage;
            const slice = this._items.slice(start, start + this._itemsPerPage);

            slice.forEach((item, relIdx) => {
                const absIdx = start + relIdx;
                const state = this._itemStates.get(item.id) || {
                    editing: false,
                    pendingSubItems: [],
                    addingSubItem: false,
                };

                const el = document.createElement("div");
                el.className = "item";

                if (state.editing) {
                    el.innerHTML = `
            <textarea class="edit-title">${item.titulo}</textarea>
            <div class="save-row">
              <button class="save-sub-btn btn-save">${this._texts.saveButton}</button>
              <button class="cancel-sub-btn btn-cancel">${this._texts.cancelButton}</button>
            </div>
          `;
                    el.querySelector(".save-sub-btn").addEventListener(
                        "click",
                        () => {
                            const val = el.querySelector(".edit-title").value.trim();
                            if (!val) {
                                alert(this._texts.emptyTitle);
                                return;
                            }
                            item.titulo = val;
                            state.editing = false;
                            this._render();
                            this._dispatch("item-saved", {
                                titulo: val,
                                isNew: false,
                                id: item.id,
                            });
                        }
                    );
                    el.querySelector(".cancel-sub-btn").addEventListener(
                        "click",
                        () => {
                            state.editing = false;
                            this._render();
                        }
                    );
                } else {
                    el.innerHTML = `
            <div class="title-row">
              <div class="title-text"><span class="check">✔</span><div class="title-content">${item.titulo
                        }</div></div>
            </div>
        <div class="btn-row">
  <button class="edit-btn btn-primary">${this._texts.editButton}</button>
  <button 
    class="del-btn btn-primary"
    style="display: ${this._hideDeleteButton ? "none" : "inline-block"}"
  >
    ${this._texts.deleteButton}
  </button>
</div>

            <div class="sublist">
              ${item.subItems
                            .map(
                                (s) =>
                                    `<div class="chip" data-id="${s.id}"><span>${s.texto}</span><button>×</button></div>`
                            )
                            .join("")}
              ${state.pendingSubItems
                            .map(
                                (s) =>
                                    `<div class="chip pending-chip" data-id="${s.id}"><span>${s.texto}</span><button>×</button></div>`
                            )
                            .join("")}
            </div>
            <div class="add-sub">
              <input class="sub-input" type="text" placeholder="${this._texts.subPlaceholder
                        }">
              <button class="add-sub-btn btn-primary">${this._texts.addSubButton
                        }</button>
            </div>
          `;

                    if (state.pendingSubItems.length) {
                        const confirmBtn = document.createElement("button");
                        confirmBtn.textContent = "Confirmar cambios";
                        confirmBtn.className = "btn-save";
                        confirmBtn.style.marginRight = "6px";

                        const cancelBtn = document.createElement("button");
                        cancelBtn.textContent = "Cancelar";
                        cancelBtn.className = "btn-cancel";

                        // AQUÍ: Solo dispara evento, nada más
                        confirmBtn.addEventListener("click", () => {
                            this._dispatch("subitems-save-requested", {
                                itemId: item.id,
                                subItems: state.pendingSubItems,
                            });
                        });

                        cancelBtn.addEventListener("click", () => {
                            state.pendingSubItems = [];
                            this._render();
                        });

                        el.appendChild(confirmBtn);
                        el.appendChild(cancelBtn);
                    }
                }

                list.appendChild(el);
                this._bindItemEvents(el, item, absIdx);
            });
        }

        this.$("#pageInfo").textContent = `${this._page} / ${totalPages}`;
        this.$("#prevBtn").disabled = this._page <= 1 || total === 0;
        this.$("#nextBtn").disabled = this._page >= totalPages || total === 0;
    }

    getAllSubItems(itemId) {
        const item = this._items.find((i) => i.id === itemId);
        if (!item) return [];
        const state = this._itemStates.get(itemId) || { pendingSubItems: [] };
        return [
            ...item.subItems.map((s) => ({ id: s.id, texto: s.texto })),
            ...(state.pendingSubItems || []).map((s) => ({
                id: s.id,
                texto: s.texto,
            })),
        ];
    }

    eliminarSubitemLocal(subId) {
        if (!subId) return false;
        let eliminado = false;

        this._items.forEach((item) => {
            const antes = item.subItems.length;
            item.subItems = item.subItems.filter((s) => s.id !== subId);
            if (item.subItems.length < antes) eliminado = true;

            const state = this._itemStates.get(item.id);
            if (state?.pendingSubItems) {
                const antesPend = state.pendingSubItems.length;
                state.pendingSubItems = state.pendingSubItems.filter(
                    (s) => s.id !== subId
                );
                if (state.pendingSubItems.length < antesPend) eliminado = true;
            }
        });

        if (eliminado) this._render();
        return eliminado;
    }
}
customElements.define("admin-palabra-component", AdminPalabraComponent);
