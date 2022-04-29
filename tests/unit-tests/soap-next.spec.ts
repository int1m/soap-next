import { SoapNext } from '../../src';

describe('soap-next', () => {
  let soapClient: SoapNext;

  beforeEach(() => {
    soapClient = new SoapNext({
      host: 'webservices.oorsprong.org',
      path: '/websamples.countryinfo/CountryInfoService.wso',
      wsdl: '/websamples.countryinfo/CountryInfoService.wso?WSDL',
    });
  });

  test('getAllFunctions', async () => {
    const result = await soapClient.getAllFunctions();
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
