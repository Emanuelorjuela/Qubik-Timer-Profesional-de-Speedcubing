# Qubik Timer

##1. Aplicación web de práctica profesional para speedcubing (3x3)

Qubik Timer es una aplicación web orientada a la práctica formal de speedcubing bajo estándares de competencia. El speedcubing consiste en resolver un cubo de Rubik en el menor tiempo posible utilizando scrambles oficiales y métricas estadísticas reguladas. Este proyecto reproduce ese entorno competitivo de forma digital: genera scrambles válidos, mide tiempos con lógica anti-accidental, registra cada solve en almacenamiento persistente y calcula estadísticas oficiales en tiempo real sin recargar la aplicación.

El objetivo del proyecto no es únicamente cronometrar resoluciones, sino modelar el flujo completo de entrenamiento competitivo: scramble → ejecución → registro → penalización → análisis estadístico → comparación histórica.

##2. Enfoque técnico general

La aplicación está desarrollada en HTML5, CSS y JavaScript moderno con ES Modules. La arquitectura es completamente modular y organizada en /src, separando responsabilidades en carpetas como core, scrambler, database, averages y styles. Existe un único punto de entrada desde core/main.js, evitando múltiples entry points en el HTML y manteniendo control estructural estricto.

La persistencia se implementa mediante IndexedDB, utilizando una base de datos llamada registros (versión 2) con dos object stores:

cube3x3 para los solves.

promDB para configuraciones de promedios (actual / best).

La aplicación funciona completamente offline y todos los datos permanecen almacenados de forma persistente en el navegador.

Modelo lógico del cubo 3x3

Se modeló un cubo Rubik 3x3 en 2D desde una perspectiva fija: blanco arriba y verde al frente, que es la orientación estándar utilizada en competiciones oficiales para la aplicación de scrambles.

Aunque la representación es bidimensional, la lógica interna replica exactamente el comportamiento físico de un cubo tridimensional real. Cada sticker está representado mediante clases que identifican su color. Internamente, el estado del cubo se gestiona a través de índices que representan posiciones específicas de cada sticker.

Los movimientos básicos (R, L, U, D, F, B) y sus variantes (’, 2) se implementan como intercambios matemáticos de esos índices. Cuando se ejecuta un movimiento, el sistema reubica las clases de color correspondientes simulando la rotación real de la cara y de las capas adyacentes. Esto garantiza consistencia lógica absoluta entre el estado visual renderizado y las reglas físicas del cubo real.

El cubo siempre parte de un estado completamente resuelto (estadoCero). Cualquier modificación del estado proviene exclusivamente de movimientos válidos aplicados desde el scramble o desde edición manual.



El generador produce secuencias aleatorias entre 20 y 23 movimientos, alineándose con estándares utilizados en competencia.

El algoritmo no genera movimientos arbitrarios simples. Incluye restricciones algebraicas para evitar secuencias redundantes o simplificables, como:

R R (equivalente a R2)

L L L (equivalente a L’)

Patrones paralelos como R L R que pueden simplificarse

Estas restricciones garantizan scrambles limpios, no reducibles y representativos de entorno competitivo real.

El scramble generado se escribe en un input que es interpretado en tiempo real. Cada movimiento válido se ejecuta inmediatamente sobre el render del cubo, manteniendo sincronización directa entre notación textual y estado visual.

El usuario ejecuta físicamente ese scramble en su cubo real para asegurar que el entorno digital y físico coincidan exactamente.

##3. Controles de scramble

La interfaz incluye dos controles principales:

R (Reiniciar): devuelve el cubo a estado resuelto, genera automáticamente un nuevo scramble, lo inserta en el input y lo ejecuta para renderizar la nueva mezcla.

E (Editar): permite modificar manualmente la secuencia de movimientos. Cualquier modificación válida se ejecuta en tiempo real sobre el cubo renderizado.

Esto permite tanto práctica estándar como análisis técnico de casos específicos.

##4. Cronómetro con lógica de competencia

El sistema de timing replica la activación estándar de competencia.

Para iniciar el cronómetro, el usuario debe mantener presionada la barra espaciadora durante al menos 300 ms y luego soltarla. Esto evita activaciones accidentales. El tiempo comienza al soltar la tecla y se detiene al volver a presionarla.

Al detenerse:

Se registra la solve.

El cubo regresa automáticamente a estado cero.

Se genera un nuevo scramble.

Las estadísticas se actualizan en tiempo real.

El flujo es continuo y no requiere interacción adicional para continuar entrenando.

