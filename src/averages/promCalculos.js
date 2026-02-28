import { arrayDB } from "../database/promDB.js"

/*
 Mo3 (Mean of 3)
 Calcula la media de los primeros 3 tiempos.
 Reglas alineadas con formato oficial de la World Cube Association (WCA).
 - Si hay menos de 3 tiempos → "--"
 - Si alguno es "DNF" → "DNF"
 - Si todos son válidos → promedio aritmético con 2 decimales
*/
export async function Mo3(arr){
    let resultado;
    let operacion;
    let db;

    // Si se pasa un arreglo manualmente lo usa, si no consulta la DB
    if(arr){
        db=arr
    }else{
        db= await arrayDB();
    }
    
    // No hay suficientes tiempos
    if(db.length<3){
        resultado= "--"
    }

    // Toma los primeros 3 solves
    let promedio=[db[0],db[1],db[2]]
    
    // Si alguno es DNF el promedio completo es DNF
    if(promedio.includes("DNF")){
       resultado= "DNF"
    }
    // Si hay al menos 3 válidos calcula media
    else if(db.length>=3){
        operacion= (Number(promedio[0])+Number(promedio[1])+Number(promedio[2]))/3;
        resultado= operacion.toFixed(2)
    }

    console.log("Mo3: " + resultado)
    return resultado
} 


/*
 funcGeneral
 Motor principal para:
 Ao5, Ao12, Ao25, Ao50, Ao100

 Implementa eliminación de mejores y peores tiempos
 y manejo proporcional de DNFs según tamaño.
*/
export async function funcGeneral(num,arr){
    let db;
    
    // Fuente de datos
    if(arr){
        db= arr
    }
    else{
        db= await arrayDB();
    }
    
    // Función interna que ejecuta la lógica según tamaño
    function ao5yao12(num){
        let promedio=[];
        let resultado;

        // No hay suficientes tiempos
        if(db.length<num){
            resultado="--"

            if(num==5){
                console.log("Ao5:"+resultado)
            }
            else if(num==12){
                console.log("Ao12:"+resultado)
            }
            else if(num==25){
                console.log("Ao25:"+resultado)
            }
            else if(num==50){
                console.log("Ao50:"+resultado)
            }
            else if(num==100){
                console.log("Ao100:"+resultado)
            }
        }

        else{
            // Toma los primeros N tiempos
            for(let i=0;i<num;i++){
                promedio.push(db[i])
            }

            // Cuenta DNFs
            let dnf= promedio.filter(x=>x==="DNF").length

            /*
             BLOQUE DNF >= 2
             Reglas especiales dependiendo del tamaño del average
            */
            if(dnf>=2){

                // Caso Ao100
                if(num==100){
                    promedio= promedio.filter(x => x !== "DNF");
                    promedio.sort((a, b) => a - b);

                    // Si supera límite permitido → DNF
                    if(dnf>5){
                        resultado= "DNF"
                        console.log("Ao100: "+resultado)
                    }
                    else if(dnf<6){
                        // Elimina 5 mejores
                        for(let i=0;i<5;i++){
                            promedio.shift();
                        }

                        // Ajuste dinámico según cantidad exacta de DNFs
                        if(dnf==4){
                            promedio.pop()
                        }
                        else if(dnf==3){
                            for(let i=0;i<2;i++){
                                promedio.pop()
                            }
                        }
                        else if(dnf==2){
                            for(let i=0;i<3;i++){
                                promedio.pop()
                            }
                        }
                    }
                }
                
                // Caso Ao50
                else if(num==50){
                    promedio= promedio.filter(x => x !== "DNF");
                    promedio.sort((a, b) => a - b);

                    if(dnf==2){
                        for(let i=0;i<3;i++){
                            promedio.shift();
                        }
                        promedio.pop()
                    }
                    else if(dnf>2){
                        if(dnf==3){
                            for(let i=0;i<3;i++){
                                promedio.shift();
                            }
                        }
                        else if(dnf>3){
                            resultado= "DNF"
                            console.log("Ao50: "+resultado)
                        }
                    }
                }

                // Caso Ao25 con exactamente 2 DNFs
                else if(dnf==2 && num==25){
                    promedio= promedio.filter(x => x !== "DNF");
                    promedio.sort((a, b) => a - b);
                    promedio.shift();
                    promedio.shift();
                }
                else{
                    resultado= "DNF"

                    if(num==5){
                        console.log("Ao5:"+resultado)
                    }
                    else if(num==12){
                        console.log("Ao12:"+resultado)
                    }
                    else if(num==25 && dnf>2){
                        console.log("Ao25:"+resultado)
                    }
                }
            }

            /*
             BLOQUE DNF == 1
             Se elimina proporcionalmente junto a extremos
            */
            else if(dnf==1){

                promedio= promedio.filter(x => x !== "DNF");
                promedio.sort((a, b) => a - b);

                if(num==100){
                    for(let i=0;i<5;i++){
                        promedio.shift();
                    }
                    for(let i=0;i<4;i++){
                        promedio.pop();
                    }    
                }
                else if(num==50){
                    for(let i=0;i<3;i++){
                        promedio.shift();
                    }
                    promedio.pop()
                    promedio.pop()
                }
                else if(num==25){
                    promedio.shift();
                    promedio.shift();
                    promedio.pop()
                }else{
                    promedio.shift();
                }
            }

            /*
             BLOQUE DNF == 0
             Eliminación estándar de mejores y peores
            */
            else if(dnf==0){
                promedio.sort((a, b) => a - b);

                if(num==100){
                    for(let i=0;i<5;i++){
                        promedio.shift()
                        promedio.pop()
                    }
                }
                else if(num==50){
                    for(let i=0;i<3;i++){
                        promedio.shift();
                        promedio.pop()
                    }
                }
                else if(num==25){
                    for(let i=0;i<2;i++){
                        promedio.shift(); 
                        promedio.pop();  
                    }
                }else{
                    promedio.shift(); 
                    promedio.pop();  
                }  
            }

            /*
             Cálculo final si no quedó como DNF
            */
            if(resultado!="DNF"){
                let operacion=0;

                for(let i=0;i<promedio.length;i++){
                    let suma= Number(promedio[i])
                    operacion= operacion+suma
                }

                let media;

                if(num==5){
                    media= operacion/3
                }
                else if(num==12){
                    media= operacion/10
                }
                else if(num==25){
                    media= operacion/21
                }
                else if(num==50){
                    media= operacion/44
                }
                else if(num==100){
                    media= operacion/90
                }

                resultado= media.toFixed(2)

                if(num==5){
                    console.log("Ao5:"+resultado)
                }
                else if(num==12){
                    console.log("Ao12:"+resultado)
                }
                else if(num==25){
                    console.log("Ao25:"+resultado)
                }
                else if(num==50){
                    console.log("Ao50:"+resultado)
                }
                else if(num==100){
                    console.log("Ao100:"+resultado)
                }
            }
        }

        return resultado
    }

    if(num==5){
        return ao5yao12(5)
    }
    else if(num==12){
        return ao5yao12(12)
    }
    else if(num==25){
        return ao5yao12(25)
    }
    else if(num==50){
        return ao5yao12(50)
    }
    else if(num==100){
        return ao5yao12(100)
    }
}


