import footprintApi from './../helpers/footprint.helper';
import { transformData, processBatch, sortByHighestTotal } from './../helpers/seeds.helper';
import { SKIPPED_COUNTRIES, REDIS_COUNTRIES_EXPIRY } from './../configs/vars';
import redisClient from './../cache/countries.cache'; // Import Redis client


const BATCH_SIZE = 10; // Adjust based on API rate limits
const BATCH_DELAY = 1000; // Delay between batches

/**
 * Prepare emissions data by country.
 * 
 * Fetches data for all countries in parallel batches, processes it, and returns the results.
 * 
 * @returns {Promise<Object>} The emissions data organized by year.
 */
export const prepareEmissionsByCountry = async () => {
  const dataByCountry = {};

  try {
     // Generate a cache key based on skipped countries
    const skippedKey = `emissions:skipped:${SKIPPED_COUNTRIES.sort().join(',')}`;

    // Check Redis cache before processing
    const cachedData = await redisClient.get(skippedKey);

    if (cachedData) {
      console.log(`Cache hit for skipped countries: ${skippedKey}`);
      return JSON.parse(cachedData);
    }

    // Fetch all countries data from the footprint API
    const countries = await footprintApi.getCountries();
    const validCountries = countries.filter(country =>
      !SKIPPED_COUNTRIES.includes(country.countryName.toLowerCase().trim())
    );

    console.log(`Starting to process ${validCountries.length} countries...`);

    // Process countries in batches
    for (let i = 0; i < validCountries.length; i += BATCH_SIZE) {
      const batch = validCountries.slice(i, i + BATCH_SIZE);
      const batchResults = await processBatch(batch);

      // Process batch results
      batchResults.forEach(countryData => {
        if (countryData && countryData.length > 0) {
          const countryName = countryData[0].countryName.toLowerCase().trim();
          dataByCountry[countryName] = countryData;
        }
      });

      console.log(`Processed ${Math.min(i + BATCH_SIZE, validCountries.length)}/${validCountries.length} countries`);

      // Delay between batches to respect rate limits
      if (i + BATCH_SIZE < validCountries.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    console.log('Completed processing all countries');

    // Transform and sort the data
    let emissionsPerCountry = transformData(dataByCountry);
    emissionsPerCountry = await sortByHighestTotal(emissionsPerCountry);
     // Store the final data in Redis cache
    await redisClient.set(skippedKey, JSON.stringify(emissionsPerCountry), {
      EX: REDIS_COUNTRIES_EXPIRY
    });

    console.log(`Data cached with key: ${skippedKey}`);

    return emissionsPerCountry;
  } catch (error) {
    console.error('Error preparing emissions data:', error);
    throw error;
  }
};