Aquí puede añadirse un GIF mostrando:

Activación del timer.

Cambio de color de estado antes de iniciar.

Registro automático y nuevo scramble.

##5. Estructura de datos de cada solve

Cada vez que se detiene el cronómetro se construye un objeto solve con:

time

scramble

date (formato en-US)

dnf (boolean)

masDos (boolean)

timeMasDos

typeCube

Por defecto, dnf y masDos son false.

Cada registro se almacena en el object store cube3x3 de IndexedDB.

##6. Penalizaciones y gestión de registros

Cada tiempo se renderiza inmediatamente en una tabla del frontend.

Cada fila permite:

Aplicar penalización +2

Aplicar penalización DNF

Eliminar la solve (botón X)

Cuando se aplica +2:

Se suman dos segundos al tiempo.

Se actualiza tanto frontend como base de datos.

El tiempo cambia visualmente a color naranja.

Cuando se aplica DNF:

El tiempo se muestra como “DNF”.

Cambia visualmente a rojo.

Se actualiza el boolean correspondiente en la base de datos.

El botón X elimina completamente el registro del frontend y de cube3x3.

Todos los cambios impactan inmediatamente en las estadísticas.

##7. Overlay detallado por solve

Cada tiempo es seleccionable. Al hacer clic se abre un overlay con:

Tiempo registrado

Fecha

Tipo de cubo

Scramble en notación oficial

Render del estado correspondiente

Desde esta vista también pueden:

Aplicarse penalizaciones

Copiar el scramble

Eliminar la solve

Cerrar el overlay

Toda acción se sincroniza inmediatamente con la base de datos y con las estadísticas visibles.

Aquí pueden añadirse GIFs del overlay y su interacción.

## 4. Sistema de estadísticas oficiales

La aplicación implementa métricas estándar de competencia:

Mo3 calcula la media directa de 3 tiempos. No permite ningún DNF.

Ao5 elimina el mejor y el peor tiempo y promedia los 3 restantes. Permite máximo 1 DNF.

Ao12 elimina el mejor y el peor tiempo y promedia los 10 restantes. Permite máximo 1 DNF.

Ao25 elimina los 2 mejores y 2 peores tiempos y promedia 21. Permite máximo 2 DNFs.

Ao50 elimina los 3 mejores y 3 peores tiempos y promedia 44. Permite máximo 3 DNFs.

Ao100 elimina los 5 mejores y 5 peores tiempos y promedia 90. Permite máximo 5 DNFs.

Single obtiene el mejor tiempo individual excluyendo DNFs.

Media calcula el promedio total de todos los registros almacenados. El límite de DNF es dinámico y depende del total de solves. Cuando el total supera 100, el límite se acumula por bloques de 100 y bloques intermedios equivalentes (por ejemplo, 230 tiempos generan un límite acumulado de 12 DNFs según la suma proporcional de bloques).

Todas las estadísticas se recalculan en tiempo real cada vez que:

Se agrega una solve

Se elimina una solve

Se aplica o retira +2

Se aplica o retira DNF

No existe necesidad de recargar la aplicación.

Average of X: actual vs best

Las estadísticas AoX incluyen un selector que permite alternar entre:

actual: promedio calculado con los últimos X tiempos registrados.

best: mejor promedio histórico de X tiempos almacenado en la base de datos.

La preferencia seleccionada se guarda en promDB, lo que permite persistencia total entre sesiones.

Persistencia y base de datos

La base registros contiene:

cube3x3 con todos los solves.

promDB con configuraciones de visualización de promedios.

Al cerrar o reiniciar la aplicación:

Todos los tiempos permanecen.

Las penalizaciones permanecen.

Las estadísticas se recalculan al iniciar.

Las preferencias de visualización se restauran.

La aplicación es completamente offline-first.

Estado actual del proyecto

La lógica central del sistema está implementada y funcional:

Modelo de cubo consistente.

Generador de scrambles con restricciones.

Timer competitivo con activación controlada.

Persistencia robusta con IndexedDB.

Estadísticas oficiales con reglas formales.

Renderizado reactivo en tiempo real.

Actualmente se encuentra en fase de refinamiento visual. Algunos overlays de estadísticas y aspectos de diseño general están en proceso de pulido antes de la primera versión pública estable.

La primera versión estará orientada exclusivamente a escritorio y centrada en 3x3. En fases posteriores se contempla:

Soporte para nuevos tipos de cubo.

Estadísticas configurables.

Adaptación completa a dispositivos móviles.

Mejora del sistema visual y experiencia de usuario.
