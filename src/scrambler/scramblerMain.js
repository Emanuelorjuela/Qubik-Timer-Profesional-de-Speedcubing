// Importa el elemento del cubo en el DOM
import { cubo } from "./cube.js";

// Importa funciones y elementos relacionados con el scramble
import { scrambler, estadoCero, notacion } from "./scramblerEngine.js";

// Importa la función que configura los eventos del timer
import { eventosTimer } from "./timer.js"; 

// Importa la configuración de eventos del menú
import { eventosScramble } from "./ui.js";


// Permite aplicar manualmente un scramble cuando el usuario edita el input
notacion.addEventListener("input", () => {

  // Obtiene el texto actual del input
  let value = notacion.value;

  // Convierte el texto en un arreglo de movimientos
  let array = value.split(" ");

  // Reinicia el cubo antes de aplicar la nueva secuencia
  estadoCero(cubo);

  // Aplica los movimientos escritos manualmente
  scrambler(cubo, array);
});


// Espera a que el DOM cargue completamente antes de inicializar eventos
window.addEventListener("DOMContentLoaded", () => {

  // Activa la lógica del cronómetro
  eventosTimer();

  // Activa la lógica del menú de scramble
  eventosScramble();
});