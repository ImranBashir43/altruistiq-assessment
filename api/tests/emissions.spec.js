import assert from 'assert';
import sinon from 'sinon';
import * as seedsController from '../controllers/seeds.controller';
import { getEmissionsByCountry } from '../controllers/countries.controller';

describe('Testing emissions controller', () => {
  let prepareEmissionsByCountryStub;

  beforeEach(() => {
    prepareEmissionsByCountryStub = sinon.stub(seedsController, 'prepareEmissionsByCountry');
  });

  afterEach(() => {
    sinon.restore();
  });


  it('should prepare emissions data', async () => {
    const req = {};
    const res = {
      json: sinon.spy(),
    };

    await getEmissionsByCountry(req, res);

    assert(prepareEmissionsByCountryStub.calledOnce);
    assert(res.json.calledWith({ data: undefined, message: 'Emissions per country retrieved successfully!' }));
  });

  it('should handle errors gracefully', async () => {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      send: sinon.spy(),
    };

    await getEmissionsByCountry(req, res);

    assert(res.status.calledWith(500));
    assert(res.send.calledWith('Internal Server Error'));
  });
});
