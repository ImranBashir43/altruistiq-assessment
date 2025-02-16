import footprintApi from './../helpers/footprint.helper';
import { transformData, fetchData, sortByHighestTotal } from './../helpers/seeds.helper';
import { SKIPPED_COUNTRIES } from './../configs/vars';

/**
 * Prepare emissions data by country.
 * 
 * Fetches data for all countries from the footprint API, processes it, and returns the results
 * 
 * @returns {Promise<Object>} The emissions data organized by country.
 */
export const prepareEmissionsByCountry = async () => {
  const dataByCountry = {};

  // Fetch all countries data from the footprint API
  const countries = await footprintApi.getCountries();

  const promises = []

  // Create a request for each country
  for (const country of countries) {
    const countryName = country.countryName.toLowerCase().trim();
    
    if (!SKIPPED_COUNTRIES.includes(countryName) && !dataByCountry[countryName]) {
      promises.push(fetchData(country.countryCode));
    }
  }

  let results = await Promise.allSettled(promises);

  results = results
    .filter(result => result.status === 'fulfilled' && result.value.length)
    .map(result => result.value);

  // Key by country name, transform and sort the data
  results.forEach(r => {
    const countryName = r[0].countryName.toLowerCase().trim()
    dataByCountry[countryName] = r;
  })

  let emissionsPerCountry = transformData(dataByCountry);
  emissionsPerCountry = await sortByHighestTotal(emissionsPerCountry);

  return emissionsPerCountry;
};