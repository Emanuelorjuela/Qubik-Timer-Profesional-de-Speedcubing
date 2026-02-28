// Importa funciones relacionadas con el scramble
import { generador, scrambler, estadoCero } from "./scramblerEngine.js"

// Importa el elemento principal del cubo en el DOM
import { cubo } from "./cube.js";

// Selecciona el input donde se muestra la notación
const notacion = document.querySelector(".notacion");

// Por defecto el input es solo lectura
notacion.readOnly = true;

// Botones/opciones del menú de scramble
export const menuScramble = document.querySelectorAll(".btn2");

// Asigna los eventos a cada opción del menú
export function eventosScramble() {
  
  // Botón 0: generar nuevo scramble
  menuScramble[0].addEventListener("click", () => {

    // Reinicia el cubo a estado original
    estadoCero(cubo);

    // Limpia el input
    notacion.value = " ";

    // Genera y aplica un nuevo scramble
    scrambler(cubo, generador());
  });

  // Botón 1: activar/desactivar edición manual del scramble
  menuScramble[1].addEventListener("change", () => {

    // Si está activado, permite escribir en el input
    notacion.readOnly = !menuScramble[1].checked;

    // Si se activa, selecciona automáticamente el texto
    if (menuScramble[1].checked) notacion.select();
  });

  // Botón 2: copiar scramble al portapapeles
  menuScramble[2].addEventListener("click", () => {

    // Copia el contenido actual del input
    navigator.clipboard.writeText(notacion.value);
  });
}