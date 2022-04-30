<div align="center">
    <h1>soap-next</h1>
    <p>soap-next is a simple SOAP client for Node.js</p>

[![npm version](https://badgen.net/npm/v/soap-next)](https://www.npmjs.com/package/soap-next)
[![npm downloads](https://badgen.net/npm/dm/soap-next)](https://www.npmjs.com/package/soap-next)
[![npm downloads](https://badgen.net/npm/license/soap-next)](https://www.npmjs.com/package/soap-next)
</div>

## Installing

Install with npm

```shell
npm install soap-next
```

Install with yarn

```shell
yarn add soap-next
```

## Basic Usage

### Create SOAP client

await SoapNext.create(url: string, params: SoapParams)

```ts
soapClient = await SoapNext.create('http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL');
```

**SoapParams**

```ts
interface SoapParams {
  soapHeaders?: Array<SoapHeaders>,
  httpHeaders?: HttpHeaders,
}
```

### Call SOAP method

soapClient.call(method: string, params: SoapBodyParams = {}, attributes: SoapBodyAttributes = {})

```ts
const result = await soapClient.call('CountryName', {
  sCountryISOCode: 'US',
});
```

### Get all SOAP method


```ts
const result = await soapClient.getAllMethods();
```

## Credits

soap-next was inspired by [easysoap](https://github.com/moszeed/easysoap), rewritten in TypeScript for further improvement.

## License

soap-next is released under the MIT License. See the bundled LICENSE file for details.
