const utilModalJuegos = (() => {
    function mostrarMensajeModal(title, content, onConfirm = null) {
        const modal = document.getElementById("modal-admin-crud");
        if (!modal) {
            console.warn("No se encontró el modal global");
            return;
        }

        modal.open(
            {
                title: title,
                content: content,
                confirm: !!onConfirm
            },
            onConfirm
        );
    }

    return { mostrarMensajeModal }; // Solo esto se expone
})();


// ==========================
//   BASE DE MODALES
// ==========================
function crearBaseModal() {
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "9999",
        backdropFilter: "blur(2px)",
        opacity: "0",
        pointerEvents: "none",
        transition: "opacity 0.3s"
    });

    const modal = document.createElement("div");
    Object.assign(modal.style, {
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        minWidth: "300px",
        maxWidth: "40%",
        boxSizing: "border-box",
        position: "relative",
        transform: "translateY(-20px)",
        transition: "transform 0.3s",
        fontFamily: "Raleway, arial, sans-serif",
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.style.opacity = "1";
        overlay.style.pointerEvents = "auto";
        modal.style.transform = "translateY(0)";
    });

    document.body.style.overflow = "hidden";

    function closeModal() {
        overlay.style.opacity = "0";
        modal.style.transform = "translateY(-20px)";
        document.body.style.overflow = "auto";
    }

    overlay.addEventListener("transitionend", (e) => {
        if (e.propertyName === "opacity" && overlay.style.opacity === "0") {
            overlay.remove();
        }
    });

    return { overlay, modal, closeModal };
}

// ==========================
//   BOTÓN REUTILIZABLE
// ==========================
function crearBoton(texto, bg, color = "#000") {
    const btn = document.createElement("button");
    btn.textContent = texto;
    Object.assign(btn.style, {
        margin: "0.5rem 0.3rem 0 0",
        padding: "0.4rem 0.8rem",
        borderRadius: "0.6rem",
        border: "none",
        cursor: "pointer",
        background: bg,
        color: color
    });
    return btn;
}

// ==========================
//   MODAL SIMPLE
// ==========================
const utilModalJuegos2 = (() => {

    function mostrarMensajeModal(title, message, onConfirm = null) {

        const { modal, overlay, closeModal } = crearBaseModal();

        const h2 = document.createElement("h2");
        h2.textContent = title;

        const p = document.createElement("p");
        p.textContent = message;

        const btnCerrar = crearBoton("Cerrar", "#ccc");
        const btnConfirm = crearBoton("Aceptar", "#2d2d6b", "#fff");

        btnCerrar.onclick = closeModal;
        if (onConfirm) btnConfirm.onclick = () => { onConfirm(); closeModal(); };

        modal.append(h2, p, btnCerrar);
        if (onConfirm) modal.append(btnConfirm);

        // Cerrar clic afuera
        overlay.addEventListener("click", e => {
            if (e.target === overlay) closeModal();
        });
    }

    return { mostrarMensajeModal };

})();


const utilModalJuegos3 = (() => {

    function mostrarModalConInput(title, message, options = {}, onConfirm = null) {
        const { type = "text", placeholder = "", value = "" } = options;

        const { modal, overlay, closeModal } = crearBaseModal();

        const h2 = document.createElement("h2");
        h2.textContent = title;

        const p = document.createElement("p");
        p.textContent = message;

        const input = document.createElement("input");
        input.type = type;
        input.placeholder = placeholder;
        input.value = value;

        Object.assign(input.style, {
            width: "95%",
            padding: "8px",
            margin: "10px 0",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "1rem"
        });

        const btnCerrar = crearBoton("Cancelar", "#ccc");
        const btnConfirm = crearBoton("Aceptar", "#2d2d6b", "#fff");

        btnCerrar.onclick = closeModal;
        btnConfirm.onclick = () => { if (onConfirm) onConfirm(input.value); closeModal(); };

        modal.append(h2, p, input, btnCerrar, btnConfirm);
    }

    return { mostrarModalConInput };

})();


