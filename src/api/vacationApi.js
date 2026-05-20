import { vacationApi } from './axiosConfig';

export const createVacationBalance = async (data) => {
  const response = await vacationApi.post('/vacation-balance', data);
  return response.data;
};

export const createVacation = async (data) => {
  const response = await vacationApi.post('/vacation', data);
  return response.data;
};
