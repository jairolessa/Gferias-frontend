import axios from 'axios';

const usersBaseURL = import.meta.env.VITE_API_USERS_URL || 'https://api-rest-users-gferias.onrender.com';
const vacationBaseURL = import.meta.env.VITE_API_VACATION_URL || 'https://gferias.onrender.com';

export const usersApi = axios.create({
  baseURL: usersBaseURL,
});

export const vacationApi = axios.create({
  baseURL: vacationBaseURL,
});

const addAuthToken = (config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

usersApi.interceptors.request.use(addAuthToken);
vacationApi.interceptors.request.use(addAuthToken);

const GENERIC_VALIDATION_MESSAGE = /validation failed/i;
const GENERIC_HTTP_LABEL = /^(unauthorized|forbidden|bad request|not found|conflict|internal server error|error)$/i;

const extractValidationMessages = (errors) => {
  if (!errors) return [];

  if (Array.isArray(errors)) {
    return errors
      .map((item) => item?.defaultMessage || item?.message)
      .filter(Boolean);
  }

  if (typeof errors === 'object') {
    return Object.values(errors)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter((value) => typeof value === 'string' && value.trim());
  }

  return [];
};

const extractMessageFromPayload = (data) => {
  if (!data) return null;

  if (typeof data === 'string') {
    const trimmed = data.trim();
    return trimmed || null;
  }

  if (typeof data !== 'object') return null;

  const validationMessages = extractValidationMessages(data.errors);
  if (validationMessages.length > 0) {
    return validationMessages.join('\n');
  }

  const detail = typeof data.detail === 'string' ? data.detail.trim() : '';
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  const errorLabel = typeof data.error === 'string' ? data.error.trim() : '';
  const title = typeof data.title === 'string' ? data.title.trim() : '';

  if (detail) return detail;

  if (message && !GENERIC_VALIDATION_MESSAGE.test(message) && !GENERIC_HTTP_LABEL.test(message)) {
    return message;
  }

  if (errorLabel && !GENERIC_HTTP_LABEL.test(errorLabel)) return errorLabel;

  if (title && title !== 'Unauthorized' && title !== 'Forbidden') {
    return title;
  }

  return null;
};

const getStatusFallbackMessage = (status) => {
  switch (status) {
    case 400:
      return 'Requisicao invalida. Verifique os dados informados.';
    case 401:
      return 'Credenciais invalidas ou sessao expirada.';
    case 403:
      return 'Voce nao tem permissao para realizar esta operacao.';
    case 404:
      return 'Recurso nao encontrado.';
    case 409:
      return 'Recurso ja cadastrado.';
    case 429:
      return 'Limite de requisicoes excedido. Tente novamente em alguns instantes.';
    default:
      return null;
  }
};

const isLoginRequest = (error) => {
  const requestUrl = error?.config?.url || error?.response?.config?.url || '';
  return requestUrl.includes('/api/auth/login');
};

export const getApiErrorMessage = (error) => {
  const status = error?.response?.status;
  const payloadMessage = extractMessageFromPayload(error?.response?.data);

  if (payloadMessage) {
    return payloadMessage;
  }

  if ((status === 401 || status === 403) && isLoginRequest(error)) {
    return 'Credenciais invalidas ou sessao expirada.';
  }

  const statusMessage = getStatusFallbackMessage(status);
  if (statusMessage) {
    return statusMessage;
  }

  if (error?.message === 'Network Error') {
    return 'Nao foi possivel conectar ao servidor. Verifique se as APIs estao em execucao.';
  }

  if (error?.message && !/^Request failed with status code \d+$/i.test(error.message)) {
    return error.message;
  }

  return 'Nao foi possivel concluir a operacao.';
};
