import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './axiosConfig';

const createAxiosError = (status, data, message) => ({
  response: status ? { status, data } : undefined,
  message: message ?? (status ? `Request failed with status code ${status}` : 'Network Error'),
});

describe('getApiErrorMessage', () => {
  it('extrai message do StandardError (ResourceNotFoundException)', () => {
    const error = createAxiosError(404, {
      timestamp: '2026-05-20T12:00:00Z',
      status: 404,
      error: 'Recurso não encontrado',
      message: 'Usuário não encontrado!',
      path: '/users/99',
    });

    expect(getApiErrorMessage(error)).toBe('Usuário não encontrado!');
  });

  it('extrai message do StandardError (ResourceAlreadyExistsException)', () => {
    const error = createAxiosError(409, {
      status: 409,
      error: 'Recurso já cadastrado',
      message: 'Usuário já existe!',
      path: '/api/auth/register',
    });

    expect(getApiErrorMessage(error)).toBe('Usuário já existe!');
  });

  it('extrai message do StandardError (InvalidUserStatusException)', () => {
    const error = createAxiosError(400, {
      status: 400,
      error: 'Operação não permitida',
      message: 'Usuário inativo não pode ser associado.',
      path: '/user-department',
    });

    expect(getApiErrorMessage(error)).toBe('Usuário inativo não pode ser associado.');
  });

  it('extrai detail do ProblemDetail (ResponseStatusException)', () => {
    const error = createAxiosError(400, {
      type: 'about:blank',
      title: 'Bad Request',
      status: 400,
      detail: 'A senha atual está incorreta!',
      instance: '/users/1',
    });

    expect(getApiErrorMessage(error)).toBe('A senha atual está incorreta!');
  });

  it('extrai defaultMessage do array errors (validacao Bean Validation)', () => {
    const error = createAxiosError(400, {
      status: 400,
      error: 'Bad Request',
      message: 'Validation failed for argument [0] in public endpoint',
      errors: [
        {
          field: 'cpf',
          defaultMessage: 'O CPF não pode ser vazio!',
        },
        {
          field: 'password',
          defaultMessage: 'A senha não pode ser vazia!',
        },
      ],
    });

    expect(getApiErrorMessage(error)).toBe('O CPF não pode ser vazio!\nA senha não pode ser vazia!');
  });

  it('extrai mensagem quando o corpo da resposta e string (rate limit)', () => {
    const error = createAxiosError(429, 'Rate limit exceeded. Try again later.');

    expect(getApiErrorMessage(error)).toBe('Rate limit exceeded. Try again later.');
  });

  it('usa fallback em portugues para 401 com corpo generico do Spring Security', () => {
    const error = createAxiosError(
      401,
      {
        status: 401,
        error: 'Unauthorized',
        message: 'Unauthorized',
        path: '/api/auth/login',
      },
      'Request failed with status code 401',
    );
    error.config = { url: 'http://localhost:8080/api/auth/login' };

    expect(getApiErrorMessage(error)).toBe('Credenciais invalidas ou sessao expirada.');
  });

  it('trata 403 no login como credenciais invalidas', () => {
    const error = createAxiosError(403, null);
    error.config = { url: 'http://localhost:8080/api/auth/login' };

    expect(getApiErrorMessage(error)).toBe('Credenciais invalidas ou sessao expirada.');
  });

  it('usa fallback em portugues para 403 sem mensagem especifica', () => {
    const error = createAxiosError(403, {
      status: 403,
      error: 'Forbidden',
      message: 'Forbidden',
      path: '/users',
    });

    expect(getApiErrorMessage(error)).toBe('Voce nao tem permissao para realizar esta operacao.');
  });

  it('usa fallback 404 quando o corpo nao traz mensagem util', () => {
    const error = createAxiosError(404, null);

    expect(getApiErrorMessage(error)).toBe('Recurso nao encontrado.');
  });

  it('usa fallback 409 quando o corpo nao traz mensagem util', () => {
    const error = createAxiosError(409, {});

    expect(getApiErrorMessage(error)).toBe('Recurso ja cadastrado.');
  });

  it('trata erro de rede sem resposta HTTP', () => {
    const error = { message: 'Network Error' };

    expect(getApiErrorMessage(error)).toBe(
      'Nao foi possivel conectar ao servidor. Verifique se as APIs estao em execucao.',
    );
  });

  it('ignora mensagem generica do axios e usa fallback por status', () => {
    const error = createAxiosError(400, {});

    expect(getApiErrorMessage(error)).toBe('Requisicao invalida. Verifique os dados informados.');
  });

  it('retorna mensagem padrao quando nao ha resposta nem status', () => {
    const error = { message: 'Something unexpected' };

    expect(getApiErrorMessage(error)).toBe('Something unexpected');
  });

  it('retorna mensagem padrao final para erro desconhecido', () => {
    expect(getApiErrorMessage({})).toBe('Nao foi possivel concluir a operacao.');
  });
});
