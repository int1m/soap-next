import { WsdlNext } from 'wsdl-next';

import {
  SoapBodyAttributes, SoapBodyParams, SoapParams, SoapHeaders, HttpHeaders,
} from './SoapTypes';
import SoapRequest from './SoapRequest';

class SoapNext {
  private readonly soapRequest: SoapRequest;

  private readonly wsdl: WsdlNext;

  private constructor(url: string, wsdl: WsdlNext, params: SoapParams = {}) {
    this.wsdl = wsdl;
    this.soapRequest = new SoapRequest(url, params, wsdl);
  }

  static async create(url: string, params: SoapParams = {}) {
    const wsdl = await WsdlNext.create(url);
    return new SoapNext(url, wsdl, params);
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
