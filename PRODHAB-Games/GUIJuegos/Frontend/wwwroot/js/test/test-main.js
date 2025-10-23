/**
 * script para los eventos principales del test
 * @version 12/09/2025
 * 
 */


// Configura el botón de reinicio para que al hacer clic se reinicie el examen
btnReiniciar.addEventListener("click", reiniciarExamen);


/**
 * Espera a que el DOM esté completamente cargado antes de ejecutar cualquier código.
 *
 * @description
 * - Selecciona todos los elementos <button> de la página.
 * - Agrega un efecto visual al hacer clic: reduce temporalmente el tamaño del botón (escala 0.98)
 *   y luego lo restaura después de 150 ms.
 * - Llama a `iniciarTest()` para cargar y mostrar la primera pregunta del test una vez que el DOM está listo.
 */
document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll("button");
    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            this.style.transform = "scale(0.98)";
            setTimeout(() => {
                this.style.transform = "";
            }, 150);
        });
    });

    iniciarTest();
});

