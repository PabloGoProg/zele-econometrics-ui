# PLAN — Frontend de modelos econométricos (React)

Este documento consolida el backlog inicial de historias de usuario para una aplicación web que consume una API backend de modelos econométricos y permite hacer predicciones y visualizar resultados.

## Stack definido

- Data fetching/cache: **TanStack Query**
- Estado UI (workspace, tabs, drafts, historial, undo): **Zustand**
- Routing: **React Router**
- Forms + validación: **React Hook Form + Zod**
- Estilos: **Tailwind CSS**
- UI primitives: **Radix UI**
- Sliders: **Radix Slider**
- Charts: **Recharts**
- HTTP client: **Axios**
- Base: **TypeScript**
- Calidad: **ESLint + Prettier**

## Decisiones funcionales cerradas

- Auth con **JWT en cookies httpOnly**. Duración del token: **1 día**. Sin roles.
- Registro inmediato: campos **nombre, email, password**.
- Login: **email, password**.
- Password: mínimo con **1 mayúscula, 1 minúscula y 1 caracter especial**.
- Endpoints base:
  - `GET /models`: lista de modelos con **nombre** y **descripción**.
  - Un endpoint de schema por modelo (asumido): `GET /models/:id/schema` o equivalente, con:
    - inputs numéricos (nombre, default, min, max, descripción).
  - Predicción síncrona (asumido): `POST /models/:id/predict`.
  - Datos de gráficas y contribuciones vienen desde backend.
- Navegación tipo Obsidian:
  - **1 tab por modelo** (no duplicados).
  - Tab **Home pinneada** (no cerrable).
  - Tabs y estado se **persisten en localStorage** y se restauran al recargar.
- Inputs:
  - Cambio por **slider** y por **campo numérico** (sincronizados).
  - Mostrar **min/máx debajo** del input.
  - Si el usuario escribe fuera de rango: **se conserva el valor anterior** (no clamp).
  - Los límites **pueden ajustarse** desde la UI (por input).
  - Valores faltantes los maneja el backend.
- Predicción:
  - Límite: **20 predicciones / 5 minutos**.
  - Guardar **historial** (en memoria + localStorage).
- Resultados:
  - Punto estimado (sin intervalos).
  - Mostrar **contribución por variable**.
  - Mostrar **versión** y **fecha de entrenamiento** del modelo.
- UI:
  - Minimalista estilo “startup”.
  - Tema único claro con paleta **monocromática azul**, predominio de azul oscuro en acentos/controles.
  - Enfoque **desktop**.
- Errores:
  - Mensajes no técnicos; si metadata ok pero predict falla, explicar en lenguaje usuario.

---

# EPIC 1 — Autenticación y sesión

## HU-1.1 Registro
**Como** visitante  
**Quiero** registrarme con nombre, email y contraseña  
**Para** poder acceder a los modelos

Criterios de aceptación
- Form con `nombre`, `email`, `password`.
- Validación en cliente con Zod:
  - Email válido.
  - Password: al menos 1 mayúscula, 1 minúscula, 1 caracter especial (y longitud mínima configurable).
- Estado UI: idle / loading / error / success.
- Si backend responde error (email ya registrado, etc.), se muestra un mensaje breve y claro.
- Al completar registro: redirige a **/login** o inicia sesión automáticamente (definido por backend; el frontend soporta ambos flujos).

Notas técnicas
- RHF + Zod para validación y mensajes de error consistentes.
- Axios con `withCredentials: true` si el backend setea cookies al registrarse.

## HU-1.2 Login
**Como** usuario  
**Quiero** iniciar sesión con email y contraseña  
**Para** entrar al workspace

Criterios de aceptación
- Form con `email`, `password`.
- Al éxito: redirige a `/app` y carga Home + tabs restauradas.
- Manejo de 401: mensaje “Credenciales incorrectas”.
- Si el backend setea cookie httpOnly, el frontend no lee tokens; valida sesión por un endpoint `GET /me` o equivalente (si existe) o por respuesta del login.

## HU-1.3 Protección de rutas
**Como** usuario autenticado  
**Quiero** que las rutas internas estén protegidas  
**Para** no exponer pantallas sin sesión

