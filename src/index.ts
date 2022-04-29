import {
  SoapBodyAttributes, SoapBodyParams, SoapOptions, SoapParams, SoapHeaders, HttpHeaders,
} from './SoapTypes';
import SoapRequest from './SoapRequest';

class SoapNext {
  private readonly params: SoapParams;

  private readonly options: SoapOptions;

  private soapRequest: SoapRequest;

  private wsdl = require('wsdlrdr');

  constructor(params: SoapParams, options: SoapOptions = { secure: false }) {
    this.params = params;
    this.options = options;
    this.soapRequest = new SoapRequest(params, options);
  }

  async getAllFunctions() {
    return await this.wsdl.getAllFunctions(this.params, this.options);
  }

  async getMethodParamsByName(method: string) {
    return await this.wsdl.getMethodParamsByName(method, this.params, this.options);
  }

  getXmlDataAsJson(xml: string) {
    return this.wsdl.getXmlDataAsJson(xml);
  }

  async call(method: string, params: SoapBodyParams = {}, attributes: SoapBodyAttributes = {}) {
    const result = await this.soapRequest.call(method, params, attributes);
    const date = this.getXmlDataAsJson(result);

    return date;
  }
}

export {
  SoapNext, SoapParams, SoapOptions, SoapBodyAttributes, SoapBodyParams, SoapHeaders, HttpHeaders,
};