const utilHtmlJuegos = (() => {



    function escapeHtml(str) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '`': '&#96;',
            '/': '&#47;'
        };

        return String(str ?? "").replace(/[&<>"'`/]/g, c => map[c]);
    }

    function decodeHtml(str) {
        return String(str ?? "")
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#96;/g, "`")
            .replace(/&#47;/g, "/");
    }


    function escapeAttr(str) {
        if (str == null) return "";

        return String(str)
            .replace(/&/g, "&amp;")      // Siempre primero
            .replace(/"/g, "&quot;")     // Comillas dobles
            .replace(/'/g, "&#39;")      // Comillas simples
            .replace(/</g, "&lt;")       // Menor que
            .replace(/>/g, "&gt;")       // Mayor que
            .replace(/`/g, "&#96;")      // Backtick
            .replace(/\//g, "&#47;");    // Slash (opcional)
    }


    function mezclar(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }


    return {
        escapeHtml,
        decodeHtml,
        escapeAttr,
        mezclar
    };

})();



const utilValidacionesJuegos = (() => {

    function validarSubItems(gestor, itemId, subItems, max = 200) {
        const invalidosMax = subItems.filter(s => s.texto.length > max);
        const invalidosEspacios = subItems.filter(s => s.texto.includes(" "));
        if (invalidosMax.length === 0 && invalidosEspacios.length === 0) {
            return true;
        }

        if (invalidosMax.length > 0) {
            utilModalJuegos.mostrarMensajeModal(
                "Error",
                `${invalidosMax.length} subitems superan el límite de ${max} caracteres.`
            );
        }

        if (invalidosEspacios.length > 0) {
            utilModalJuegos.mostrarMensajeModal(
                "Error",
                `${invalidosEspacios.length} subitems contienen espacios. Solo se permiten palabras sin espacios.`
            );
        }

        // Revertir visualmente los inválidos
        const items = gestor.getItems();
        const item = items.find(i => String(i.id) === String(itemId));

        if (item) {
            const idsInvalidos = [
                ...invalidosMax.map(x => x.id),
                ...invalidosEspacios.map(x => x.id)
            ];

            item.subItems = item.subItems.filter(
                s => !idsInvalidos.includes(s.id)
            );

            gestor.loadItems(items);
        }

        return false;
    }




    function validarYRevertirTitulo(gestor, titulo, id, max = 600) {
        if (titulo.length <= max) return true;

        utilModalJuegos.mostrarMensajeModal(
            "Error",
            `El texto no puede ser mayor a ${max} letras.`
        );

        const items = gestor.getItems().filter((item) => item.id !== id);
        gestor.loadItems(items);
        return false;
    }


    function validarLongitud(texto, max, mensajeError) {
        if (typeof texto !== "string") return true;

        if (texto.length > max) {
            utilModalJuegos.mostrarMensajeModal("Error", mensajeError);
            return false;
        }

        return true;
    }
    return {
        validarSubItems,
        validarYRevertirTitulo,
        validarLongitud
    };
})();



const utilFetch = (() => {

    async function apiFetch(url, options = {}) {
        // Construir headers combinando los existentes con Authorization si hay token
        const headers = {
            ...(options.headers || {}),
        };

        try {

            const res = await fetch(url, { ...options, headers, credentials: "include" });
            if (res.status === 401) {
                sessionStorage.removeItem("sesion_admin_juegos_prodhab");
                const loginCard = document.querySelector(".fondo-login");
                let sidenav = document.querySelector("side-nav-component");
                if (sidenav) {
                    sidenav.style.display = 'none';
                }

                if (loginCard) {
                    loginCard.style.display = 'block';

                }
                return null;
            }

            const text = await res.text();
            if (!res.ok) {
                let errorData;
                try { errorData = JSON.parse(text); } catch (e) { errorData = null; }
                throw new Error(errorData?.message || `Error en la petición: ${res.status}`);
            }

            if (!text) return null;

            try {
                return JSON.parse(text);
            } catch (e) {
                return text;
            }

        } catch (err) {
            console.error("Error en apiFetch:", err);
            throw err;
        }
    }

    return { apiFetch };
})();
