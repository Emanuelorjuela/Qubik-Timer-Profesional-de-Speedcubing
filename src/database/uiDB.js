/*
 Módulo de interfaz para:
 - Renderizar la lista de solves guardados.
 - Mostrar información detallada de un solve en una card.
 - Permitir modificar estados (+2, DNF) y eliminar registros.
 - Sincronizar cambios con IndexedDB y actualizar promedios.
*/

import { eliminar, leer } from "./crud.js";
import { db } from "./dbInit.js";
import { marcarDNF, marcarDos } from "../solves/solveState.js";
import { scrambler, estadoCero } from "../scrambler/scramblerEngine.js";
import { crearCaras } from "../scrambler/cube.js";
import { promedios_front } from "../averages/promUi.js";

/*
 Referencias a contenedores principales del DOM:
 - archivador: lista visible de solves.
 - contenedor: wrapper donde se insertan overlays (cards).
*/
export const archivador = document.querySelector(".archivador")
export const contenedor = document.querySelector(".contenedor")

/*
 dataDiv(idx, t, dnf, masDos)

 Renderiza un solve en la lista principal.

 Parámetros:
 - idx: índice visual (comienza en 1).
 - t: tiempo base almacenado.
 - dnf: booleano de estado DNF.
 - masDos: booleano de penalización +2.
*/
export const dataDiv = (idx, t, dnf, masDos) => {

    // Estructura base del registro
    const data = document.createElement("DIV")
    const record = document.createElement("DIV")
    const indice = document.createElement("SPAN")
    const time = document.createElement("SPAN")
    const btns = document.createElement("DIV")
    const btn1 = document.createElement("BUTTON") // +2
    const btn2 = document.createElement("BUTTON") // DNF
    const btn3 = document.createElement("BUTTON") // Delete

    // Clases CSS
    data.classList.add("data")
    record.classList.add("record")
    indice.classList.add("indice")
    time.classList.add("tiempo")
    btns.classList.add("btns")

    btn1.classList.add("mini_btn", "masdos")
    btn2.classList.add("mini_btn", "dnf")
    btn3.classList.add("mini_btn", "delete")

    // Ensamblaje de nodos
    btns.appendChild(btn1)
    btns.appendChild(btn2)
    btns.appendChild(btn3)

    record.appendChild(indice)
    record.appendChild(time)

    data.appendChild(record)
    data.appendChild(btns)

    // Texto de botones
    btn1.textContent = "+2"
    btn2.textContent = "DNF"
    btn3.textContent = "X"

    indice.textContent = idx + ".  "

    /*
     Lógica de visualización según estado:
     - DNF tiene prioridad.
     - Luego +2.
     - Luego tiempo normal.
    */
    if (dnf === true) {
        time.textContent = "DNF"
        time.style.color = "red"
        btn2.style.color = "red"
    } else if (masDos === true) {
        time.textContent = (Number(t) + 2).toFixed(2)
        time.style.color = "orange"
        btn1.style.color = "orange"
    } else {
        time.textContent = Number(t).toFixed(2)
    }

    // Eventos principales
    btn3.addEventListener("click", () => {
        eliminar(idx - 1, "database")
    })

    btn2.addEventListener("click", () => {
        marcarDNF(idx - 1, time)
    })

    btn1.addEventListener("click", () => {
        marcarDos(idx - 1, time)
    })

    // Click en tiempo abre card detallada
    time.addEventListener("click", () => {
        datoCard(idx - 1)
    })

    // Inserta el solve al inicio de la lista
    archivador.prepend(data)
    archivador.scrollTop = 0
}

/*
 datoCard(index)

 Busca en IndexedDB el solve por índice
 y crea una card detallada con su información.
*/
export const datoCard = (index) => {

    let transaccion = db.transaction("cube3x3", "readwrite")
    let store = transaccion.objectStore("cube3x3")

    let request = store.openCursor()
    let contador = 0

    request.onsuccess = (e) => {
        let cursor = e.target.result
        if (cursor) {
            if (contador === index) {
                crearCard(cursor.value, index)
                return
            }
            contador++
            cursor.continue()
        }
    }

    request.onerror = (e) => {
        console.error("Error al buscar por índice:", e.target.error)
    }
}

