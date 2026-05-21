import { expect, test } from '@playwright/test';

const ADMIN_CPF = '11066394482';
const ADMIN_PASSWORD = '123456';

const apiError = (page) => page.locator('.alert.alert-error');

async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.getByLabel('CPF').fill(ADMIN_CPF);
  await page.getByLabel('Senha').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/users$/);
}

test.describe('Mensagens de erro nas paginas', () => {
  test('Login exibe credenciais invalidas para senha incorreta', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('CPF').fill(ADMIN_CPF);
    await page.getByLabel('Senha').fill('senha-incorreta');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(apiError(page)).toBeVisible();
    await expect(apiError(page)).toHaveText('Credenciais invalidas ou sessao expirada.');
  });

  test('Novo usuario duplicado exibe mensagem da API', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/users/new');
    await page.getByLabel('Nome completo').fill('Usuario Teste E2E');
    await page.getByLabel('CPF').fill(ADMIN_CPF);
    await page.getByLabel('Senha').fill('12345678');
    await page.getByLabel('Cargo').fill('Analista');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page).toHaveURL(/\/users\/new$/);
    await expect(apiError(page)).toBeVisible();
    await expect(apiError(page)).toHaveText('Usuário já existe!');
  });

  test('Validacao da API aparece ao cadastrar nome incompleto', async ({ page }) => {
    await loginAsAdmin(page);

    await page.route('http://localhost:8080/users', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 400,
            error: 'Bad Request',
            message: 'Validation failed for argument',
            errors: [{ field: 'fullName', defaultMessage: 'O nome deve ser completo!' }],
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto('/users/new');
    await page.getByLabel('Nome completo').fill('Ana');
    await page.getByLabel('CPF').fill('52998224725');
    await page.getByLabel('Senha').fill('123456');
    await page.getByLabel('Cargo').fill('Analista');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page).toHaveURL(/\/users\/new$/);
    await expect(apiError(page)).toBeVisible();
    await expect(apiError(page)).toHaveText('O nome deve ser completo!');
  });

  test('Edicao de usuario inexistente exibe recurso nao encontrado', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/users/999999/edit');
    await expect(apiError(page)).toBeVisible();
    await expect(apiError(page)).toHaveText('Usuário não encontrado!');
  });

  test('Pagina de usuarios exibe erro quando a API falha ao carregar', async ({ page }) => {
    await loginAsAdmin(page);

    await page.route('http://localhost:8080/users', async (route) => {
      if (route.request().method() === 'GET' && !route.request().url().includes('/users/')) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 404,
            error: 'Recurso não encontrado',
            message: 'Usuário não encontrado!',
            path: '/users',
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto('/users');
    await expect(apiError(page)).toBeVisible();
    await expect(apiError(page)).toHaveText('Usuário não encontrado!');
  });

  test('Formulario de departamento exibe mensagem de validacao da API', async ({ page }) => {
    await loginAsAdmin(page);

    await page.route('http://localhost:8080/departments', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 400,
            error: 'Bad Request',
            message: 'Validation failed for argument',
            errors: [
              {
                field: 'departmentName',
                defaultMessage: 'O nome do departamento não pode ser vazio!',
              },
            ],
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto('/departments/new');
    await page.getByLabel('Nome do departamento').fill('Financeiro');
    await page.getByRole('button', { name: 'Criar Departamento' }).click();

    await expect(apiError(page)).toBeVisible();
    await expect(apiError(page)).toHaveText('O nome do departamento não pode ser vazio!');
  });
});
