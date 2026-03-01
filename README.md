# **Qubik Timer — Speedcubing Trainer (3×3)**

# **2. Descripción general**

La idea central es reproducir el flujo básico de una sesión de entrenamiento de speedcubing: generar un scramble, aplicar ese scramble al cubo (el usuario replica la misma secuencia en su cubo físico), cronometrar la resolución, guardar el resultado y actualizar las estadísticas. El cubo se representa visualmente en 2D desde una única perspectiva (cara blanca arriba, verde al frente), que es la orientación estándar para aplicar scrambles en competiciones. Aunque la vista es 2D, los movimientos y la lógica interna replican fielmente las rotaciones y efectos de un cubo 3D. Cada “sticker” es una clase CSS que indica color; los movimientos se implementan intercambiando clases entre índices que representan posiciones físicas del cubo.

Un usuario típico: genera o edita un scramble, replica ese scramble en su cubo físico, prepara el cubo y usa la barra espaciadora según la mecánica (mantener 300 ms y soltar para iniciar, presionar para detener). Al detenerse, el sistema crea y guarda un objeto con la información del solve, lo muestra en la lista de historial y recalcula todas las estadísticas en tiempo real.

---

# **3. Flujo funcional (qué sucede cuando usas la app)**

Cuando el usuario abre la aplicación se inicializa IndexedDB y se renderiza la interfaz en base a los datos almacenados. El generador crea scrambles de 20–23 movimientos aplicando restricciones para evitar secuencias redundantes o trivialmente simplificables (por ejemplo, evita R R que es R2, L L L que equivale a L', o patrones alternados R L R que simplifican). El scramble aparece en un campo input y se aplica automáticamente al cubo renderizado; si el usuario edita ese input, el cubo se actualiza en tiempo real con los movimientos válidos introducidos.

El cronómetro opera con la lógica competitiva: para iniciar se mantiene presionada la barra espacio ≥ 300 ms y al soltar comienza la medición; para detener se vuelve a presionar. Al detenerse, se crea un objeto solve que contiene el tiempo, scramble, fecha, tipo de cubo y dos flags por penalización (masDos y dnf). Ese objeto se guarda en IndexedDB (store cube3x3) y se muestra inmediatamente en la lista del frontend. Las penalizaciones +2 y DNF se pueden aplicar desde la lista o desde la vista detallada del solve (overlay); cualquier cambio se persiste en la DB y recalcula las estadísticas al instante.

---

# **4. Detalle técnico del modelo del cubo y movimientos**

Aunque la interfaz es 2D, la representación sigue índices equivalentes a la estructura 3×3 de cada cara. Cada cara es una matriz de 9 posiciones; los movimientos se implementan con funciones que rotan internamente esa matriz y reasignan stickers entre caras adyacentes según reglas de cubo real. Las operaciones soportadas incluyen movimientos simples (R, L, U, D, F, B), inversos (R', L', …) y dobles (R2, …). Las funciones están separadas por tipo: rotaciones internas de cara y transferencias entre caras (lateral / superior-inferior / frente-atrás). estadoCero() devuelve el cubo a su estado resuelto re-asignando las clases de color por cara.

---

# **5. Penalizaciones y sincronización**

La aplicación implementa dos estados de penalización estandarizados: +2 y DNF. +2 suma 2 segundos al tiempo y se usa cuando el solve es válido pero hubo una infracción menor. DNF marca la resolución como no válida. Cuando el usuario aplica una penalización, el valor mostrado en la interfaz cambia (color naranja para +2, rojo para DNF), y la entrada correspondiente en IndexedDB se actualiza. Las estadísticas se recalculan inmediatamente para reflejar cualquier cambio en tiempo real.

---

# **6. Estadísticas (explicación y reglas aplicadas)**

La app calcula ocho métricas principales y las mantiene actualizadas en tiempo real:

Mo3 calcula la media directa de los 3 últimos tiempos. No permite DNFs; si aparece un DNF en el conjunto, el resultado de Mo3 es DNF.

Ao5 toma 5 tiempos, elimina el mejor y el peor, y promedia los 3 restantes. Su límite de DNFs es 1: si hay más de uno la estadística es DNF.

Ao12 toma 12 tiempos, elimina el mejor y el peor y promedia los 10 restantes. Límite de DNFs: 1.

Ao25 toma 25 tiempos, elimina los 2 mejores y 2 peores, y promedia los 21 restantes. Límite de DNFs: 2.

Ao50 toma 50 tiempos, elimina los 3 mejores y 3 peores, y promedia los 44 restantes. Límite de DNFs: 3.

Ao100 toma 100 tiempos, elimina los 5 mejores y 5 peores, y promedia los 90 restantes. Límite de DNFs: 5.

La Media calcula el promedio de todos los tiempos almacenados. Su límite de DNFs es dinámico: si hay menos de 100 registros se aplica la regla de la estadística inmediatamente inferior (por ejemplo, con 30 tiempos aplica la lógica de Ao25); si hay más de 100, el límite se acumula por bloques (por ejemplo, con 230 tiempos se suman dos bloques de 100 y un bloque de 25, resultando en 12 DNFs permitidos). Single muestra el mejor tiempo individual (excluye DNFs).

Cada AoX en la UI tiene un selector que permite ver “Actual” (promedio de los últimos X tiempos) o “Best” (mejor promedio histórico). Esa preferencia se guarda en el store promDB para persistencia entre sesiones.

---

# **7. Persistencia de datos**

El proyecto usa IndexedDB para almacenamiento local sin servidor. Hay al menos dos objectStores: cube3x3 para cada solve registrado y promDB para las preferencias de visualización de promedios. Los datos persisten entre cierres del navegador y reinicios de la app, permitiendo continuidad y rehidratación completa del estado en cada sesión.

---

# **8. Estructura del proyecto (organización recomendada)**

La estructura mostrada es la que se utilizó para desarrollar y organizar responsabilidades. Mantener nombres de carpetas en minúsculas es importante por sensibilidad a mayúsculas en entornos y para evitar errores de importación.

---

# **9. Tecnologías utilizadas**

La aplicación utiliza únicamente tecnologías web estándar y nativas del navegador: HTML5 para la estructura, CSS3 para estilos y diseño, JavaScript moderno (ES Modules) para toda la lógica. IndexedDB se usa para persistencia local. El proyecto está preparado para ejecutarse en un servidor local sencillo (ej.: http-server, XAMPP, Live Server en VS Code) o desplegarse en hosting estático.

---

# **10. Uso e instalación rápida**

Para probar localmente, clona el repositorio, abre la carpeta en un servidor local (no abrir file:// directamente porque los módulos ES y algunas APIs requieren servidor). Asegúrate de mantener la estructura de carpetas y las rutas en minúsculas. Abre index.html a través del servidor; la app inicializará la base de datos y renderizará la interfaz. El entry point es src/core/main.js.

---

# **11. Consejos operativos y notas de desarrollo**

Es crítico mantener nombres de carpetas y archivos en minúsculas y verificar las rutas relativas en todos los import debido a que la resolución de módulos es case-sensitive en muchos entornos. Debe existir un único entry point cargado desde index.html; todos los demás módulos se importan desde ahí para evitar doble ejecución o conflictos. Si se trabaja con Git en Windows y se necesita cambiar solo el casing de una carpeta, renómbrala en dos pasos (temp → desired) para que Git detecte el cambio.

---

# **12. Estado del proyecto y roadmap**

La funcionalidad central está implementada: generador de scrambles, render del cubo, cronómetro competitivo, almacenamiento persistente y cálculo de estadísticas en tiempo real. Quedan tareas pendientes de pulido visual (mejorar overlays de promedios, diseño de tarjetas, responsividad) y ampliación de funcionalidades (soporte para otros tipos de cubo, exportación de datos, personalización de reglas de cálculo). La primera versión pública será para escritorio centrada en 3×3; versiones
