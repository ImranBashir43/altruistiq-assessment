import axios from 'axios'
import { FOOT_PRINT_API_KEY, FOOT_PRINT_BASE_URL } from '../configs/vars'

export const api = axios.create({
  baseURL: FOOT_PRINT_BASE_URL,
  auth: {
    username: 'any-user-name',
    password: FOOT_PRINT_API_KEY
  },
  timeout: 30000 // 30 second timeout
});
export const getBackoffDelay = (retryCount) => {
  return Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 second delay
};

api.interceptors.response.use(null, async error => {
  const { config, response } = error;

  // Don't retry if we haven't set retry options or max retries reached
  if (!config || !config.retry) {
    return Promise.reject(error);
  }

  // handling for rate limit
  if (response && response.status === 429) {
    const delay = getBackoffDelay(config.retryCount || 0);
    config.retryCount = (config.retryCount || 0) + 1;
    config.retry -= 1;

    console.log(`Rate limited, waiting ${delay}ms before retry ${config.retryCount}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return api(config);
  }

  return Promise.reject(error);
});

export default {
  async get(endpoint) {
    try {
      const response = await api.get(endpoint, {
        retry: 3, // Allow 3 retries
        retryCount: 0
      });
      return response.data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error.message);
      throw error;
    }
  },

  async getCountries() {
    return this.get('countries');
  },

  async getDataForCountry(countryCode) {
    return this.get(`data/${countryCode}/all/EFCpc`);
  }
};

