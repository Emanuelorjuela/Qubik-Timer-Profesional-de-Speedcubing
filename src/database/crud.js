import { db } from "./dbInit.js"
import { dataDiv, archivador } from "./uiDB.js"
import { promedios_front } from "../averages/promUi.js"

/*
 Añade un objeto de promedio a la objectStore "promDB".
 No maneja eventos de éxito o error explícitamente.
*/
export const añadirProm = (obj) => {
    let transaccion = db.transaction("promDB", "readwrite")
    let confirmar = transaccion.objectStore("promDB")
    
    let request = confirmar.add(obj)
}

/*
 Añade un nuevo registro a la objectStore "cube3x3".
 - Si la operación es exitosa:
    - Calcula el índice visual.
    - Renderiza el nuevo registro en el DOM con dataDiv.
    - Actualiza los promedios en el frontend.
 - Maneja errores de request y transacción.
*/
export const añadir = (obj) => {

    let transaccion = db.transaction("cube3x3", "readwrite")
    let confirmar = transaccion.objectStore("cube3x3")
    
    let request = confirmar.add(obj)

    request.onsuccess = (e) => {
        let datas = document.querySelectorAll(".data")
        let idx = datas.length + 1
        dataDiv(idx, obj.time)
        console.log(datas)
        promedios_front()
    }
    
    request.onerror = (e) => {
        console.error("error: ", e.target.error)
    }

    transaccion.oncomplete = () => {
        console.log("se agrego el obj")
    }

    transaccion.onerror = (e) => {
        console.log("Error: ", e.target.error)
    }
}

/*
 Lee todos los registros de la objectStore "cube3x3" usando un cursor.
 - Recorre cada entrada y la almacena en arrayDB.
 - Cuando termina:
    - Ejecuta el callback cb (si existe) con el array completo.
 - Retorna el array (aunque se llena de forma asíncrona).
*/
export const leer = (cb) => {
    let transaccion = db.transaction("cube3x3", "readonly")
    let objectStore = transaccion.objectStore("cube3x3")

    let request = objectStore.openCursor()
    let arrayDB = []

    request.onsuccess = (e) => {
        let cursor = e.target.result
        if (cursor) {
            arrayDB.push(cursor.value)
            cursor.continue()
        } else {
            console.log("Se leyeron todos los registros")
            if (cb) cb(arrayDB)
        }
    }

    request.onerror = (e) => {
        console.error("Error al leer registros:", e.target.error)
    }

    return arrayDB
}

/*
 Elimina un registro por índice lógico (posición visual).
 - Recorre la objectStore con cursor.
 - Cuando el contador coincide con el índice:
    - Obtiene el id real del objeto.
    - Lo elimina con store.delete(id).
    - Vuelve a leer toda la base de datos.
    - Reconstruye el DOM del archivador.
 - Actualiza los promedios al finalizar el recorrido.
*/
export const eliminar = (index, div) => {
    let transaccion = db.transaction("cube3x3", "readwrite")
    let store = transaccion.objectStore("cube3x3")

    let request = store.openCursor()
    let contador = 0

    request.onsuccess = (e) => {
        let cursor = e.target.result
        if (cursor) {
            if (contador === index) {
                let id = cursor.value.id
                store.delete(id)

                if (div == "database" || div == "card") {
                    leer((array) => {
                        archivador.innerHTML = ""
                        array.forEach((item, idx) => {

                            if (item.dnf == true) {
                                dataDiv(idx + 1, item.time, true)
                            }
                            else if (item.masDos == true) {
                                dataDiv(idx + 1, item.time, false, true)
                            }
                            else {
                                dataDiv(idx + 1, item.time)
                            }

                        })
                    })
                }

                return
            }
            contador++
            cursor.continue()
        }
        promedios_front()
    }

    request.onerror = (e) => {
        console.error("Error al eliminar por índice:", e.target.error)
    }
}