import { usersApi } from './axiosConfig';

export const login = async (cpf, password) => {
  const response = await usersApi.post('/api/auth/login', { cpf, password });
  return response.data;
};

export const register = async (data) => {
  const response = await usersApi.post('/api/auth/register', data);
  return response.data;
};