Criterios de aceptación
- Rutas públicas: `/login`, `/register`.
- Rutas privadas: `/app/*`.
- Si no hay sesión válida y se intenta entrar a `/app/*`, redirige a `/login`.
- Si ya hay sesión y se visita `/login` o `/register`, redirige a `/app`.

## HU-1.4 Header global con logout (icono)
**Como** usuario  
**Quiero** ver un header con un icono para cerrar sesión  
**Para** salir rápidamente de la app

Criterios de aceptación
- Header visible en **todas las vistas**, incluido login/register.
- En vistas públicas, el icono puede ocultarse o mostrarse deshabilitado.
- Al click en logout:
  - Llama endpoint de logout (invalida token en backend).
  - Limpia estado cliente (Zustand + Query cache + localStorage relevante).
  - Redirige a `/login`.

---

# EPIC 2 — Home y catálogo de modelos

## HU-2.1 Listar modelos en Home
**Como** usuario  
**Quiero** ver la lista de modelos disponibles  
**Para** escoger cuál usar

Criterios de aceptación
- Home (tab pinneada) consume `GET /models`.
- Render en lista/grid minimalista:
  - nombre
  - descripción
  - CTA: “Abrir”
- Estados: loading, error, empty.
- Búsqueda por texto (client-side) cuando el listado supere un umbral (p.ej. > 10).

## HU-2.2 Mostrar métricas del modelo (preview)
**Como** usuario  
**Quiero** ver métricas de calidad del modelo antes o al abrirlo  
**Para** entender qué tan confiable es

Criterios de aceptación
- Al abrir un modelo (o en un modal “ver detalles”), se muestran métricas (p.ej. R², RMSE, MAE, etc.) si el backend las provee.
- Mostrar advertencia: “Modelo entrenado (no se ajusta con tus datos en tiempo real)”.
- Mostrar versión y fecha de entrenamiento si está disponible desde metadata.

---

# EPIC 3 — Workspace tipo Obsidian (tabs/paneles)

## HU-3.1 Tab Home pinneada (no cerrable)
**Como** usuario  
**Quiero** un tab Home siempre disponible  
**Para** abrir modelos sin perder el contexto

Criterios de aceptación
- Home aparece como primer tab y **no tiene botón de cerrar**.
- Si por error el estado la oculta, al iniciar la app se rehidrata y se fuerza su presencia.

## HU-3.2 Abrir modelo como tab único
**Como** usuario  
**Quiero** abrir un modelo en un tab  
**Para** usarlo sin recargar la página

Criterios de aceptación
- Click “Abrir” en Home:
  - Si el tab del modelo ya existe: se enfoca.
  - Si no existe: se crea tab y se navega a su ruta.
- El tab muestra nombre del modelo y botón de cerrar.
- Cerrar tab elimina su estado (drafts, gráficos, etc.) del store y del localStorage asociado.

## HU-3.3 Barra de tabs: activar y cerrar
**Como** usuario  
**Quiero** navegar entre tabs y cerrarlos  
**Para** trabajar con varios modelos en paralelo

Criterios de aceptación
- Click en un tab lo activa.
- Click en “X” cierra el tab (sin confirmación).
- Navegar con teclado (opcional): `Ctrl/Cmd + Tab`, `Ctrl/Cmd + W` (si lo implementas).

## HU-3.4 Persistencia del workspace
**Como** usuario  
**Quiero** que mis tabs y valores se mantengan tras recargar  
**Para** continuar donde quedé

Criterios de aceptación
- Al abrir/editar tabs, el workspace se guarda en localStorage:
  - lista de tabs abiertos
  - tab activo
  - por tab: inputs actuales, límites ajustados, última predicción, datos de gráficos, historial local del tab
- Al cargar `/app`:
  - se rehidrata el store desde localStorage
  - se valida que los modelos aún existan (si un modelo ya no está en `/models`, se cierra ese tab y se notifica).

---

# EPIC 4 — Panel de modelo: inputs, límites y reset/undo

