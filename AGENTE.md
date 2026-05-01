# AGENTE.md

## Proyecto: Alquileres  
Contexto persistente para GitHub Copilot / Copilot Chat / Copilot Workspace.

---

## 1. Visión general

**Alquileres** es una plataforma web de alquileres temporales inspirada en Airbnb / Booking.

Objetivos del MVP:

- Buscar propiedades
- Ver detalle de propiedad
- Reservar estadías
- Confirmar reservas
- Panel de huésped
- Panel de anfitrión
- Panel administrador
- Mensajería interna
- Asistente IA (mock inicial)

Estado actual:

- Frontend multipágina funcional
- Backend Node + Express corriendo
- Navegabilidad implementada
- API inicial funcionando
- Integración parcial frontend/backend

---

## 2. Stack tecnológico

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript

### Backend

- Node.js
- Express.js

### Persistencia actual

- JSON files

### Futuro opcional

- SQLite / PostgreSQL
- JWT
- Stripe / MercadoPago
- IA real

---

## 3. Estructura general

```text
Proyecto/
│── index.html
│── search.html
│── property-detail.html
│── booking.html
│── booking-success.html
│── tenant-dashboard.html
│── owner-dashboard.html
│── admin-dashboard.html
│── messages.html
│── assistant.html
│── login.html
│── register.html
│── styles.css
│── script.js
│
└── backend/
    │── server.js
    │── routes/
    │── controllers/
    │── data/
    │── utils/
```

---

## 4. API backend

Base URL: http://localhost:3000/api

### Auth
- POST /auth/login
- POST /auth/register

### Properties
- GET /properties
- GET /properties/:id
- POST /properties

### Bookings
- GET /bookings
- GET /bookings/user/:userId
- POST /bookings
- PATCH /bookings/:id/status

### Messages
- GET /messages/conversations/:userId
- GET /messages/:conversationId
- POST /messages/:conversationId

---

## 5. Reglas de trabajo

- Mantener diseño actual
- No rediseñar sin pedido explícito
- Usar HTML/CSS/JS vanilla en frontend
- Usar Node/Express en backend
- Código limpio y modular
- No romper navegación existente
- No romper query params existentes

---

## 6. Estilo visual

- Inspiración Airbnb / Booking
- Limpio, moderno, premium
- Sin botones gigantes
- Sin íconos gigantes
- Sin overflow de textos
- Sin scroll horizontal
- Cards consistentes
- Imágenes proporcionadas

---

## 7. Prioridades actuales

1. property-detail conectado
2. booking POST real
3. login backend
4. messages backend
5. refinamiento UX

---

## 8. Prompt base rápido

Analyze current files first.
Keep current design system.
Do not redesign.
Use HTML/CSS/vanilla JS on frontend.
Use Node/Express on backend.
Keep code clean and modular.
Preserve navigation and existing flows.
Only make necessary improvements.
