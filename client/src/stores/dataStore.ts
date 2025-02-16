import axios from 'axios';
import { defineStore } from 'pinia';

import type { Emissions } from '@/typings/general';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

export const useDataStore = defineStore('data', {
  state: () => ({
    emissionData: {},
  }),
  actions: {
    setEmissionData(data: Record<number, any>) {
      this.emissionData = data; // Store the fetched emission data
    },
    async getAllEmissionData() {
      
      const { data } = await axiosInstance.get<Emissions>(`countries/emissions-per-country`);
      this.setEmissionData(data.data);
      return data.data;
    },
  },
});
