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

    return {
        escapeHtml,
        decodeHtml
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