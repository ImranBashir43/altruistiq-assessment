import { prepareEmissionsByCountry } from "./seeds.controller";

/**
 * Controller to get emissions data by country.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} currentTimeProvider - Function to provide the current time (used for testing)
 */
export const getEmissionsByCountry = async (req, res, currentTimeProvider = () => Date.now()) => {
  try {    
    const emissionsPerCountry = await prepareEmissionsByCountry();
    
    return res.json({ data: emissionsPerCountry, message: "Emissions per country retrieved successfully!" });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error fetching emissions data:', error);
    res.status(500).send('Internal Server Error');
  }
};
