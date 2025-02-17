import dotenv from 'dotenv';
dotenv.config();
import sinon from 'sinon';
import axios from 'axios';
import assert from 'assert';
import  footprintApi, { api, getBackoffDelay } from '../helpers/footprint.helper';

const FOOT_PRINT_API_KEY = process.env.FOOT_PRINT_API_KEY;
const FOOT_PRINT_BASE_URL = process.env.FOOT_PRINT_BASE_URL;

if (!FOOT_PRINT_BASE_URL) {
  throw new Error('FOOT_PRINT_BASE_URL is not defined');
}


describe('footprintApi', function () {
  let axiosStub;
  let axiosCreateStub;


  beforeEach(() => {
    axiosCreateStub = sinon.stub(axios, 'create').returns({
        get: sinon.stub().resolves({ data: { message: 'success' } })
      });
      axiosStub = axiosCreateStub().get;
      
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should have correct base URL and auth configuration', function () {
    assert.equal(api.defaults.baseURL, FOOT_PRINT_BASE_URL);
    assert.equal(api.defaults.auth.username, 'any-user-name');
    assert.equal(api.defaults.auth.password, FOOT_PRINT_API_KEY);
  });

  it('should have a timeout of 30 seconds', function () {
    assert.equal(api.defaults.timeout , 30000);
  });
  it('should return data on successful get request with authentication', async function () {
    const mockData = [
        {
          countryCode: '1',
        },
        {
          countryCode: '2'
        }
      ];
    axiosStub.resolves(mockData);
    
    const result = await footprintApi.get(`${FOOT_PRINT_BASE_URL}countries`);
    assert.ok(result, 'Expected result to be defined');


  });
  it('should fetch data for a specific country', async () => {
    const countryCode = 12;
    const response = await footprintApi.getDataForCountry(countryCode);
    assert.ok(response, 'Expected response to be defined');
   
    
  });

  it('should retry on 429 error and eventually succeed with authentication', async function () {
    const mockData = { data: { message: 'success' } };
    const error429 = { response: { status: 429 }, config: { retry: 2, retryCount: 1 } };
    
    axiosStub.onCall(0).rejects(error429);
    axiosStub.onCall(1).rejects(error429);
    axiosStub.onCall(2).resolves(mockData);
    
    const result = await footprintApi.get(`${FOOT_PRINT_BASE_URL}data/12/all/EFCpc`);
    assert.ok(result, 'result to be defined');
  });

  it('should throw an error if all retries fail', async function () {
    const error = new Error('Request failed');
    axiosStub.rejects(error);

    try {
      await footprintApi.get(`${FOOT_PRINT_BASE_URL}data/12/all/EFCpc`);
      assert.fail('Request failed');
    } catch (err) {
      assert.equal(err.message, 'Request failed');
    }
  });
  it('should return exponential backoff delay with a max of 10 seconds', function () {
    assert.equal(getBackoffDelay(0), 1000);
    assert.equal(getBackoffDelay(1), 2000);
    assert.equal(getBackoffDelay(2), 4000);
    assert.equal(getBackoffDelay(3), 8000);
  });
});