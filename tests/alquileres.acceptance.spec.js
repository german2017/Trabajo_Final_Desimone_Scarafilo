const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '..', 'backend', 'data');
const usersFile = path.join(dataDir, 'users.json');
const bookingsFile = path.join(dataDir, 'bookings.json');

let usersSnapshot;
let bookingsSnapshot;

test.beforeAll(() => {
  usersSnapshot = fs.readFileSync(usersFile, 'utf8');
  bookingsSnapshot = fs.readFileSync(bookingsFile, 'utf8');
});

test.afterAll(() => {
  fs.writeFileSync(usersFile, usersSnapshot);
  fs.writeFileSync(bookingsFile, bookingsSnapshot);
});

test.beforeEach(async ({ page, request }, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL || '');
  const isPublicNetlify = baseURL.includes('rentia-booking.netlify.app');

  if (isPublicNetlify) {
    await page.route('http://localhost:4000/api/**', async (route) => {
      const response = await request.fetch(route.request());
      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          'access-control-allow-origin': '*',
          'access-control-allow-private-network': 'true'
        }
      });
    });
  }

  page.on('console', (message) => {
    if (message.type() === 'error') {
      if (message.text().includes('Failed to load resource')) return;
      if (isPublicNetlify && message.text().includes('http://localhost:4000/api')) return;
      if (isPublicNetlify && message.text().includes('Error cargando reservaciones')) return;
      throw new Error(`Browser console error: ${message.text()}`);
    }
  });

  page.on('pageerror', (error) => {
    throw error;
  });

  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
});

async function login(page, { email, password, role }) {
  await page.goto('/login.html');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#role').selectOption(role);
  await page.locator('#loginForm button[type="submit"]').click();
}

async function seedSession(page, user) {
  await page.addInitScript((sessionUser) => {
    localStorage.setItem('alquileres_user', JSON.stringify(sessionUser));
  }, user);
}

test.describe('Navegacion principal', () => {
  test('carga index.html y navega a paginas principales', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page).toHaveTitle(/Alquileres/);
    await expect(page.locator('.hero-title')).toContainText('Encuentra tu hogar temporal ideal');

    await page.getByRole('link', { name: 'Anfitriones' }).first().click();
    await expect(page).toHaveURL(/\/search(?:\.html)?/);
    await expect(page.locator('#results-heading')).toBeVisible();

    await page.getByRole('link', { name: 'Alquileres' }).first().click();
    await expect(page).toHaveURL(/\/(?:index(?:\.html)?)?$/);

    await page.getByRole('link', { name: 'Asistente IA' }).first().click();
    await expect(page).toHaveURL(/\/assistant(?:\.html)?/);
    await expect(page.locator('body')).toContainText('Asistente');
  });

  test('muestra recomendaciones IA ordenadas y guarda la ultima busqueda', async ({ page }) => {
    let apiCalls = 0;
    await page.route('http://localhost:4000/api/**', async (route) => {
      apiCalls += 1;
      await route.abort();
    });

    await page.goto('/assistant.html');
    await expect(page.locator('#recommendationForm')).toBeVisible();
    await expect(page.locator('#recommendationForm')).toHaveAttribute('data-loaded', 'true');

    await page.locator('#recommendationBudget').fill('3000');
    await page.locator('#recommendationGuests').fill('2');
    await page.locator('#recommendationZone').fill('Polanco');
    await page.locator('#recommendationType').selectOption('apartamento');
    await page.locator('#recommendationReason').selectOption('trabajo');
    await page.locator('input[name="recommendationServices"][value="wifi"]').check();
    await page.locator('input[name="recommendationServices"][value="cocina"]').check();
    await page.locator('input[name="recommendationServices"][value="aire-acondicionado"]').check();
    await page.locator('#recommendationForm button[type="submit"]').click();

    const cards = page.locator('.recommendation-result-card');
    await expect(cards).toHaveCount(3);
    await expect(cards.first()).toContainText('Puntaje');
    await expect(cards.first()).toContainText('Recomendada porque');
    await expect(cards.first()).toContainText('Ver detalle');
    await expect(cards.first()).toContainText('Reservar');

    const scores = await cards.evaluateAll((items) => items.map((item) => Number(item.dataset.recommendationScore)));
    expect(scores).toEqual([...scores].sort((a, b) => b - a));

    const savedRecommendation = await page.evaluate(() => JSON.parse(localStorage.getItem('rentia_last_recommendation')));
    expect(savedRecommendation.preferences.zone).toBe('Polanco');
    expect(savedRecommendation.recommendations).toHaveLength(3);
    expect(apiCalls).toBe(0);

    await cards.first().getByRole('link', { name: 'Ver detalle' }).click();
    await expect(page).toHaveURL(/property-detail\.html\?id=/);
    await expect(page.locator('#property-title')).toBeVisible();
    await expect(page.locator('#reserve-btn')).toHaveAttribute('href', /booking\.html\?/);
    expect(apiCalls).toBe(0);
  });
});

