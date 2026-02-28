/*
 Objetos globales exportados para almacenar estado compartido
 entre módulos del sistema de estadísticas.
 
 Se exportan como "let" para permitir reasignación o mutación
 desde otros archivos que los importen.
*/

 // Contenedor para promedios parciales (Ao5, Ao12, Ao25, etc.)
 // Aquí se pueden guardar resultados ya calculados
 // para evitar recálculos innecesarios.
export let promedios_p= {}

 // Contenedor para valores de:
 // - mejor single
 // - media global
 // Permite centralizar estos datos y reutilizarlos en la UI.
export let mediaSingle_p={}

 // Contenedor para referencias de selects del DOM
 // (por ejemplo filtros o configuraciones activas).
 // Facilita acceso compartido a elementos seleccionados.
export let selects={}