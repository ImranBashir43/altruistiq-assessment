import footprintApi from './../helpers/footprint.helper';

/**
 * Transform input data by organizing it by year.
 * 
 * @param {Object} inputData - The raw input data organized by country.
 * @returns {Object} The transformed data organized by year.
 */
export const transformData = (inputData) => {
  const dataByYear = {};

  // Iterate through each country in the input data
  for (const country in inputData) {
    inputData[country].forEach(record => {
      const year = record.year;
      const total = parseFloat(record.carbon.toFixed(4));

      // Initialize the year if it doesn't exist in dataByYear
      if (!dataByYear[year]) {
        dataByYear[year] = [];
      }

      // Add the country and total to the corresponding year
      if (total) {
        dataByYear[year].push({ country, total });
      }
    });
  }

  return dataByYear;
};

/**
 * Fetch data for a country with retries and exponential backoff.
 * 
 * @param {string} countryCode - The country code to fetch data for.
 * @returns {Promise<Object>} The data for the specified country.
 */
export const fetchData = async (countryCode) => {
  try {
    return await footprintApi.getDataForCountry(countryCode);
  } catch (error) {
    console.error(`Failed to fetch data for country ${countryCode}:`, error.message);
    return null;
  }
};

/**
 * Process a batch of countries in parallel.
 * 
 * @param {Array} countries - Array of countries to process.
 * @returns {Promise<Array>} Array of results from the API.
 */
export const processBatch = async (countries) => {
  const promises = countries.map(country => fetchData(country.countryCode));
  const results = await Promise.allSettled(promises);

  return results
    .filter(result => result.status === 'fulfilled' && result.value)
    .map(result => result.value);
};

/**
 * Sort data by highest total emissions.
 * 
 * @param {Object} data - The data organized by year.
 * @returns {Object} The data sorted by highest total emissions per year.
 */
export const sortByHighestTotal = async (data) => {
  for (let year in data) {
    data[year].sort((a, b) => b.total - a.total);
  }
  return data;
};