## HU-4.1 Construcción dinámica de inputs desde backend
**Como** usuario  
**Quiero** ver los inputs del modelo generados dinámicamente  
**Para** no depender de UI hardcodeada por modelo

Criterios de aceptación
- Al entrar a `/app/model/:id`:
  - fetch schema del modelo (inputs numéricos).
- Cada input muestra:
  - label (nombre)
  - tooltip con descripción (Radix Tooltip)
  - slider + campo numérico
  - min/máx visible debajo
- Si schema falla: mostrar estado de error con opción “reintentar”.

## HU-4.2 Slider + campo numérico sincronizados
**Como** usuario  
**Quiero** ajustar un input por slider o escribiendo el número  
**Para** velocidad y precisión

Criterios de aceptación
- Slider y campo numérico reflejan el mismo valor.
- Cambios por slider aplican debounce configurable (p.ej. 100–250ms) para no recalcular/renderizar excesivo.
- Si el usuario escribe un valor inválido o fuera de rango:
  - se muestra feedback breve (“fuera de rango”)
  - el valor **no cambia** (se conserva el anterior)
- Mostrar step si existe (o default sensible).

## HU-4.3 Ajustar límites min/máx de un input
**Como** usuario  
**Quiero** ajustar los límites del slider (min y max)  
**Para** explorar escenarios fuera del rango inicial

Criterios de aceptación
- Cada input permite editar `min` y `max` (UI compacta: “Editar rango”).
- Validación:
  - min < max
  - el valor actual debe quedar dentro; si no, el usuario debe corregir rango o valor (sin clamp automático).
- Persistencia por tab en localStorage.

## HU-4.4 Reset a defaults del modelo
**Como** usuario  
**Quiero** resetear los valores a los defaults del modelo  
**Para** volver rápido al baseline

Criterios de aceptación
- Botón “Reset” en el panel:
  - restaura valores a defaults provistos por backend
  - restaura límites min/máx al default del schema
  - limpia resultados y gráficos del panel
- El reset queda registrado para permitir Undo.

## HU-4.5 Undo del último cambio relevante
**Como** usuario  
**Quiero** deshacer mi última acción (cambios, reset, etc.)  
**Para** recuperar un estado anterior sin reconstruirlo

Criterios de aceptación
- Botón “Undo” habilitado cuando hay snapshot previo.
- Undo revierte al estado inmediatamente anterior del panel:
  - inputs
  - límites
  - resultados/gráficos
- Implementación recomendada:
  - snapshots acotados (p.ej. 20) para no inflar localStorage.

---

# EPIC 5 — Predicción: ejecución, límites y historial

## HU-5.1 Ejecutar predicción síncrona
**Como** usuario  
**Quiero** ejecutar una predicción con mis inputs  
**Para** obtener un resultado numérico y gráficos

Criterios de aceptación
- Botón “Predecir”.
- Request al backend con payload de inputs.
- Estados:
  - loading (spinner/estado en botón)
  - success (render resultados)
  - error (mensaje no técnico + reintentar)
- En success, se actualiza:
  - valor predicho
  - contribuciones
  - datos de gráficos
  - metadata (versión, fecha entrenamiento)

## HU-5.2 Rate limit en UI: 20 predicciones / 5 minutos
**Como** usuario  
**Quiero** que la UI me avise cuando alcance el límite de predicciones  
**Para** entender por qué no puedo predecir más

Criterios de aceptación
- Contador local por ventana de 5 minutos (sin depender del backend, pero consistente con errores 429).
- Si se alcanza límite:
  - deshabilitar botón “Predecir”
  - mostrar mensaje “Has alcanzado el límite. Intenta de nuevo en X:YY.”
- Si backend responde 429:
  - mostrar el mismo mensaje (preferiblemente usando headers si el backend los envía: `Retry-After`).

## HU-5.3 Historial de predicciones por modelo (local)
**Como** usuario  
**Quiero** ver mis predicciones recientes en el tab del modelo  
**Para** consultar rápidamente qué probé

Criterios de aceptación
- Lista de historial con:
  - timestamp
  - resumen de inputs (colapsable)
  - resultado predicho
