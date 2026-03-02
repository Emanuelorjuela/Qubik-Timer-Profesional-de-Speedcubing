
import { eliminar, leer } from "./crud.js";            
import { db } from "./dbInit.js";                         
import { marcarDNF, marcarDos } from "../solves/solveState.js"; 
import { scrambler, estadoCero } from "../scrambler/scramblerEngine.js"; 
import { crearCaras } from "../scrambler/cube.js";         
import { promedios_front } from "../averages/promUi.js";   

/*
 Referencias principales del DOM:

 - archivador: contenedor donde se listan los solves.
 - contenedor: wrapper general donde se insertan overlays (cards).
*/
export const archivador = document.querySelector(".archivador")
export const contenedor = document.querySelector(".contenedor")

/*
 dataDiv(idx, t, dnf, masDos)

 Renderiza un solve dentro de la lista principal.

 Parámetros:
 - idx: índice visual (comienza en 1).
 - t: tiempo base almacenado.
 - dnf: estado booleano DNF.
 - masDos: estado booleano +2.
*/
export const dataDiv = (idx, t, dnf, masDos) => {

    // Creación de nodos base que conforman un registro visual
    const data = document.createElement("DIV")
    const record = document.createElement("DIV")
    const indice = document.createElement("SPAN")
    const time = document.createElement("SPAN")
    const btns = document.createElement("DIV")
    const btn1 = document.createElement("BUTTON") // +2
    const btn2 = document.createElement("BUTTON") // DNF
    const btn3 = document.createElement("BUTTON") // Delete

    // Asignación de clases para estilos CSS
    data.classList.add("data")
    record.classList.add("record")
    indice.classList.add("indice")
    time.classList.add("tiempo")
    btns.classList.add("btns")

    btn1.classList.add("mini_btn", "masdos")
    btn2.classList.add("mini_btn", "dnf")
    btn3.classList.add("mini_btn", "delete")

    // Ensamblaje jerárquico del DOM
    btns.appendChild(btn1)
    btns.appendChild(btn2)
    btns.appendChild(btn3)

    record.appendChild(indice)
    record.appendChild(time)

    data.appendChild(record)
    data.appendChild(btns)

    // Etiquetas visibles
    btn1.textContent = "+2"
    btn2.textContent = "DNF"
    btn3.textContent = "X"

    indice.textContent = idx + ".  "

    /*
     Lógica de prioridad visual:
     1. DNF tiene precedencia absoluta.
     2. Luego penalización +2.
     3. En caso contrario, tiempo normal.
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

    // Eliminación directa desde lista
    btn3.addEventListener("click", () => {
        eliminar(idx - 1, "database")
    })

    // Aplicación de DNF desde lista
    btn2.addEventListener("click", () => {
        marcarDNF(idx - 1, time)
    })

    // Aplicación de +2 desde lista
    btn1.addEventListener("click", () => {
        marcarDos(idx - 1, time)
    })

    // Click en tiempo abre card detallada
    time.addEventListener("click", () => {
        datoCard(idx - 1)
    })

    // Inserta el registro al inicio (orden descendente visual)
    archivador.prepend(data)
    archivador.scrollTop = 0
}

/*
 datoCard(index)

 Recorre IndexedDB mediante cursor hasta encontrar el solve
 correspondiente al índice visual y genera su card detallada.
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

 Construye un overlay con:

 - Tiempo y estado.
 - Tipo de cubo.
 - Fecha.
 - Scramble.
 - Mini representación visual del cubo.
 - Controles de edición y eliminación.

 Esta vista opera directamente sobre el registro persistido.
*/
export const crearCard = (dato, index) => {

    const overlayCard = document.createElement("div")
    overlayCard.classList.add("overlay_card")

    const card = document.createElement("div")
    card.classList.add("card")
    overlayCard.appendChild(card)

    // Botonera superior: copiar, eliminar, cerrar
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

    // Contenedor central de información
    const optionsCard = document.createElement("div")
    optionsCard.classList.add("options_card")

    const timeCard = document.createElement("span")
    timeCard.classList.add("time_card")

    // Representación del estado del tiempo
    if (!dato.dnf && !dato.masDos) {
        timeCard.textContent = dato.time
    } else if (dato.dnf) {
        timeCard.textContent = dato.timeDNF
    } else if (dato.masDos) {
        timeCard.textContent = dato.timeMasDos + "+"
    }

    optionsCard.appendChild(timeCard)

    // Botonera inferior: tipo de cubo y penalizaciones
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

    // Indicadores visuales si ya existe penalización
    if (dato.masDos) btnMas2.style.backgroundColor = "orange"
    if (dato.dnf) btnDNF.style.backgroundColor = "red"

    btnsBottom.append(btn3x3, btnMas2, btnDNF)
    optionsCard.appendChild(btnsBottom)

    const dateCard = document.createElement("span")
    dateCard.classList.add("date_card")
    dateCard.textContent = dato.date
    optionsCard.appendChild(dateCard)

    card.appendChild(optionsCard)

    // Sección de scramble y mini cubo renderizado
    const scrambleCard = document.createElement("div")
    scrambleCard.classList.add("scramble_card")

    const cuboCard = document.createElement("div")
    cuboCard.classList.add("cubo_card")

    const mini_cubo = document.createElement("div")
    mini_cubo.classList.add("mini_cubo")

    // Inicialización estructural y aplicación del scramble persistido
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

    // Cierre de overlay
    btnClose.addEventListener("click", (e) => {
        e.target.closest(".overlay_card").remove()
    })

    // Eliminación desde card
    btnDelete.addEventListener("click", (e) => {
        e.target.closest(".overlay_card").remove()
        eliminar(index, "card")
    })

    /*
     Evento DNF dentro de la card:

     - Alterna el estado booleano en IndexedDB.
     - Desactiva +2 si estaba activo.
     - Actualiza visualmente la card.
     - Recarga la lista principal.
     - Recalcula promedios.
    */
    btnDNF.addEventListener("click", () => {

        let transaccion = db.transaction("cube3x3", "readwrite");
        let store = transaccion.objectStore("cube3x3");
        let request = store.openCursor();
        let contador = 0;

        request.onsuccess = (e) => {
            let cursor = e.target.result;
            if (cursor) {
                if (contador === index) {
                    let registro = cursor.value;

                    registro.dnf = !registro.dnf;
                    registro.masDos = false;

                    if (registro.dnf) {
                        btnDNF.style.backgroundColor = "red";
                        btnMas2.style.backgroundColor = "#444";
                        timeCard.textContent = registro.timeDNF;
                    } else {
                        btnDNF.style.backgroundColor = "#444";
                        timeCard.textContent = Number(registro.time).toFixed(2);
                    }

                    cursor.update(registro);

                    leer((array) => {
                        archivador.innerHTML = "";
                        array.forEach((item, idx) => {
                            dataDiv(idx + 1, item.time, item.dnf, item.masDos);
                        });
                    });

                    return;
                }
                contador++;
                cursor.continue();
            }
            promedios_front()
        };

        request.onerror = (e) => {
            console.error("Error al actualizar DNF:", e.target.error);
        };
    });

    /*
     Evento +2 dentro de la card:

     - Alterna penalización en la base de datos.
     - Desactiva DNF si estaba activo.
     - Actualiza representación visual.
     - Refresca lista.
     - Recalcula estadísticas.
    */
    btnMas2.addEventListener("click", () => {

        let transaccion = db.transaction("cube3x3", "readwrite");
        let store = transaccion.objectStore("cube3x3");
        let request = store.openCursor();
        let contador = 0;

        request.onsuccess = (e) => {
            let cursor = e.target.result;
            if (cursor) {
                if (contador === index) {
                    let registro = cursor.value;

                    registro.masDos = !registro.masDos;
                    registro.dnf = false;

                    if (registro.masDos) {
                        btnMas2.style.backgroundColor = "orange";
                        btnDNF.style.backgroundColor = "#444";
                        timeCard.textContent = Number(registro.timeMasDos).toFixed(2)+"+";
                    } else {
                        btnMas2.style.backgroundColor = "#444";
                        timeCard.textContent = Number(registro.time).toFixed(2);
                    }

                    cursor.update(registro);

                    leer((array) => {
                        archivador.innerHTML = "";
                        array.forEach((item, idx) => {
                            dataDiv(idx + 1, item.time, item.dnf, item.masDos);
                        });
                    });

                    return;
                }
                contador++;
                cursor.continue();
            }
            promedios_front()
        };

        request.onerror = (e) => {
            console.error("Error al actualizar Mas DOs:", e.target.error);
        };
    });

    // Copia el scramble persistido al portapapeles
    btnCopy.addEventListener("click",()=>{
        navigator.clipboard.writeText(dato.scramble);
    })

}