test.describe('Autenticacion', () => {
  test('muestra error con login invalido', async ({ page }) => {
    await login(page, {
      email: 'no-existe@example.com',
      password: 'incorrecta',
      role: 'huesped'
    });

    await expect(page.locator('#loginForm')).toContainText('No pudimos iniciar sesión. Verifica tus datos.');
    await expect(page).toHaveURL(/login\.html/);
  });

  test('permite login de tenant valido', async ({ page }) => {
    await login(page, {
      email: 'juan.perez@example.com',
      password: 'password123',
      role: 'huesped'
    });

    await expect(page).toHaveURL(/tenant-dashboard\.html/);
    await expect(page.locator('.dashboard-main.tenant-dashboard')).toBeVisible();
  });

  test('valida registro con campos vacios y permite registro valido', async ({ page }) => {
    await page.goto('/register.html');
    await page.locator('#registerForm button[type="submit"]').click();
    await expect(page.locator('#nombre')).toHaveJSProperty('validity.valueMissing', true);

    const email = `playwright-${Date.now()}@example.com`;
    await page.locator('#nombre').fill('Test');
    await page.locator('#apellido').fill('Aceptacion');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('password123');
    await page.locator('#role').selectOption('huesped');
    await page.locator('#terms').check();
    await page.locator('#registerForm button[type="submit"]').click();

    await expect(page).toHaveURL(/tenant-dashboard\.html/);
    await expect(page.locator('.dashboard-main.tenant-dashboard')).toBeVisible();
  });
});

