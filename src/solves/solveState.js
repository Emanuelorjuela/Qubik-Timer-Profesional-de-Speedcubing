import { db } from "../database/dbInit.js"
import { promedios_front } from "../averages/promUi.js"

/*
 Marca o desmarca un registro como DNF (Did Not Finish).
 - Busca el registro por índice lógico usando cursor.
 - Si dnf === false:
     - Activa DNF.
     - Desactiva +2.
     - Actualiza texto y color a rojo.
 - Si dnf === true:
     - Desactiva DNF.
     - Restaura tiempo normal o +2 según estado.
 - Actualiza el registro en IndexedDB.
 - Refresca promedios.
*/
export const marcarDNF = (index, elementoTime) => {
    let transaccion = db.transaction("cube3x3", "readwrite")
    let store = transaccion.objectStore("cube3x3")

    let request = store.openCursor()
    let contador = 0

    request.onsuccess = (e) => {
        let cursor = e.target.result

        if (cursor) {
            if (contador === index) {
                let registro = cursor.value

                if (registro.dnf === false) {
                    registro.dnf = true
                    registro.masDos = false

                    elementoTime.textContent = registro.timeDNF
                    elementoTime.style.color = "red"

                    const dataDiv = elementoTime.closest(".data")
                    dataDiv.querySelector(".dnf").style.color = "red"
                    dataDiv.querySelector(".masdos").style.color = "#777"

                } else {
                    registro.dnf = false

                    if (registro.masDos === false) {
                        elementoTime.textContent = Number(registro.time).toFixed(2)
                        elementoTime.style.color = "green"
                    } else {
                        elementoTime.textContent = Number(registro.timeMasDos).toFixed(2)
                        elementoTime.style.color = "orange"
                    }

                    const dataDiv = elementoTime.closest(".data")
                    dataDiv.querySelector(".dnf").style.color = "#777"
                }

                cursor.update(registro)
                return
            }

            contador++
            cursor.continue()
        }
    }

    promedios_front()
}

/*
 Marca o desmarca un registro como +2 segundos.
 - Busca el registro por índice lógico.
 - Si masDos === false:
     - Activa +2.
     - Desactiva DNF.
     - Muestra tiempo con penalización en naranja.
 - Si masDos === true:
     - Desactiva +2.
     - Restaura tiempo normal o DNF según estado.
 - Actualiza el registro en IndexedDB.
 - Refresca promedios.
*/
export const marcarDos = (index, elementoTime) => {
    let transaccion = db.transaction("cube3x3", "readwrite")
    let store = transaccion.objectStore("cube3x3")

    let request = store.openCursor()
    let contador = 0

    request.onsuccess = (e) => {
        let cursor = e.target.result

        if (cursor) {
            if (contador === index) {
                let registro = cursor.value

                if (registro.masDos === false) {
                    registro.masDos = true
                    registro.dnf = false

                    elementoTime.textContent = Number(registro.timeMasDos).toFixed(2)
                    elementoTime.style.color = "orange"

                    const dataDiv = elementoTime.closest(".data")
                    dataDiv.querySelector(".masdos").style.color = "orange"
                    dataDiv.querySelector(".dnf").style.color = "#777"

                } else {
                    registro.masDos = false

                    if (registro.dnf === true) {
                        elementoTime.textContent = registro.timeDNF
                        elementoTime.style.color = "red"
                    } else {
                        elementoTime.textContent = Number(registro.time).toFixed(2)
                        elementoTime.style.color = "green"
                    }

                    const dataDiv = elementoTime.closest(".data")
                    dataDiv.querySelector(".masdos").style.color = "#777"
                }

                cursor.update(registro)
                return
            }

            contador++
            cursor.continue()
        }

        promedios_front()
    }
}