
/* 
  Configuración de assets para juegos.
  ---------------------------------------------------------
  - Permite definir un rootPath configurable para anteponer 
    automáticamente una ruta base (CDN, servidor, carpeta) 
    a todos los recursos del juego.
  - Los assets se almacenan por tipo de juego en el objeto "juegos".
  - aplicarRoot() combina rootPath con cada archivo sin modificar
    los datos originales.
  - setRootPath(ruta): cambia la ruta base. Asegura que termine en "/".
  - setAtributosAssets(id, attrs): agrega o reemplaza assets de un juego.
  - getAtributos(id): devuelve los assets del juego concatenados
    con rootPath; si el juego no existe, devuelve null.
  - Ejemplo:
        setRootPath("https://cdn.misitio.com/");
        const assets = getAtributos(3);
        -> { img_intro: "https://cdn.misitio.com/public/images/..."}
*/

let rootPath = "";

export function setRootPath(nuevaRuta) {
    rootPath = nuevaRuta.endsWith("/") ? nuevaRuta : nuevaRuta + "/";
}

const juegos = {
    1: { correcta_svg: "public/images/correcta.svg", incorrecta_svg: "public/images/incorrecta.svg", character_png: "public/images/superdato_2.png" },
    2: { video_final_src: "public/video/super_dato_sonrie.webm", inicio_video_src: "public/video/super_dato_saluda.webm" },
    3: { img_intro: "public/images/superdato_1.png", webm_final: "public/video/superdato_escribe.webm", img_rondas: "public/images/superdato_manos_cintura.png" },
    4: { modal1_video: "public/video/superdato_anotando.webm", modal2_video: "public/video/superdato_idea.webm", superdato_img: "public/images/superdato_señalando.png" },
    5: { img_menu: "public/images/super.png" }

};

function aplicarRoot(juego) {
    const resultado = {};

    for (const key in juego) {
        resultado[key] = rootPath + juego[key];
    }
    return resultado;
}

export function setAtributosAssets(idTipoJuego, nuevosAtributos = {}) {
    if (!juegos[idTipoJuego]) return;
    juegos[idTipoJuego] = { ...juegos[idTipoJuego], ...nuevosAtributos };
}

export function getAtributos(idTipoJuego) {
    if (!juegos[idTipoJuego]) return null;
    return aplicarRoot(juegos[idTipoJuego]);
}


//setRootPath('http://localhost:8080/')