import assert from 'assert';
import sinon from 'sinon';
import * as seedsHelper from '../helpers/seeds.helper';
import footprintApi from '../helpers/footprint.helper';
import * as seedsController from '../controllers/seeds.controller';

describe('Testing emissions controller and helper functions', function() {
  this.timeout(10); // Increase timeout to 30 seconds

  let footprintApiStub;
  let fetchDataStub;

  beforeEach(() => {
    footprintApiStub = sinon.stub(footprintApi, 'getCountries');
    fetchDataStub = sinon.stub(footprintApi, 'getDataForCountry');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should prepare emissions data by country', async () => {
    const countriesMock = [
      {
        "score": "3A",
        "shortName": "Armenia",
        "countryCode": "1",
        "countryName": "Armenia",
        "isoa2": "AM"
      },
      {
        "score": "3A",
        "shortName": "Afghanistan",
        "countryCode": "2",
        "countryName": "Afghanistan",
        "isoa2": "AF"
      }
    ];
    const dataMock = [
      { year: 2020, carbon: 5000, countryName: "Afghanistan" },
      { year: 2021, carbon: 6000, countryName: "Armenia" }
    ];

    footprintApiStub.resolves(countriesMock);
    fetchDataStub.resolves(dataMock);

    const testPromise = seedsController.prepareEmissionsByCountry();
    
    await testPromise;

    assert(footprintApiStub.calledOnce);
    assert(fetchDataStub.calledTwice); // Called for each country in countriesMock
  });

  it('should not fetch data for skipped countries', async () => {
    const countriesMock = [
      {
        "score": "3A",
        "shortName": "Armenia",
        "countryCode": "1",
        "countryName": "Armenia",
        "isoa2": "AM"
      },
      {
        "score": "3A",
        "shortName": "all",
        "countryCode": "2",
        "countryName": "all",
        "isoa2": "all"
      }
    ];
    const dataMock = [
      { year: 2020, carbon: 5000, countryName: "Afghanistan" },
      { year: 2021, carbon: 6000, countryName: "Armenia" }
    ];

    footprintApiStub.resolves(countriesMock);
    fetchDataStub.resolves(dataMock);

    const testPromise = seedsController.prepareEmissionsByCountry();
    
    await testPromise;

    assert(footprintApiStub.calledOnce);
    assert(fetchDataStub.calledOnce); // Only one call because one country is skipped
  });

  it('should transform data correctly', () => {
    const inputData = {
      armenia: [
        { year: 2020, carbon: 5000.1234 },
        { year: 2021, carbon: 6000.5678 }
      ],
      afghanistan: [
        { year: 2020, carbon: 3000.1234 },
        { year: 2021, carbon: 4000.5678 }
      ]
    };

    const expectedOutput = {
      2020: [
        { country: 'armenia', total: 5000.1234 },
        { country: 'afghanistan', total: 3000.1234 }
      ],
      2021: [
        { country: 'armenia', total: 6000.5678 },
        { country: 'afghanistan', total: 4000.5678 }
      ]
    };

    const result = seedsHelper.transformData(inputData);
    assert.deepStrictEqual(result, expectedOutput);
  });

  it('should fetch data', async () => {
    fetchDataStub.resolves({ year: 2020, carbon: 5000 });

    const testPromise = seedsHelper.fetchData('AM');
    const result = await testPromise;

    assert(fetchDataStub.calledOnce);
    assert(result.year === 2020 && result.carbon === 5000);
  });

  it('should sort data by highest total', async () => {
    const inputData = {
      2020: [
        { country: 'armenia', total: 5000 },
        { country: 'afghanistan', total: 3000 }
      ],
      2021: [
        { country: 'armenia', total: 6000 },
        { country: 'afghanistan', total: 4000 }
      ]
    };

    const expectedOutput = {
      2020: [
        { country: 'armenia', total: 5000 },
        { country: 'afghanistan', total: 3000 }
      ],
      2021: [
        { country: 'armenia', total: 6000 },
        { country: 'afghanistan', total: 4000 }
      ]
    };

    const result = await seedsHelper.sortByHighestTotal(inputData);
    assert.deepStrictEqual(result, expectedOutput);
  });
});
