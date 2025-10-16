const tablaUsuarioComponent = document.getElementById("tabla-usuario-component");
tablaUsuarioComponent.config = {
    showAdd: false,
    showEdit: false,
    showDelete: true,
    showRefresh: true,
    columns: ["correo", "estado", "rol"],
};


// Cargar datos
async function cargarDatos() {
    const data = await UsuarioService.obtenerUsuarios();
    tablaUsuarioComponent.dataSource = data;
    console.log(tablaUsuarioComponent.dataSource);
}

cargarDatos();

tablaUsuarioComponent.addEventListener("before-delete-row", async (e) => {
    const confirmDelete = confirm("¿Seguro que quieres eliminar esta fila?");
    if (!confirmDelete) {
        e.preventDefault();
        return;
    }

    const correo = e.detail.correo;
    const ok = await UsuarioService.eliminarUsuario(correo);

    if (ok) {
        console.log("Usuario eliminado ✅");
    } else {
        alert("No se pudo eliminar el usuario");
    }

});


tablaUsuarioComponent.addEventListener("refresh-table", () => {
    cargarDatos();
});