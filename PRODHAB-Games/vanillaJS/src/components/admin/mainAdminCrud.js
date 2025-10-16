
(() => {
    // Referencias privadas
    const form = option2.querySelector("form-test-component");
    const modal = document.getElementById("modal-admin-crud");
    const viewer = option2.querySelector("test-viewer-component");

    // Asignaciones seguras
    if (form) {
        form.modal = modal;
        form.testViewer = viewer;
    }

    if (viewer) {
        viewer.modal = modal;
    }
})();
