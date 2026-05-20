import { usersApi } from './axiosConfig';
import { register } from './authApi';

export const getUsers = async () => {
  const response = await usersApi.get('/users');
  return response.data;
};

export const getUser = async (id) => {
  const response = await usersApi.get(`/users/${id}`);
  return response.data;
};

export const createUser = register;

export const updateUser = async (id, data) => {
  const response = await usersApi.put(`/users/${id}`, data);
  return response.data;
};

export const updatePassword = async (id, data) => {
  const response = await usersApi.patch(`/users/${id}`, data);
  return response.data;
};
