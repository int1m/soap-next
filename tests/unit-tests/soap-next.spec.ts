import { SoapNext } from '../../src';

describe('soap-next', () => {
  let soapClient: SoapNext;

  beforeEach(() => {
    soapClient = new SoapNext('http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL');
  });

  test('getAllMethods', async () => {
    const result = await soapClient.getAllMethods();
    expect(result).toContain('CountryName');
  });

  test('getMethodParamsByName', async () => {
    const result = await soapClient.getMethodParamsByName('CountryName');
    expect(result).toBeDefined();
  });

  test('callMethod', async () => {
    const result = await soapClient.call('CountryName', {
      sCountryISOCode: 'US',
    });
    expect(result.CountryNameResponse.CountryNameResult).toBe('United States');
  });
});
