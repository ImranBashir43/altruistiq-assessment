import axios from 'axios';
import { defineStore } from 'pinia';

import type { Emissions } from '@/typings/general';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

export const useDataStore = defineStore('data', {
  state: () => ({
    
    emissionData: JSON.parse(localStorage.getItem('emissionData') || '{}'), // Load from localStorage
    isDataLoaded: false, // Track loading state
  }),
  actions: {
    setEmissionData(data: Record<number, any>) {

      this.emissionData = data;
      localStorage.setItem('emissionData', JSON.stringify(data)); // Persist to localStorage
    },
    async getAllEmissionData() {
      

      if (Object.keys(this.emissionData).length) {
        return this.emissionData; // Use cached data
      }

      this.isDataLoaded = true; // Start loading
      try {

        const { data } = await axiosInstance.get<Emissions>(`countries/emissions-per-country`);
        this.setEmissionData(data.data);
        return data.data;
        

      } catch (error) {
        console.error('Error fetching emissions data:', error);
        

        throw error;
      } finally {
        setTimeout(() => { // Delay state reset to prevent reactivity triggers
          this.isDataLoaded = false;
        }, 200);
      }
    },
  },
});
