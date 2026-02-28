import{ notacion } from "../scrambler/scramblerEngine.js"
import{ cronometro } from "../scrambler/timer.js"

/*
 Genera y devuelve un objeto con toda la información
 necesaria para registrar un solve en la base de datos.
 
 Centraliza la construcción del registro para mantener
 consistencia en el formato de guardado.
*/
export const arrayInfo=()=>{

	let solve = {

	// Tiempo mostrado actualmente en el cronómetro.
	// Se guarda como string (tal como aparece en pantalla).
	time: cronometro.textContent,

	// Scramble utilizado en el solve.
	// Se toma directamente del input de notación.
	scramble: notacion.value,

	// Fecha formateada en estilo US:
	// Ejemplo: "February 27, 2026, 3:45 PM"
	// Incluye día, mes, año y hora en formato 12h.
	date: new Date().toLocaleString('en-US', { 
		month: 'long', 
		day: '2-digit', 
		year: 'numeric', 
		hour: 'numeric', 
		minute: '2-digit', 
		hour12: true 
	}),

	// Indicador de DNF (Did Not Finish).
	// Por defecto el solve es válido.
	dnf: false,

	// Indicador de penalización +2 segundos.
	// Inicialmente no tiene penalización.
	masDos: false,

	// Tiempo calculado con penalización +2.
	// Se convierte a número para poder sumar.
	// Este valor se usa si masDos = true.
	timeMasDos: Number(cronometro.textContent)+2,

	// Valor alternativo cuando el solve es DNF.
	// Se usa como representación textual.
	timeDNF: "DNF",

	// Tipo de cubo registrado.
	// Permite escalar a otros eventos (2x2, 4x4, etc.).
	typeCube:"3x3"
};

	return solve
}
