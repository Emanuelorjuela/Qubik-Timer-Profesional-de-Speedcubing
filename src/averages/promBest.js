import { arrayDB } from "../database/promDB.js"
import { Mo3, funcGeneral } from "./promCalculos.js"

/*
 Calcula el mejor promedio posible para una ventana de tamaño `num`.
 - Obtiene todos los tiempos desde IndexedDB.
 - Genera promedios móviles.
 - Filtra resultados inválidos.
 - Devuelve el mejor promedio numérico o "--" si no es posible.
*/
export async function funcBest(num) {

    let db = await arrayDB()
    let promedios = []
    let calculo = []
    let resultado

    // Si no hay suficientes tiempos para calcular el promedio
    if (db.length < num) {
        resultado = "--"
        return resultado
    } else {

        // Recorre todas las ventanas posibles
        for (let iO = 0; iO < db.length; iO++) {

            for (let i = 0; i < num; i++) {

                if (!db[i + iO] || db[i + iO] == undefined || db[i + iO] == NaN) {
                    break
                } else {
                    calculo.push(db[i + iO])
                }

            }

            let resParcial

            // Si es promedio de 3 usa Mo3
            if (num == 3) {
                resParcial = await Mo3(calculo)
            } else {
                resParcial = await funcGeneral(num, calculo)
            }

            promedios.push(resParcial)
            calculo = []
        }

        // Guarda copia antes de filtrar
        let savePromedios = promedios

        // Elimina resultados inválidos
        promedios = promedios.filter(x => x !== "DNF")
        promedios = promedios.filter(x => x !== "--")

        // Ordena ascendente
        promedios.sort((a, b) => a - b)

        console.log(promedios)
        console.log(savePromedios)

        if (promedios == []) {
            resultado = "--"
        }

        // Encuentra la posición del mejor promedio dentro del array original
        let posicion

        for (let i = 0; i < savePromedios.length; i++) {
            if (savePromedios[i] === promedios[0]) {
                console.log("posición: " + i)
                posicion = i
                break
            }
        }

        console.log("best:" + savePromedios[41])

        // Obtiene los tiempos que generaron el mejor promedio
        let bestPromedio = []

        for (let i = 0; i < num; i++) {
            bestPromedio.push(db[posicion + i])
        }

        if (resultado != "--") {
            resultado = {
                average: promedios[0],
                times: bestPromedio,
                posicionDB: db.length - posicion
            }
        }
    }

    console.log("Best: " + resultado)

    if (resultado.average == undefined) {
        return "--"
    } else {
        return resultado.average
    }
}