import { db } from "../database/dbInit.js"
import { Mo3, funcGeneral, singleAndMedia } from "./promCalculos.js"
import { funcBest } from "./promBest.js"
import { promedios_p, mediaSingle_p, selects } from "./promState.js"

// Contenedor principal donde se renderiza todo el bloque de estadísticas
const promedios= document.querySelector(".promedios")

/*
 crearPromedios(dato)

 Construye dinámicamente toda la interfaz de estadísticas:
 - Single
 - Media
 - Mo3, Ao5, Ao12, Ao25, Ao50, Ao100
 
 Usa configuración persistida en IndexedDB (promDB)
 para saber si mostrar "Actual" o "Best".
*/
export const crearPromedios=async(dato)=>{
    
    // Contenedor superior para Single y Media
    const dates = document.createElement("div");
    dates.classList.add("dates");

    // ----- SINGLE -----
    const h2Single = document.createElement("h2");
    let single= await singleAndMedia("single");
    h2Single.textContent = "Single: "+ single;

    // Se guarda referencia global para actualizaciones posteriores
    mediaSingle_p[0]=h2Single

    // ----- MEDIA GLOBAL -----
    const h2Media = document.createElement("h2");
    let media= await singleAndMedia("media");
    h2Media.textContent = "Media: "+media;

    dates.appendChild(h2Single);
    dates.appendChild(h2Media);

    mediaSingle_p[1]=h2Media

    // Contenedor para todos los promedios AoX
    const boxPromedios = document.createElement("div");
    boxPromedios.classList.add("box_promedios");

    // Orden visual de promedios
    let medias= ["Mo3","Ao12","Ao25","Ao50","Ao5","Ao100"]
    let index=0;

    // Se generan dinámicamente todos los bloques
    for(let i of medias){

        let idx=index

        let prom1 = document.createElement("div");
        prom1.classList.add("promedios_ao5");

        // Select para alternar entre Actual y Best
        let sel1 = document.createElement("select");
        sel1.classList.add("select_promedio")
        
        let opt1a = document.createElement("option");
        opt1a.value = "Actual";
        opt1a.textContent = `${i} Actual` ;
        
        let opt1b = document.createElement("option");
        opt1b.value = "Best";
        opt1b.textContent = `${i} Best`;

        sel1.appendChild(opt1a);
        sel1.appendChild(opt1b);

        // Se guarda referencia global del select
        selects[i]=sel1
        
        let p1 = document.createElement("p");
        p1.classList.add("time_promedio");

        prom1.appendChild(sel1);
        prom1.appendChild(p1);

        // Se guarda referencia global del elemento donde se pinta el valor
        promedios_p[i]=p1

        let num

        /*
         Determina si debe mostrar promedio actual
         o el mejor histórico almacenado
        */
        if (dato[idx].actual === true){

            if(i=="Mo3"){
                num= await Mo3()
            }
            if(i=="Ao5"){
                num= await funcGeneral(5)
            }
            if(i=="Ao12"){
                num= await funcGeneral(12)
            }
            if(i=="Ao25"){
                num= await funcGeneral(25)
            }
            if(i=="Ao50"){
                num= await funcGeneral(50)
            }
            if(i=="Ao100"){
                num= await funcGeneral(100)
            }
        }

        else if(dato[idx].actual === false){

            if(i=="Mo3"){
                num= await funcBest(3)
            }
            if(i=="Ao5"){
                num= await funcBest(5)
            }
            if(i=="Ao12"){
                num= await funcBest(12)
            }
            if(i=="Ao25"){
                num= await funcBest(25)
            }
            if(i=="Ao50"){
                num= await funcBest(50)
            }
            if(i=="Ao100"){
                num= await funcBest(100)
            }
        }
        
        // Se renderiza valor inicial
        p1.textContent= num;

        boxPromedios.appendChild(prom1);

        /*
         Sincroniza el valor visual del select
         con la configuración guardada
        */
        if (dato) {

            if (dato[idx].actual === true) {
                sel1.value = "Actual";
            } else {
                sel1.value = "Best";
            }

            /*
             Evento principal:
             - Cambia estado en memoria
             - Actualiza IndexedDB
             - Recalcula inmediatamente estadísticas
            */
            sel1.addEventListener("change", async () => {

                if (sel1.value === "Actual") {
                    dato[idx].actual = true;
                } else {
                    dato[idx].actual = false;
                }

                const tx = db.transaction("promDB", "readwrite");
                const store = tx.objectStore("promDB");
                store.put(dato[idx]);

                await promedios_front();
            });
        }

        console.log(mediaSingle_p)

        /*
         Segundo listener:
         Persistencia en IndexedDB sin recalcular
         (queda redundante pero mantiene sincronización)
        */
        sel1.addEventListener("change", () => {

            if (sel1.value === "Actual") {
                dato[idx].actual = true;
            } else {
                dato[idx].actual = false;
            }

            const tx = db.transaction("promDB", "readwrite");
            const store = tx.objectStore("promDB");
            store.put(dato[idx]);    

        });

        index++
    }

    // Se insertan los bloques completos en el DOM
    promedios.appendChild(dates);
    promedios.appendChild(boxPromedios);
}


/*
 promedios_front()

 Recalcula y actualiza en tiempo real:
 - Single
 - Media
 - Todos los promedios AoX

 Usa referencias almacenadas en promState.js
 para evitar volver a construir el DOM.
*/
export const promedios_front = async () => {

    const media = await singleAndMedia("media")
    const single = await singleAndMedia("single")

    // Actualiza Single y Media
    mediaSingle_p[0].textContent = "Single: " + single
    mediaSingle_p[1].textContent = "Media: " + media

    // Configuración numérica asociada a cada promedio
    const config = {
        "Mo3": 3,
        "Ao5": 5,
        "Ao12": 12,
        "Ao25": 25,
        "Ao50": 50,
        "Ao100": 100
    }

    // Recalcula cada promedio según su select activo
    for (let key in config) {

        let valor

        if (selects[key].value === "Actual") {

            if (key === "Mo3") {
                valor = await Mo3()
            } else {
                valor = await funcGeneral(config[key])
            }

        } else {
            valor = await funcBest(config[key])
        }

        // Actualiza el texto visual
        promedios_p[key].textContent = valor
    }
}