# Documentacion de pruebas automatizadas

## Herramienta usada

Se usa Playwright con Chromium para pruebas end-to-end y funcionales sobre el frontend HTML/CSS/JavaScript vanilla.

La configuracion esta en `playwright.config.js` y levanta dos servidores durante la ejecucion:

- Frontend estatico: `http://127.0.0.1:4173`
- Backend API: `http://127.0.0.1:4000/api`

Tambien se puede ejecutar la misma suite contra el frontend publico de Netlify:

```text
https://rentia-booking.netlify.app
```

En ese modo Playwright no levanta el servidor estatico local del frontend. Solo levanta el backend local porque el JavaScript actual del frontend usa `http://localhost:4000/api` como API base.

Para evitar bloqueos del navegador por Private Network Access al probar una pagina HTTPS contra `localhost`, la suite intercepta las llamadas a `http://localhost:4000/api/**` y las resuelve desde Playwright contra el backend local.

El reporte HTML se genera en:

```text
playwright-report/index.html
```

## Estrategia de testing

Para este proyecto vanilla se eligieron pruebas de aceptacion de alto nivel, enfocadas en los flujos que usa una persona real:

- Navegacion entre paginas principales.
- Validacion de carga de `index.html`.
- Login con credenciales validas e invalidas.
- Registro con campos vacios y registro valido.
- Flujo completo de reserva.
- Dashboard de huesped con reservas.
- Dashboard de anfitrion con confirmacion de reserva.
- Validacion de estado actualizado en el dashboard del huesped.

Las pruebas usan selectores existentes (`id`, clases y textos visibles). No se agregaron cambios visuales para testear.

## Casos de prueba

### 1. Navegacion principal

Pasos:

1. Abrir `index.html`.
2. Verificar titulo y hero principal.
3. Navegar a `search.html`.
4. Volver al inicio desde el logo.
5. Navegar a `assistant.html`.

Resultado esperado:

- Las paginas cargan sin errores JavaScript.
- La navegacion cambia a la URL correcta.

Resultado obtenido:

- Correcto.

### 2. Login invalido

Pasos:

1. Abrir `login.html`.
2. Ingresar email y password incorrectos.
3. Enviar formulario.

Resultado esperado:

- Se muestra el mensaje: `No pudimos iniciar sesión. Verifica tus datos.`
- La pagina permanece en login.

Resultado obtenido:

- Correcto.

### 3. Login valido de huesped

Pasos:

1. Abrir `login.html`.
2. Ingresar `juan.perez@example.com`.
3. Ingresar `password123`.
4. Seleccionar rol huesped.
5. Enviar formulario.

Resultado esperado:

- Se guarda la sesion en `localStorage`.
- Redirige a `tenant-dashboard.html`.

Resultado obtenido:

- Correcto.

### 4. Registro

Pasos:

1. Abrir `register.html`.
2. Intentar enviar con campos vacios.
3. Completar datos validos con email unico.
4. Aceptar terminos.
5. Enviar formulario.

Resultado esperado:

- El navegador bloquea campos requeridos vacios.
- Con datos validos redirige a `tenant-dashboard.html`.

Resultado obtenido:

- Correcto.

### 5. Flujo de reserva y dashboards

Pasos:

1. Login como tenant.
2. Abrir `search.html`.
3. Abrir la primera propiedad.
4. Ir a `booking.html`.
5. Confirmar reserva.
6. Ver `booking-success.html`.
7. Ver reserva pendiente en `tenant-dashboard.html`.
8. Login como owner.
9. Abrir `owner-dashboard.html`.
10. Confirmar la reserva.
11. Login nuevamente como tenant.
12. Ver estado `Confirmada` en `tenant-dashboard.html`.

Resultado esperado:

- La reserva se crea como `Pendiente`.
- El owner puede confirmar.
- El tenant ve el estado actualizado.

Resultado obtenido:

- Correcto.

### 6. Dashboard con localStorage

Pasos:

1. Precargar sesion de tenant en `localStorage`.
2. Abrir `tenant-dashboard.html`.

Resultado esperado:

- El route guard permite el acceso.
- Se renderiza el listado de reservas.

Resultado obtenido:

- Correcto.

## Como ejecutar las pruebas

Instalar dependencias:

```bash
npm install
npx playwright install chromium
```

Ejecutar pruebas en modo headless:

```bash
npm test
```

Ejecutar con navegador visible:

```bash
npm run test:headed
```

Ejecutar contra Netlify:

```bash
npm run test:netlify
```

Ejecutar contra Netlify con navegador visible:

```bash
npm run test:netlify:headed
```

Abrir reporte HTML:

```bash
npm run test:report
```

## Resultado de la ultima ejecucion

Comando ejecutado:

```bash
npm test
```

Resultado:

```text
6 passed
```

Tambien se ejecuto contra Netlify:

```bash
npm run test:netlify
```

Resultado:

```text
6 passed
```

## Notas

- Las pruebas hacen snapshot de `backend/data/users.json` y `backend/data/bookings.json`.
- Al finalizar, restauran esos archivos para no dejar usuarios o reservas de prueba.
- Se ignoran mensajes de consola del navegador del tipo `Failed to load resource` cuando corresponden a respuestas HTTP esperadas, por ejemplo login invalido `401`.
- Para Netlify, la URL publica se configura con la variable `E2E_BASE_URL`. El script `test:netlify` ya la define en Windows.
