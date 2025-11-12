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


const utilModalJuegos2 = (() => {

    function mostrarMensajeModal(title, message, onConfirm = null) {
        // Crear overlay
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.background = "rgba(0,0,0,0.6)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "9999";
        overlay.style.backdropFilter = "blur(2px)";
        overlay.style.opacity = "0";
        overlay.style.pointerEvents = "none";
        overlay.style.transition = "opacity 0.3s";

        // Crear modal
        const modal = document.createElement("div");
        modal.style.background = "#ffffffff";
        modal.style.padding = "20px";
        modal.style.borderRadius = "12px";
        modal.style.minWidth = "300px";
        modal.style.maxWidth = "90%";
        modal.style.boxSizing = "border-box";
        modal.style.position = "relative";
        modal.style.transform = "translateY(-20px)";
        modal.style.transition = "transform 0.3s";
        modal.style.fontFamily = "Raleway, arial, sans-serif";

        // Contenido
        const h2 = document.createElement("h2");
        h2.textContent = title;
        const p = document.createElement("p");
        p.textContent = message;

        // Botones
        const btnCerrar = document.createElement("button");
        btnCerrar.textContent = "Cerrar";
        btnCerrar.style.margin = "0.5rem 0.3rem 0 0";
        btnCerrar.style.padding = "0.4rem 0.8rem";
        btnCerrar.style.borderRadius = "0.6rem";
        btnCerrar.style.border = "none";
        btnCerrar.style.cursor = "pointer";
        btnCerrar.style.background = "#ccc";

        const btnConfirm = document.createElement("button");
        btnConfirm.textContent = "Aceptar";
        btnConfirm.style.margin = "0.5rem 0.3rem 0 0";
        btnConfirm.style.padding = "0.4rem 0.8rem";
        btnConfirm.style.borderRadius = "0.6rem";
        btnConfirm.style.border = "none";
        btnConfirm.style.cursor = "pointer";
        btnConfirm.style.background = "#2d2d6b";
        btnConfirm.style.color = "#fff";


        // Insertar contenido y botones
        modal.appendChild(h2);
        modal.appendChild(p);
        modal.appendChild(btnCerrar);
        if (onConfirm) modal.appendChild(btnConfirm);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Animación de aparición
        requestAnimationFrame(() => {
            overlay.style.opacity = "1";
            overlay.style.pointerEvents = "auto";
            modal.style.transform = "translateY(0)";
        });
        document.body.style.overflow = "hidden";

        // Función de cierre
        const closeModal = () => {
            overlay.style.opacity = "0";
            modal.style.transform = "translateY(-20px)";
            setTimeout(() => overlay.remove(), 300);
            document.body.style.overflow = "auto";
        };

        btnCerrar.onclick = closeModal;

        if (onConfirm) {
            btnConfirm.onclick = () => {
                onConfirm();
                closeModal();
            };
        }

        // Cerrar si clic fuera del modal
        overlay.onclick = e => {
            if (e.target === overlay) closeModal();
        };
    }

    return { mostrarMensajeModal };

})();


const utilHtmlJuegos = (() => {

    function escapeHtml(html) {
        const txt = document.createElement("textarea");
        txt.textContent = html;
        return txt.innerHTML;
    }

    function decodeHtml(html) {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
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