test.describe('Flujo de reserva y dashboards', () => {
  test('crea una reserva, aparece al tenant, el owner la confirma y el tenant ve el estado actualizado', async ({ page }) => {
    await login(page, {
      email: 'juan.perez@example.com',
      password: 'password123',
      role: 'huesped'
    });
    await expect(page).toHaveURL(/tenant-dashboard\.html/);

    await page.goto('/search.html');
    await expect(page.locator('.results-grid .property-card').first()).toBeVisible();
    await page.locator('.results-grid .property-card .property-link').first().click();

    await expect(page).toHaveURL(/property-detail\.html/);
    await expect(page.locator('#property-title')).toContainText('Apartamento moderno en Polanco');
    await page.locator('#reserve-btn').click();

    await expect(page).toHaveURL(/booking\.html/);
    await page.locator('#confirm-pay-btn').click();
    await expect(page).toHaveURL(/booking-success\.html/);
    await expect(page.locator('.success-title')).toContainText('Reserva confirmada');

    const bookingId = new URL(page.url()).searchParams.get('bookingId');
    expect(bookingId).toBeTruthy();

    await page.goto('/tenant-dashboard.html');
    const tenantBooking = page.locator(`.reservation-card:has-text("Apartamento moderno en Polanco"):has-text("Pendiente")`).first();
    await expect(tenantBooking).toBeVisible();
    await expect(tenantBooking).toContainText('Esperando confirmación del anfitrión.');

    await page.evaluate(() => localStorage.removeItem('alquileres_user'));
    await login(page, {
      email: 'maria.gonzalez@example.com',
      password: 'password123',
      role: 'anfitrion'
    });
    await expect(page).toHaveURL(/owner-dashboard\.html/);

    const ownerBooking = page.locator(`.received-item[data-booking-id="${bookingId}"]`);
    await expect(ownerBooking).toBeVisible();
    await ownerBooking.locator('[data-owner-action="confirm"]').click();
    await expect(ownerBooking.locator('.received-status')).toContainText('Confirmada');
    await expect(ownerBooking.locator('[data-owner-action="confirm"]')).toHaveCount(0);

    await page.evaluate(() => localStorage.removeItem('alquileres_user'));
    await login(page, {
      email: 'juan.perez@example.com',
      password: 'password123',
      role: 'huesped'
    });
    await expect(page).toHaveURL(/tenant-dashboard\.html/);

    const updatedTenantBooking = page.locator(`.reservation-card:has-text("Apartamento moderno en Polanco"):has-text("Confirmada")`).first();
    await expect(updatedTenantBooking).toBeVisible();
  });

  test('permite abrir dashboard tenant con sesion pre-cargada en localStorage', async ({ page }) => {
    await seedSession(page, {
      id: 'tenant-1',
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      role: 'tenant'
    });

    await page.goto('/tenant-dashboard.html');
    await expect(page).toHaveURL(/tenant-dashboard\.html/);
    await expect(page.locator('.reservations-list')).toBeVisible();
    await expect(page.locator('#tenant-bookings-count')).toContainText(/\(\d+\)/);
  });

  test('gestiona estados de reserva con localStorage sin base de datos', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('alquileres_user', JSON.stringify({
        id: 'tenant-1',
        name: 'Juan Perez',
        email: 'juan.perez@example.com',
        role: 'tenant'
      }));
      localStorage.setItem('rentia_bookings', JSON.stringify([
        {
          id: 'local-cancel',
          propertyId: '1',
          tenantId: 'tenant-1',
          ownerId: 'owner-1',
          title: 'Apartamento moderno en Polanco',
          location: 'Polanco, Ciudad de Mexico',
          host: 'Maria Gonzalez',
          checkin: '2026-06-01',
          checkout: '2026-06-05',
          guests: 2,
          nights: 4,
          total: 10000,
          status: 'Pendiente'
        },
        {
          id: 'local-reject',
          propertyId: '1',
          tenantId: 'tenant-1',
          ownerId: 'owner-1',
          title: 'Apartamento moderno en Polanco',
          checkin: '2026-06-10',
          checkout: '2026-06-12',
          status: 'Pendiente'
        },
        {
          id: 'local-finish',
          propertyId: '1',
          tenantId: 'tenant-1',
          ownerId: 'owner-1',
          title: 'Apartamento moderno en Polanco',
          checkin: '2026-06-15',
          checkout: '2026-06-17',
          status: 'Confirmada'
        }
      ]));
    });

    await page.goto('/tenant-dashboard.html');
    const tenantCard = page.locator('.reservation-card[data-booking-id="local-cancel"]');
    await expect(tenantCard).toContainText('Pendiente');
    await tenantCard.getByRole('button', { name: 'Cancelar reserva' }).click();
    await expect(tenantCard).toContainText('Cancelada');
    await expect(tenantCard.getByRole('button', { name: 'Cancelar reserva' })).toHaveCount(0);

    await page.evaluate(() => {
      localStorage.setItem('alquileres_user', JSON.stringify({
        id: 'owner-1',
        name: 'Maria Gonzalez',
        email: 'maria.gonzalez@example.com',
        role: 'owner'
      }));
    });
    await page.goto('/owner-dashboard.html');

    const rejectedCard = page.locator('.received-item[data-booking-id="local-reject"]');
    await rejectedCard.getByRole('button', { name: 'Rechazar' }).click();
    await expect(rejectedCard.locator('.received-status')).toContainText('Rechazada');
    await expect(rejectedCard.getByRole('button', { name: 'Confirmar' })).toHaveCount(0);

    const finishedCard = page.locator('.received-item[data-booking-id="local-finish"]');
    await finishedCard.getByRole('button', { name: 'Finalizar' }).click();
    await expect(finishedCard.locator('.received-status')).toContainText('Finalizada');
    await expect(finishedCard.getByRole('button', { name: 'Finalizar' })).toHaveCount(0);
  });

  test('permite crear, pausar, editar y eliminar propiedades del owner en localStorage', async ({ page }) => {
    const title = `Casa Test Local ${Date.now()}`;
    const editedTitle = `${title} Editada`;

    await page.evaluate(() => {
      localStorage.setItem('alquileres_user', JSON.stringify({
        id: 'owner-1',
        name: 'Maria Gonzalez',
        email: 'maria.gonzalez@example.com',
        role: 'owner'
      }));
      localStorage.removeItem('rentia_properties');
    });

    await page.goto('/create-property.html');
    await page.locator('#propertyTitle').fill(title);
    await page.locator('#propertyLocation').fill('Palermo, Buenos Aires');
    await page.locator('#propertyType').selectOption('casa');
    await page.locator('#propertyCity').fill('Buenos Aires');
    await page.locator('#propertyCountry').fill('Argentina');
    await page.locator('#propertyDescription').fill('Casa amplia para pruebas funcionales del panel anfitrion.');
    await page.locator('#propertyPrice').fill('1800');
    await page.locator('#propertyGuests').fill('5');
    await page.locator('#propertyBedrooms').fill('3');
    await page.locator('#propertyBathrooms').fill('2');
    await page.locator('input[name="amenities"][value="WiFi"]').check();
    await page.locator('input[name="amenities"][value="Cocina equipada"]').check();
    await page.locator('#propertyImage').fill('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop');
    await page.locator('#createPropertySubmit').click();
    await expect(page).toHaveURL(/owner-dashboard\.html/);

    await page.goto(`/search.html?destination=${encodeURIComponent('Palermo')}`);
    await expect(page.locator('.property-card').filter({ hasText: title })).toBeVisible();

    await page.goto('/assistant.html');
    await page.locator('#recommendationBudget').fill('2500');
    await page.locator('#recommendationGuests').fill('4');
    await page.locator('#recommendationZone').fill('Palermo');
    await page.locator('#recommendationType').selectOption('casa');
    await page.locator('#recommendationReason').selectOption('familia');
    await page.locator('input[name="recommendationServices"][value="wifi"]').check();
    await page.locator('#recommendationForm button[type="submit"]').click();
    await expect(page.locator('.recommendation-result-card').filter({ hasText: title })).toBeVisible();

    await page.goto('/owner-dashboard.html');
    const listing = page.locator('.listing-card').filter({ hasText: title });
    await listing.getByRole('button', { name: 'Pausar' }).click();
    await expect(listing).toContainText('Pausada');

    await page.goto(`/search.html?destination=${encodeURIComponent('Palermo')}`);
    await expect(page.locator('.property-card').filter({ hasText: title })).toHaveCount(0);

    await page.goto('/owner-dashboard.html');
    await page.locator('.listing-card').filter({ hasText: title }).getByRole('link', { name: 'Editar' }).click();
    await page.locator('#propertyTitle').fill(editedTitle);
    await page.locator('#propertyPrice').fill('2100');
    await page.locator('#propertyGuests').fill('6');
    await page.locator('#propertyStatus').selectOption('active');
    await page.locator('#createPropertySubmit').click();
    await expect(page).toHaveURL(/owner-dashboard\.html/);

    await page.goto(`/search.html?destination=${encodeURIComponent('Palermo')}`);
    const editedCard = page.locator('.property-card').filter({ hasText: editedTitle });
    await expect(editedCard).toBeVisible();
    await expect(editedCard).toContainText('2100');

    await page.goto('/owner-dashboard.html');
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('eliminar');
      await dialog.accept();
    });
    await page.locator('.listing-card').filter({ hasText: editedTitle }).getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.locator('.listing-card').filter({ hasText: editedTitle })).toHaveCount(0);
  });
});
