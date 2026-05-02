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
});
