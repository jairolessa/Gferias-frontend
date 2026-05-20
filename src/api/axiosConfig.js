import axios from 'axios';

const usersBaseURL = import.meta.env.VITE_API_USERS_URL || 'http://localhost:8080';
const vacationBaseURL = import.meta.env.VITE_API_VACATION_URL || 'http://localhost:8081';

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

export const getApiErrorMessage = (error) => {
  if (typeof error?.response?.data === 'string') {
    return error.response.data;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'Nao foi possivel concluir a operacao.';
};
