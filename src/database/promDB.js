import { db } from "./dbInit.js"

/*
 checkDBProm

 Lee todos los registros almacenados en el objectStore "promDB".
 Utiliza un cursor de IndexedDB para recorrer cada registro.
 Devuelve los datos a través de un callback (cb).
*/
export const checkDBProm = (cb) => {

    // Se crea una transacción en modo lectura
    const transaccion = db.transaction("promDB", "readonly");

    // Se obtiene el objectStore correspondiente
    const store = transaccion.objectStore("promDB");

    // Se abre un cursor para recorrer todos los registros
    const request = store.openCursor();

    // Arreglo acumulador donde se almacenarán los resultados
    let datosProm = [];

    // Evento que se ejecuta cada vez que el cursor avanza
    request.onsuccess = (e) => {

        const cursor = e.target.result;

        if (cursor) {

            // Obtiene el objeto completo guardado en ese registro
            const obj = cursor.value;

            // Se agrega al arreglo acumulador
            datosProm.push(obj);

            // Continúa al siguiente registro
            cursor.continue();

        } else {

            // Cuando ya no hay más registros
            // Se ejecuta el callback devolviendo el arreglo completo
            cb(datosProm);
        }
    };

    // Manejo básico de error
    request.onerror = (e) => {
        console.error("Error:", e.target.error);
    };
};


/*
 arrayDB

 Devuelve una Promise que:
 - Lee todos los solves almacenados en el objectStore "cube3x3"
 - Normaliza el valor según su estado (normal, +2, DNF)
 - Retorna un arreglo con los tiempos listos para cálculos estadísticos
 - Invierte el arreglo para que el solve más reciente quede primero
*/
export const arrayDB = () => {

    return new Promise((resolve, reject) => {

        // Transacción de solo lectura
        const transaccion = db.transaction("cube3x3", "readonly");

        // ObjectStore donde se guardan los tiempos
        const store = transaccion.objectStore("cube3x3");

        // Cursor para recorrer todos los registros
        const request = store.openCursor();

        // Arreglo que contendrá los tiempos procesados
        const array = [];

        request.onsuccess = (e) => {

            const cursor = e.target.result;

            if (cursor) {

                const obj = cursor.value;

                /*
                 Normalización del tiempo:

                 - Si tiene penalización +2 → se usa timeMasDos
                 - Si es DNF → se usa timeDNF
                 - Si es solve normal → se usa time
                */
                if (obj.masDos) array.push(obj.timeMasDos);
                else if (obj.dnf) array.push(obj.timeDNF);
                else array.push(obj.time);

                // Continúa al siguiente registro
                cursor.continue();

            } else {

                /*
                 Cuando termina el recorrido:
                 - Se invierte el arreglo
                 - Esto permite que el solve más reciente
                   quede en la posición 0 (orden cronológico inverso)
                */
                resolve(array.reverse()); 
            }
        };

        // Si ocurre un error se rechaza la Promise
        request.onerror = (e) => reject(e.target.error);
    });
};