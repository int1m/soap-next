import { WsdlNext } from 'wsdl-next';

import {
  SoapBodyAttributes, SoapBodyParams, SoapParams, SoapHeaders, HttpHeaders,
} from './SoapTypes';
import SoapRequest from './SoapRequest';

class SoapNext {
  private readonly soapRequest: SoapRequest;

  private readonly wsdl: WsdlNext;

  constructor(url: string, params: SoapParams = {}) {
    this.wsdl = new WsdlNext(url);
    this.soapRequest = new SoapRequest(url, params, this.wsdl);
  }

  async getAllMethods() {
    const result = await this.wsdl.getAllMethods();
    return result;
  }

  async getMethodParamsByName(method: string) {
    const result = await this.wsdl.getMethodParamsByName(method);
    return result;
  }

  async call(
    method: string,
    params: SoapBodyParams = {},
    attributes: SoapBodyAttributes = {},
  ): Promise<any> {
    const result = await this.soapRequest.call(method, params, attributes);
    const data = WsdlNext.getXmlDataAsJson(result);

    return data;
  }
}

export {
  SoapNext, SoapParams, SoapBodyAttributes, SoapBodyParams, SoapHeaders, HttpHeaders,
};