- Guardado en memoria + localStorage como parte del estado del tab.
- Máximo configurable (p.ej. 50 por modelo) para controlar tamaño.

---

# EPIC 6 — Resultados, contribuciones y gráficas

## HU-6.1 Resultado principal + metadata del modelo
**Como** usuario  
**Quiero** ver el resultado de la predicción y metadata del modelo  
**Para** interpretar el valor y saber con qué versión se calculó

Criterios de aceptación
- Mostrar:
  - predicción (punto estimado)
  - versión del modelo
  - fecha de entrenamiento
- Presentación clara (sin tecnicismos de infraestructura).

## HU-6.2 Contribución por variable
**Como** usuario  
**Quiero** ver la contribución de cada variable al resultado  
**Para** entender qué está empujando la predicción

Criterios de aceptación
- Tabla o gráfico de barras con contribuciones por variable (provistas por backend).
- Ordenable por magnitud (desc).
- Tooltip/nota: “contribuciones calculadas por el modelo entrenado”.

## HU-6.3 Gráficas (datos provistos por backend)
**Como** usuario  
**Quiero** ver gráficas relacionadas con la predicción  
**Para** contextualizar el resultado

Criterios de aceptación
- Render con Recharts usando series entregadas por el backend.
- Estados: loading/empty/error (si el backend no entrega data para una gráfica).
- No se requiere comparar múltiples predicciones en un mismo gráfico.

---

# EPIC 7 — Mensajes de error, resiliencia y UX

## HU-7.1 Mensajes de error no técnicos
**Como** usuario  
**Quiero** mensajes claros cuando algo falla  
**Para** saber qué hacer sin leer detalles de programación

Criterios de aceptación
- Errores comunes:
  - 401: “Tu sesión expiró. Inicia sesión de nuevo.”
  - 403: “No tienes acceso a este recurso.”
  - 404 modelo: “El modelo ya no está disponible.”
  - 429: rate limit con countdown
  - 5xx o timeout: “No se pudo completar la predicción. Intenta de nuevo.”
- No mostrar stack traces ni mensajes crudos del servidor.

## HU-7.2 Fallo parcial: schema ok, predict falla
**Como** usuario  
**Quiero** seguir viendo mis inputs aunque falle la predicción  
**Para** reintentar sin perder trabajo

Criterios de aceptación
- Si `predict` falla:
  - mantener inputs y límites intactos
  - mantener última predicción exitosa (si existe) con marca “no actualizada”
  - mostrar CTA “Reintentar”.

---

# EPIC 8 — Estilo visual minimalista

## HU-8.1 Sistema visual monocromático azul (claro)
**Como** usuario  
**Quiero** una interfaz minimalista tipo startup  
**Para** enfocarme en el análisis

Criterios de aceptación
- Fondo claro, tipografía limpia, espaciado consistente.
- Acentos azul oscuro (botones primarios, tabs activos, sliders, links).
- Componentes accesibles (focus visible, labels).
- Layout optimizado para desktop (paneles amplios, barras compactas).

---

## Riesgos y decisiones que te conviene revisar (no bloquea el MVP, pero te puede explotar después)

1) **LocalStorage**: guardar tabs + inputs + historial + gráficos puede exceder cuota del navegador si los datasets de gráficas son grandes. Solución típica: limitar historial, recortar series, o guardar solo IDs y recargar data.
2) **“Límites ajustables”**: permitir min/máx arbitrarios facilita inputs fuera del dominio de entrenamiento. Si el backend no valida/advierte, terminarás mostrando predicciones sin sentido. Mínimo: advertencia visible cuando el usuario excede rangos recomendados.
3) **Contribuciones**: en regresión lineal “contribución” puede ser interpretable, pero si hay normalización/transformaciones, la contribución directa coef*valor puede ser engañosa. Asegúrate de que el backend entregue contribuciones ya interpretadas.
4) **JWT 1 día sin refresh**: si la gente deja la app abierta, verán fallos al expirar. Maneja 401 con re-login claro.
5) **Rate limit**: si el backend y el frontend no comparten la misma ventana exacta, el contador local se desincroniza. Ideal: el backend expone `Retry-After` o un header con el reset.

