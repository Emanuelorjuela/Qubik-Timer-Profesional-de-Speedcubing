

// Importa opciones del menú relacionadas con el scramble
import { menuScramble } from "./ui.js"

// Función para guardar un solve en la base de datos
import { añadir } from "../database/crud.js";

// Función que genera el objeto con la información del solve actual
import { arrayInfo } from "../solves/solveFactory.js"

// Elemento del DOM donde se muestra el tiempo
export const cronometro = document.querySelector(".time");

// Variable que guarda el momento exacto en que inicia el timer
let inicio = null;

// Actualiza el tiempo mostrado en pantalla
export function actualizar() {
  const ahora = new Date();

  // Diferencia en milisegundos desde que inició el timer
  const tiempoTranscurrido = ahora - inicio;

  // Convierte a segundos
  let segundos = tiempoTranscurrido / 1000;

  // Muestra siempre 2 decimales
  let texto = segundos.toFixed(2);

  // Actualiza el contenido del cronómetro
  cronometro.textContent = texto;
}

// Controla todos los eventos del teclado para el timer
export function eventosTimer() {

  let intervalo = null;        // Guarda el setInterval
  let presionInicio = null;    // Momento en que se presiona Space
  let presionado = false;      // Indica si Space está presionado
  let corriendo = false;       // Indica si el cronómetro está activo

  document.addEventListener("keydown", (e) => {

    // Si el menú está en modo scramble manual, no permitir timer
    if (menuScramble[1].checked) return;

    if (e.code === "Space" && !presionado) {
      e.preventDefault();

      presionado = true;
      presionInicio = Date.now();

      // Si no está corriendo, comienza proceso de preparación
      if (!corriendo) {

        // Rojo mientras se mantiene presionado
        cronometro.style.color = "red";

        // Después de 300ms cambia a verde (listo para iniciar)
        setTimeout(() => {
          if (presionado && !corriendo) {
            cronometro.style.color = "green";
          }
        }, 300);
      }
    }

    // Reinicia el timer si se presiona Escape mientras está corriendo
    if (e.code === "Escape" && corriendo) {
      clearInterval(intervalo);
      intervalo = null;
      corriendo = false;

      cronometro.textContent = "0.00";
      cronometro.style.color = "black";
    }
  });

  document.addEventListener("keyup", (e) => {

    if (menuScramble[1].checked) return;

    if (e.code === "Space") {
      e.preventDefault();

      let duracion = Date.now() - presionInicio;

      // Inicia el timer si estuvo presionado al menos 300ms
      if (!corriendo && duracion >= 300) {

        inicio = new Date();
        intervalo = setInterval(actualizar, 10);
        corriendo = true;
        cronometro.style.color = "black";

      } 
      // Si ya estaba corriendo, lo detiene y guarda el solve
      else if (corriendo) {

        clearInterval(intervalo);
        intervalo = null;
        corriendo = false;

        // Guarda el tiempo en la base de datos
        añadir(arrayInfo())

        cronometro.style.color = "black";

        // Genera nuevo scramble automáticamente
        menuScramble[0].click()
      } 
      else {
        cronometro.style.color = "black";
      }

      presionado = false;
    }
  });
}
