

const juegosAssets = (() => {

    const juegos = {
        1: { correcta_svg: "public/images/correcta.svg", incorrecta_svg: "public/images/incorrecta.svg", character_png: "public/images/superdato_2.png" },
        2: { video_final_src: "public/video/super_dato_sonrie.webm", inicio_video_src: "public/video/super_dato_saluda.webm" },
        3: { img_intro: "public/images/superdato_1.png", webm_final: "public/video/superdato_escribe.webm", img_rondas: "public/images/superdato_manos_cintura.png" },
        4: { modal1_video: "public/video/superdato_anotando.webm", modal2_video: "public/video/superdato_idea.webm", superdato_img: "public/images/superdato_señalando.png" },
    };
    function setAtributosAssets(idTipoJuego, nuevosAtributos = {}) {
        if (!juegos[idTipoJuego]) return;
        juegos[idTipoJuego] = { ...juegos[idTipoJuego], ...nuevosAtributos };
    }

    function getAtributos(idTipoJuego) {
        return juegos[idTipoJuego] || null;
    }

    return { setAtributosAssets, getAtributos };

})();