/*
 crearCard(dato, index)

 Genera un overlay con información completa del solve:
 - Tiempo
 - Estado (+2 / DNF)
 - Fecha
 - Scramble
 - Mini representación del cubo
 - Acciones (copiar, eliminar, modificar estados)
*/
export const crearCard = (dato, index) => {

    const overlayCard = document.createElement("div")
    overlayCard.classList.add("overlay_card")

    const card = document.createElement("div")
    card.classList.add("card")
    overlayCard.appendChild(card)

    // ----- Botones superiores -----
    const btnsTop = document.createElement("div")
    btnsTop.classList.add("btns_card_top")

    const btnCopy = document.createElement("button")
    btnCopy.classList.add("btn_card_start")
    btnCopy.textContent = "Copy Scramble"

    const btnDelete = document.createElement("button")
    btnDelete.classList.add("btn_card_start", "delete")
    btnDelete.textContent = "Delete"

    const btnClose = document.createElement("button")
    btnClose.classList.add("btn_card_start")
    btnClose.textContent = "X"

    btnsTop.append(btnCopy, btnDelete, btnClose)
    card.appendChild(btnsTop)

    // ----- Sección central -----
    const optionsCard = document.createElement("div")
    optionsCard.classList.add("options_card")

    const timeCard = document.createElement("span")
    timeCard.classList.add("time_card")

    // Estado visual del tiempo
    if (!dato.dnf && !dato.masDos) {
        timeCard.textContent = dato.time
    } else if (dato.dnf) {
        timeCard.textContent = dato.timeDNF
    } else if (dato.masDos) {
        timeCard.textContent = dato.timeMasDos + "+"
    }

    optionsCard.appendChild(timeCard)

    // ----- Botones inferiores -----
    const btnsBottom = document.createElement("div")
    btnsBottom.classList.add("btn_card_bottom")

    const btn3x3 = document.createElement("button")
    btn3x3.classList.add("btn_card_end", "masdos")
    btn3x3.textContent = dato.typeCube

    const btnMas2 = document.createElement("button")
    btnMas2.classList.add("btn_card_end", "masdos")
    btnMas2.textContent = "+2"

    const btnDNF = document.createElement("button")
    btnDNF.classList.add("btn_card_end", "dnf")
    btnDNF.textContent = "DNF"

    if (dato.masDos) btnMas2.style.backgroundColor = "orange"
    if (dato.dnf) btnDNF.style.backgroundColor = "red"

    btnsBottom.append(btn3x3, btnMas2, btnDNF)
    optionsCard.appendChild(btnsBottom)

    const dateCard = document.createElement("span")
    dateCard.classList.add("date_card")
    dateCard.textContent = dato.date
    optionsCard.appendChild(dateCard)

    card.appendChild(optionsCard)

    // ----- Scramble y mini cubo -----
    const scrambleCard = document.createElement("div")
    scrambleCard.classList.add("scramble_card")

    const cuboCard = document.createElement("div")
    cuboCard.classList.add("cubo_card")

    const mini_cubo = document.createElement("div")
    mini_cubo.classList.add("mini_cubo")

    // Inicializa cubo y aplica scramble
    crearCaras(mini_cubo)
    estadoCero(mini_cubo)
    scrambler(mini_cubo, dato.scramble.split(" "))

    cuboCard.appendChild(mini_cubo)

    const pCombination = document.createElement("p")
    pCombination.classList.add("combination_card")
    pCombination.textContent = dato.scramble

    cuboCard.appendChild(pCombination)
    scrambleCard.appendChild(cuboCard)
    card.appendChild(scrambleCard)

    contenedor.appendChild(overlayCard)

    // ----- Eventos -----

    btnClose.addEventListener("click", (e) => {
        e.target.closest(".overlay_card").remove()
    })

    btnDelete.addEventListener("click", (e) => {
        e.target.closest(".overlay_card").remove()
        eliminar(index, "card")
    })

    /*
     Toggle DNF:
     - Alterna registro.dnf
     - Fuerza masDos = false
     - Actualiza DB
     - Re-renderiza lista
     - Recalcula promedios
    */
    btnDNF.addEventListener("click", () => {

        let transaccion = db.transaction("cube3x3", "readwrite")
        let store = transaccion.objectStore("cube3x3")
        let request = store.openCursor()
        let contador = 0

        request.onsuccess = (e) => {
            let cursor = e.target.result
            if (cursor) {
                if (contador === index) {

                    let registro = cursor.value
                    registro.dnf = !registro.dnf
                    registro.masDos = false

                    cursor.update(registro)

                    leer((array) => {
                        archivador.innerHTML = ""
                        array.forEach((item, idx) => {
                            dataDiv(idx + 1, item.time, item.dnf, item.masDos)
                        })
                    })

                    promedios_front()
                    return
                }
                contador++
                cursor.continue()
            }
        }
    })

    /*
     Toggle +2:
     - Alterna registro.masDos
     - Fuerza dnf = false
     - Actualiza DB
     - Re-renderiza lista
     - Recalcula promedios
    */
    btnMas2.addEventListener("click", () => {

        let transaccion = db.transaction("cube3x3", "readwrite")
        let store = transaccion.objectStore("cube3x3")
        let request = store.openCursor()
        let contador = 0

        request.onsuccess = (e) => {
            let cursor = e.target.result
            if (cursor) {
                if (contador === index) {

                    let registro = cursor.value
                    registro.masDos = !registro.masDos
                    registro.dnf = false

                    cursor.update(registro)

                    leer((array) => {
                        archivador.innerHTML = ""
                        array.forEach((item, idx) => {
                            dataDiv(idx + 1, item.time, item.dnf, item.masDos)
                        })
                    })

                    promedios_front()
                    return
                }
                contador++
                cursor.continue()
            }
        }
    })

    // Copiar scramble al portapapeles
    btnCopy.addEventListener("click", () => {
        navigator.clipboard.writeText(dato.scramble)
    })
}
