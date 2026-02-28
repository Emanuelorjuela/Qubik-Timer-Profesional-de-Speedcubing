// Contenedor principal del cubo en el DOM
export const cubo = document.querySelector(".cubo")

// Contenedor de botones o controles del cubo
export const btns = document.querySelector(".btns")

// Colores correspondientes a las 6 caras del cubo 3x3
export const colors = ["white", "blue", "green", "yellow", "red", "orange"]

/*
 * crearCaras(div)
 * Genera dinámicamente las 6 caras del cubo.
 * Cada cara contiene 9 fichas (3x3) con su color correspondiente.
 */
export function crearCaras(div) {

    for (let color of colors) {

        // Crear contenedor de la cara
        let cara = document.createElement("DIV")
        cara.classList.add("cara")

        // Crear 9 fichas por cara
        for (let i = 0; i < 9; i++) {
            let ficha = document.createElement("DIV")
            ficha.classList.add(color)
            cara.appendChild(ficha)
        }

        // Agregar la cara al cubo
        div.appendChild(cara)
    }
}

// Inicialización automática del cubo al cargar el módulo
crearCaras(cubo)