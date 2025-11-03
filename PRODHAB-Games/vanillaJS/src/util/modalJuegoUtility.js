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
