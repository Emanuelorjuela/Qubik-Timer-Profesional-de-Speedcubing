// Importa las funciones que ejecutan los movimientos del cubo
import { movesRL, movesUD, movesFB, rotacion } from "./rotations.js"

// Importa el elemento del cubo en el DOM y los colores base
import { cubo, colors } from "./cube.js"

// Variables exportadas por si se necesitan en otros módulos
export let white, yellow, green, blue, red, orange;

// Input donde se muestra el scramble generado
export const notacion = document.querySelector(".notacion")

// Hace que el input sea solo lectura 
notacion.readOnly = true;

// Lista completa de movimientos posibles en notación estándar
export const moves = [
  "R","R'","R2","L","L'","L2","U","U'","U2","D","D'","D2",
  "F","F'","F2","B","B'","B2"
]

// Genera un scramble aleatorio válido
export const generador = () => {

  // Posibles longitudes del scramble
  let moves_scramble = [20,21,22,23]

  // Selecciona una longitud aleatoria
  let length_scramble = Math.floor(Math.random() * moves_scramble.length)
  let length = moves_scramble[length_scramble]

  let arraySc = [];

  for (let i = 0; i < length; i++) {
    let move;

    while (true) {

      // Selecciona un movimiento aleatorio
      let num = Math.floor(Math.random() * moves.length);
      move = moves[num];

      // Evita repetir la misma cara consecutivamente
      if (i >= 1 && move[0] === arraySc[i-1][0]) {
        continue; 
      }
      
      // Evita patrón como R L R (misma cara alternada)
      if (i >= 2 && move[0] === arraySc[i-2][0] && move[0] !== arraySc[i-1][0]) {
        continue;
      }

      break;
    }

    arraySc.push(move);
  }

  // Muestra el scramble en el input
  notacion.value = arraySc.join(" ")

  return arraySc
}

// Aplica una secuencia de movimientos al cubo
export const scrambler = (cube, comb) => {

  // Obtiene las fichas de cada cara por su color
  const white  = cube.querySelectorAll(".white")
  const blue   = cube.querySelectorAll(".blue")
  const green  = cube.querySelectorAll(".green")
  const yellow = cube.querySelectorAll(".yellow")
  const orange = cube.querySelectorAll(".orange")
  const red    = cube.querySelectorAll(".red")

  // Agrupa las caras en un objeto
  const faces = { white, yellow, green, blue, orange, red };

  // Recorre cada movimiento del scramble
  for (let move of comb) {

    const base = move[0];      // Letra principal (R, L, U, etc.)
    const type = move.slice(1); // Tipo (' o 2)

    // Asocia cada cara con su función correspondiente
    const map = {
      R: movesRL, L: movesRL,
      U: movesUD, D: movesUD,
      F: movesFB, B: movesFB
    };

    const func = map[base];
    if (!func) continue;

    // Movimiento doble
    if (type === "2") {
      func(base, faces);
      func(base, faces);
    } 
    // Movimiento inverso
    else if (type === "'") {
      func(base + "'", faces); 
    } 
    // Movimiento simple
    else {
      func(base, faces);
    }
  }
}

// Ejecuta automáticamente un scramble al cargar
scrambler(cubo, generador())

// Restaura el cubo a su estado inicial
export const estadoCero = (cube) => {

  const caras = cube.querySelectorAll(".cara");
  
  caras.forEach((cara, i) => {

    const fichas = cara.querySelectorAll("div");

    fichas.forEach((ficha) => {

      // Elimina clases actuales
      ficha.className = "";

      // Asigna el color original según el índice de la cara
      ficha.classList.add(colors[i]); 
    });
  });
};