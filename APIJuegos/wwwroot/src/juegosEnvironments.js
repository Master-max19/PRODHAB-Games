/*
  Módulo de configuración global para los juegos PRODHAB.
  ------------------------------------------------------------
  • Permite manejar entornos (development / production) con sus
    respectivas propiedades como apiUrl y modo debug.

  • Implementa un patrón Singleton mediante la variable "instance":
    siempre devuelve la misma configuración sin crear nuevos objetos.

  • La configuración activa se guarda automáticamente en localStorage
    bajo la clave "juego_prodhab_config" para persistencia entre recargas.

  • Propiedades principales:
        - current: objeto con la configuración del entorno activo.
        - jsonUrl: si se establece, el sistema usará un archivo JSON
                   local para cargar juegos; si es null, usa la API.

  • Métodos públicos:
        - setEnvironment(envName): cambiar entre 'development' y 'production'.
        - setApiUrl(url): modificar la URL base de la API.
        - setJsonUrl(urlOrNull): definir un archivo JSON local o volver a API.
        - apiUrl (getter): obtener la URL actual.
        - debug (getter): saber si el modo debug está activo.
        - getJsonUrl(): obtener el archivo JSON configurado.

  • Comportamiento de carga:
        - Si existe config en localStorage → se usa.
        - Si no existe → se carga el entorno "production" por defecto.

  • Ejemplo de uso:
        CONFIG_JUEGO_PRODHAB.setEnvironment("development");
        CONFIG_JUEGO_PRODHAB.setJsonUrl("juegos.json");
        console.log(CONFIG_JUEGO_PRODHAB.apiUrl);

  • Resultado:
        export const CONFIG_JUEGO_PRODHAB = new Config();
        → instancia única accesible desde todo el proyecto.
*/

const SERVER = "";//Toma en cuenta la raiz del directorio (No hay necesidad de indicar la URL API AL ESTAR EN WWWROOT y asp.net)

const ENVIRONMENTS = {
    development: {
        apiUrl: SERVER,
        debug: true,
    },
    production: {
        apiUrl: SERVER,
        debug: false,
    }
};

let instance = null;

export class Config {
    constructor() {
        if (instance) return instance;

        const stored = localStorage.getItem("juego_prodhab_config");

        if (stored) {
            try {
                this.current = JSON.parse(stored);
            } catch {
                console.warn("No se pudo parsear localStorage, usando production por defecto");
                this.current = { ...ENVIRONMENTS.production };
            }
        } else {
            this.current = { ...ENVIRONMENTS.production };
        }
        this.jsonUrl = ""; // si es null, usa API

        instance = this;
    }

    setEnvironment(envName) {
        if (ENVIRONMENTS[envName]) {
            this.current = { ...ENVIRONMENTS[envName] };
            this._save();
        } else {
            console.warn(`Entorno "${envName}" no existe.`);
        }
    }

    setApiUrl(newUrl) {
        this.current.apiUrl = newUrl;
        this._save();
        console.log(`URL actualizada a: ${newUrl}`);
    }

    setJsonUrl(urlOrNull) {
        if (urlOrNull && typeof urlOrNull === "string") {
            this.jsonUrl = urlOrNull;
        } else {
            this.jsonUrl = null;
        }
    }

    get apiUrl() {
        return this.current.apiUrl;
    }

    get debug() {
        return this.current.debug;
    }

    getJsonUrl() {
        return this.jsonUrl; // puede ser string o null
    }

    _save() {
        try {
            localStorage.setItem("juego_prodhab_config", JSON.stringify(this.current));
        } catch (err) {
            console.error("No se pudo guardar configuración en localStorage", err);
        }
    }
}

export const CONFIG_JUEGO_PRODHAB = new Config();

//CONFIG_JUEGO_PRODHAB.setApiUrl("http://192.XX.XX.XX:5133")

// SI usa setApiUrl y quiere restablecer elimine el localstorage o vuelva a setear el valor por defecto