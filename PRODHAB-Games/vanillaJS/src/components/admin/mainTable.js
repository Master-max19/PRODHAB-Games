
function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

window.addEventListener("DOMContentLoaded", async () => {
    const tabla = document.getElementById("miTabla");
    tabla.hiddenColumns = ["id", "idJuegos"];


    const cargarDatos = async () => {
        const data = await RangoEvaluacionService.obtenerPorJuego(1);

        // Decodificar HTML si es necesario
        tabla.dataSource = data.map((u) => ({
            id: u.id,
            idJuegos: u.idJuegos,
            rangoMinimo: u.rangoMinimo,
            rangoMaximo: u.rangoMaximo,
            mensaje: decodeHtml(u.mensaje),
        }));
    };


    tabla.columnNames = {
        rangoMaximo: "Rango máximo",
        rangoMinimo: "Rango mínimo"
    };
    await cargarDatos();


    tabla.addEventListener("row-save-request", async (e) => {
        e.preventDefault();
        const { row, isNew, id } = e.detail;

        try {
            if (isNew) {
                const creado = await RangoEvaluacionService.crear({
                    idJuegos: 1,
                    rangoMinimo: row.rangoMinimo,
                    rangoMaximo: row.rangoMaximo,
                    mensaje: row.mensaje,
                });

                const fila = tabla.data.find((r) => r._id === id);
                Object.assign(fila, { ...row, id: creado.id });
                delete fila._isNew;

                tabla.editingRowId = null;
                tabla._render();
                console.log("Rango creado:", creado);
            } else {
                const editado = await RangoEvaluacionService.editar(row.id, {
                    rangoMinimo: Number(row.rangoMinimo),
                    rangoMaximo: Number(row.rangoMaximo),
                    mensaje: row.mensaje,
                });

                if (editado) {
                    const fila = tabla.data.find((r) => r.id === row.id);
                    Object.assign(fila, row);
                    tabla.editingRowId = null;
                    tabla._render();

                }

                console.log("Rango actualizado:", editado);
            }
        } catch (err) {
            alert(err.message);
        }
    });

    tabla.addEventListener("row-delete-request", async (e) => {
        const idInterno = e.detail.id;
        const rowEl = tabla.shadowRoot.querySelector(
            `[data-row-id="${idInterno}"]`
        );
        const idReal = rowEl?.dataset.dbId;

        if (!idReal) {
            alert("No se encontró el ID del backend para eliminar.");
            e.preventDefault();
            return;
        }

        if (!confirm("¿Seguro que quieres eliminar esta fila?")) {
            e.preventDefault();
            return;
        }

        try {
            await RangoEvaluacionService.eliminar(idReal);
            await cargarDatos();
            console.log("Fila eliminada:", idReal);
        } catch (error) {
            e.preventDefault();
            console.error("No se pudo eliminar la fila:", error);
            alert("No se pudo eliminar la fila");
        }
    });
});