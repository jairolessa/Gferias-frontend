import { usersApi } from './axiosConfig';

export const getDepartments = async () => {
  const response = await usersApi.get('/departments');
  return response.data;
};

export const getDepartment = async (id) => {
  const response = await usersApi.get(`/departments/${id}`);
  return response.data;
};

export const createDepartment = async (data) => {
  const response = await usersApi.post('/departments', data);
  return response.data;
};

export const associateUserDepartment = async (userId, departmentsIds) => {
  const response = await usersApi.post('/user-department', {
    userId,
    departmentsIds,
  });
  return response.data;
};
