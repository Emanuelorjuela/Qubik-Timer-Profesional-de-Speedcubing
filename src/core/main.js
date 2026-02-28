import { leer  } from "../database/crud.js"
import { dataDiv } from "../database/uiDB.js"


/*
 Función global que se ejecuta cuando la base de datos
 ya está inicializada y disponible.

 - Llama a leer() para obtener todos los registros guardados.
 - Recorre el array recibido.
 - Renderiza cada registro en el DOM usando dataDiv().
*/
window.onDBReady = (db) => {
    leer((array) => {
        array.forEach((item, idx) => {
            dataDiv(idx + 1, item.time, item.dnf, item.masDos)
        })
    })
}