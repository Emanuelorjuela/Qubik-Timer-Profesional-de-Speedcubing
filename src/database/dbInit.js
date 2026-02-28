export let db;

import { leer, añadirProm } from "./crud.js"
import { dataDiv } from "./uiDB.js"
import { checkDBProm } from "./promDB.js"
import { crearPromedios } from "../averages/promUi.js"

const contenedor = document.querySelector(".contenedor")

// Apertura de la base de datos "registros", versión 2
export const request = indexedDB.open("registros", 2)

/*
 Se ejecuta cuando:
 - La base no existe.
 - La versión cambia.
 Permite crear objectStores necesarias.
*/
request.onupgradeneeded = function (e) {
    db = e.target.result

    // Crea store para tiempos del 3x3 si no existe
    if (!db.objectStoreNames.contains("cube3x3")) {
        db.createObjectStore("cube3x3", { keyPath: "id", autoIncrement: true })
    }

    // Crea store para promedios si no existe
    if (!db.objectStoreNames.contains("promDB")) {
        db.createObjectStore("promDB", { keyPath: "id", autoIncrement: true })
    }
}

/*
 Se ejecuta cuando la base se abre correctamente.
 - Asigna la instancia global db.
 - Carga los registros guardados.
 - Verifica y genera estructura de promedios.
*/
request.onsuccess = function (e) {
    db = e.target.result
    console.log("Base de datos abierta con éxito")

    // Leer todos los tiempos guardados y renderizarlos
    leer((array) => {
        array.forEach((item, idx) => {
            dataDiv(idx + 1, item.time, item.dnf, item.masDos)
        })
    })

    // Leer todos los registros de promedios
    const tx = db.transaction("promDB", "readonly")
    const store = tx.objectStore("promDB")
    const req = store.getAll()

    req.onsuccess = () => {
        const datos = req.result

        // Si no existen registros de promedios, inicializa 6 por defecto
        if (datos.length === 0) {

            for (let i = 0; i < 6; i++) {
                añadirProm({ actual: true })
            }

            checkDBProm((datos) => {
                crearPromedios(datos)
            })

        } else {

            checkDBProm((datos) => {
                crearPromedios(datos)
            })

        }
    }
}

/*
 Manejo de error al abrir la base de datos.
*/
request.onerror = function (e) {
    console.error("Error al abrir la base de datos", e.target.error)
}

