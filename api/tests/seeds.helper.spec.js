import assert from "assert";
import sinon from "sinon";
import * as seedsHelper from "../helpers/seeds.helper";
import footprintApi from "../helpers/footprint.helper";

describe("Testing emissions helper functions", function () {
  this.timeout(30); // Increase timeout to 30 seconds

  let footprintApiStub;
  let fetchDataStub;

  beforeEach(() => {
    footprintApiStub = sinon.stub(footprintApi, "getCountries");
    fetchDataStub = sinon.stub(footprintApi, "getDataForCountry");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should transform data correctly", () => {
    const inputData = {
      armenia: [
        { year: 2020, carbon: 5000.1234 },
        { year: 2021, carbon: 6000.5678 },
      ],
      afghanistan: [
        { year: 2020, carbon: 3000.1234 },
        { year: 2021, carbon: 4000.5678 },
      ],
    };

    const expectedOutput = {
      2020: [
        { country: "armenia", total: 5000.1234 },
        { country: "afghanistan", total: 3000.1234 },
      ],
      2021: [
        { country: "armenia", total: 6000.5678 },
        { country: "afghanistan", total: 4000.5678 },
      ],
    };

    const result = seedsHelper.transformData(inputData);
    assert.deepStrictEqual(result, expectedOutput);
  });

  it("should fetch data", async () => {
    fetchDataStub.resolves({ year: 2020, carbon: 5000 });

    const testPromise = seedsHelper.fetchData("AM");
    const result = await testPromise;

    assert(fetchDataStub.calledOnce);
    assert(result.year === 2020 && result.carbon === 5000);
  });

  it("should sort data by highest total", async () => {
    const inputData = {
      2020: [
        { country: "armenia", total: 5000 },
        { country: "afghanistan", total: 3000 },
      ],
      2021: [
        { country: "armenia", total: 6000 },
        { country: "afghanistan", total: 4000 },
      ],
    };

    const expectedOutput = {
      2020: [
        { country: "armenia", total: 5000 },
        { country: "afghanistan", total: 3000 },
      ],
      2021: [
        { country: "armenia", total: 6000 },
        { country: "afghanistan", total: 4000 },
      ],
    };

    const result = await seedsHelper.sortByHighestTotal(inputData);
    assert.deepStrictEqual(result, expectedOutput);
  });
  it("should return an array of fulfilled values when all promises are resolved - processBatch", async () => {
    // Mock fetchData to resolve with specific values
    fetchDataStub
      .withArgs(10)
      .resolves({ countryCode: 10, carbon: 2 })
      .withArgs(11)
      .resolves({ countryCode: 11, carbon: 3 })
      .withArgs(12)
      .resolves({ countryCode: 12, carbon: 4 });

    const countries = [
      { countryCode: 10 },
      { countryCode: 11 },
      { countryCode: 12 },
    ];
    const result = await seedsHelper.processBatch(countries);
    // Assertions using assert
    assert.deepStrictEqual(result, [
      { countryCode: 10, carbon: 2 },
      { countryCode: 11, carbon: 3 },
      { countryCode: 12, carbon: 4 },
    ]);

    // Ensure fetchData was called 3 times
    assert.strictEqual(fetchDataStub.callCount, 3);
  });

  it("should filter out rejected promises and return only fulfilled values - processBatch", async () => {
    // Mock fetchData to resolve or reject based on the input
    fetchDataStub
      .withArgs(10)
      .resolves({ countryCode: 10, carbon: 2 })
      .withArgs(11)
      .rejects(new Error("Failed to fetch Austria"))
      .withArgs(12)
      .resolves({ countryCode: 12, carbon: 3 });

    const countries = [
      { countryCode: 10 },
      { countryCode: 11 },
      { countryCode: 12 },
    ];

    const result = await seedsHelper.processBatch(countries);
    assert.deepStrictEqual(result, [
      { countryCode: 10, carbon: 2 },
      { countryCode: 12, carbon: 3 },
    ]);

    // Ensure fetchData was called 3 times
    assert.strictEqual(fetchDataStub.callCount, 3);
  });

  it("should return an empty array when all promises are rejected - processBatch", async () => {
    // Mock fetchData to reject all promises
    fetchDataStub
      .withArgs(10)
      .rejects(new Error("Failed to fetch Australia"))
      .withArgs(11)
      .rejects(new Error("Failed to fetch Austria"))
      .withArgs(12)
      .rejects(new Error("Failed to fetch Bahamas"));

    const countries = [
      { countryCode: 10 },
      { countryCode: 11 },
      { countryCode: 12 },
    ];

    const result = await seedsHelper.processBatch(countries);

    assert.deepStrictEqual(result, []);

    // Ensure fetchData was called 3 times
    assert.strictEqual(fetchDataStub.callCount, 3);
  });
});
