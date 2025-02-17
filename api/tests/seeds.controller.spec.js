import assert from "assert";
import sinon from "sinon";
import * as seedsHelper from "../helpers/seeds.helper";
import * as config from "../configs/vars";
import footprintApi from "../helpers/footprint.helper";
import { prepareEmissionsByCountry } from "../controllers/seeds.controller";
import redisClient from "../cache/countries.cache";

// Dummy test data
const mockCountries = [
  { countryName: "USA", countryCode: "US" },
  { countryName: "Canada", countryCode: "CA" },
];

const mockEmissionsData = {
  USA: [{ countryName: "USA", year: 2020, carbon: 1000 }],
  Canada: [{ countryName: "Canada", year: 2020, carbon: 500 }],
};

const transformedData = {
  2020: [
    { country: "USA", total: 1000 },
    { country: "Canada", total: 500 },
  ],
};

describe("prepareEmissionsByCountry", function () {
  this.timeout(30); 

  let redisGetStub,
    redisSetStub,
    skippedStub,
    footprintApiStub,
    processBatchStub,
    transformStub,
    redisConnectStub,
    sortStub;

  beforeEach(() => {
    // Stub methods
    redisGetStub = sinon.stub(redisClient, "get");
    redisSetStub = sinon.stub(redisClient, "set");
    redisConnectStub = sinon.stub(redisClient, "connect").resolves();
    skippedStub = sinon.stub(config, "SKIPPED_COUNTRIES").value(["USA"]);

    // Stub API calls
    footprintApiStub = sinon
      .stub(footprintApi, "getCountries")
      .resolves(mockCountries);

    // Stub batch processing
    processBatchStub = sinon
      .stub(seedsHelper, "processBatch")
      .callsFake(async (batch) => {
        return batch.map(
          (country) => mockEmissionsData[country.countryName] || []
        );
      });

    // Stub transformation and sorting functions
    transformStub = sinon
      .stub(seedsHelper, "transformData")
      .returns(transformedData);
    sortStub = sinon
      .stub(seedsHelper, "sortByHighestTotal")
      .resolves(transformedData);
  });

  afterEach(() => {
    sinon.restore(); // Reset all stubs
  });

  it("should return cached data if available", async () => {
    redisGetStub.resolves(JSON.stringify(transformedData)); // cache hit

    const result = await prepareEmissionsByCountry();

    assert.deepStrictEqual(result, transformedData); // Expect cache data to be returned
    assert(redisGetStub.calledOnce, "redisClient.get should be called once"); 
    assert(
      footprintApiStub.notCalled,
      "footprintApi.getCountries should not be called if cache is hit"
    ); // API should not be called
  });

  it("should fetch and process data when cache is empty", async () => {
    redisGetStub.resolves(null); // cache miss

    const result = await prepareEmissionsByCountry();

    assert.deepStrictEqual(result, transformedData); // Expect transformed data
    assert(
      footprintApiStub.calledOnce,
      "footprintApi.getCountries should be called"
    ); // API should be called
    assert(
      processBatchStub.calledOnce,
      "processBatch should be called Once (for batches)"
    ); // Batch processing should happen
    assert(transformStub.calledOnce, "transformData should be called once"); // Data should be transformed
    assert(sortStub.calledOnce, "sortByHighestTotal should be called once"); // Data should be sorted
    assert(redisSetStub.calledOnce, "redisClient.set should store new data"); // Redis cache should be updated
  });

  it("should call processBatch for each batch of countries", async () => {
    redisGetStub.resolves(null); // cache miss

    await prepareEmissionsByCountry();

    assert(
      processBatchStub.calledOnce,
      "processBatch should be called for each batch"
    );
  });

  it("should handle API errors", async () => {
    redisGetStub.resolves(null); // cache miss
    footprintApiStub.rejects(new Error("API Error")); // API failure

    try {
      await prepareEmissionsByCountry();
      assert.fail("error");
    } catch (error) {
      assert.match(
        error.message,
        /API Error/,
        "Failed to fetch data for country USA , API Error"
      ); // error handling
    }
  });

  it("should handle Redis connection failure", async () => {
    redisGetStub.rejects(new Error("Redis Connection Failed")); // Redis error

    try {
      await prepareEmissionsByCountry();
      assert.fail("error");
    } catch (error) {
      assert.match(
        error.message,
        /Redis Connection Failed/,
        "Should throw Redis error"
      ); //  error handling
    }
  });

  it("should handle invalid country data", async () => {
    redisGetStub.resolves(null); // cache miss
    footprintApiStub.resolves([{ countryName: null, countryCode: null }]); // invalid data

    try {
      await prepareEmissionsByCountry();
      assert.fail("Expected function to throw an error");
    } catch (error) {
      assert.match(
        error.message,
        /Cannot read properties of null/,
        "Should handle invalid country data"
      );
    }
  });
});