/*
 singleAndMedia

 - "single": mejor tiempo individual
 - "media": promedio global considerando reglas proporcionales de DNF
*/
export async function singleAndMedia(dato){

    let db= await arrayDB();
    let resultado;

    if(db.length<1){
        resultado= "--"
    }
    else{
        let promedio=[];

        for(let i=0;i<db.length;i++){
            promedio.push(db[i])
        }

        // Mejor single válido
        if(dato=="single"){
            promedio.sort((a, b) => a - b);
            promedio= promedio.filter(x => x !== "DNF")
            resultado= promedio[0];

            if(resultado==undefined){
                resultado="--"
            }
        }

        // Promedio global con tolerancia proporcional de DNFs
        else if(dato=="media"){

            let total= db.length
            let dnf= promedio.filter(x=>x==="DNF").length

            console.log("DNFS: "+dnf)

            promedio= promedio.filter(x => x !== "DNF")

            /*
             Reglas escalonadas de tolerancia DNF
             según tamaño total de solves
            */

            if(dnf>0){

                promedio.sort((a, b) => a - b);

                if(total<=12){
                    if(dnf==1){
                        promedio.shift()
                    }else if(dnf>=2){
                        resultado="DNF"
                    }
                }

                // Resto de bloques proporcionales siguen mismo patrón
                // Si DNFs exceden límite permitido → resultado = "DNF"
                // Si no → elimina proporcionalmente los peores tiempos

                else if(total>100){

                    // Cálculo dinámico por bloques de 100
                    let cien= 5
                    let sieteCinco= 4
                    let cincuenta= 3
                    let dosCinco= 2
                    
                    let calculo= Math.trunc(total/100)
                    let residuo= total- (calculo*100)

                    let dnfTotal=0;
                    
                    if(calculo>0){
                        for(let i=0;i<calculo;i++){
                            dnfTotal= dnfTotal+cien
                        }
                    }

                    if(residuo>0 && residuo<=25){
                        dnfTotal= dnfTotal+dosCinco
                    }
                    else if(residuo>25 && residuo<=50){
                        dnfTotal= dnfTotal+cincuenta
                    }
                    else if(residuo>50 && residuo<=75){
                        dnfTotal= dnfTotal+sieteCinco
                    }
                    else if(residuo>75 && residuo<=100){
                        dnfTotal= dnfTotal+cien
                    }

                    if(dnf>dnfTotal){
                        resultado= "DNF"
                    }else if(dnf<=dnfTotal){
                        for(let i=0;i<dnf;i++){
                            promedio.shift()
                        }
                    }
                }
            }

            // Cálculo final promedio global
            let operacion=0;

            for(let i=0;i<promedio.length;i++){
                let suma= Number(promedio[i])
                operacion= operacion+suma
            }

            if(resultado!="DNF"){
                resultado= (operacion/promedio.length).toFixed(2);
            }
        }
    }

    console.log(dato +" "+resultado)
    return resultado
}