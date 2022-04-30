import axios, { AxiosRequestHeaders, AxiosRequestConfig } from 'axios';
import { WsdlNext } from 'wsdl-next';
import { Agent } from 'http';
import { Agent as AgentHttps } from 'https';
import {
  SoapBodyAttributes, SoapBodyParams, SoapParams,
} from './SoapTypes';

export default class SoapRequest {
  private readonly url: string;

  private readonly clientParams: SoapParams;

  private wsdl: WsdlNext;

  private readonly requestAgent: Agent | AgentHttps;

  constructor(url: string, params: SoapParams, wsdl: WsdlNext) {
    this.url = url;
    this.clientParams = params;
    if (typeof this.clientParams.httpHeaders !== 'undefined') {
      this.clientParams.httpHeaders['Content-Type'] = 'text/xml; charset=utf-8';
    } else {
      this.clientParams.httpHeaders = {
        'Content-Type': 'text/xml; charset=utf-8',
      };
    }
    this.wsdl = wsdl;
    this.requestAgent = wsdl.requestAgent;
  }

  async getRequestHeadParams() {
    if (!this.clientParams.soapHeaders) {
      return null;
    }

    if (!Array.isArray(this.clientParams.soapHeaders)
      && this.clientParams.soapHeaders === Object(this.clientParams.soapHeaders)) {
      this.clientParams.soapHeaders = Object.keys(this.clientParams.soapHeaders).map((key) => ({
        name: key,
        value: this.clientParams.soapHeaders[key],
      }));
    }

    return this.clientParams.soapHeaders
      .map((item, index) => `<cns${index}:${item.name}>${item.value}</cns${index}:${item.name}>`);
  }

  async getRequestEnvelopeParams() {
    const namespaces: Array<{ short: string, full: string }> = await this.wsdl.getNamespaces();

    const namespaceFiltering = namespaces.filter((namespace) => namespace?.short !== 'xmlns');
    const xsd = namespaces.find((namespace) => namespace.short === 'xsd');

    if (this.clientParams?.soapHeaders?.length > 0) {
      this.clientParams.soapHeaders.forEach((header, index) => {
        namespaceFiltering.push({
          short: `cns${index}`,
          full: header.value,
        });
      });
    }

    return {
      soapEnv: 'http://schemas.xmlsoap.org/soap/envelope/',
      xml_schema: xsd?.full || 'http://www.w3.org/2001/XMLSchema',
      namespaces: namespaceFiltering,
    };
  }

  static getTagAttributes(attributes = {}) {
    const attributeKeys = Object.keys(attributes);
    if (attributeKeys.length === 0) {
      return '';
    }

    return ` ${attributeKeys
      .map((key) => `${key}="${attributes[key]}"`)
      .join(' ')}`;
  }

  getParamAsString(key: string, value: string, attributes: SoapBodyAttributes) {
    let val = value;

    if (Array.isArray(val)) {
      return val
        .map((valueItem) => this.getParamAsString(key, valueItem, attributes))
        .join('');
    }

    if (Object(val) === val) {
      val = Object.keys(val)
        .map(async (valueKey) => this.getParamAsString(valueKey, val[valueKey], attributes))
        .join('');
    }

    let attributesString = '';
    if (attributes) {
      attributesString = SoapRequest.getTagAttributes(attributes);
    }

    return `<${key}${attributesString}>${val}</${key}>`;
  }

  getMethodParamRequestString(requestParams, paramKey, bodyParams: SoapBodyParams) {
    let methodRequestParams = {};
    requestParams.forEach((requestParamsAttributes) => {
      if (requestParamsAttributes.params) {
        methodRequestParams = requestParamsAttributes.params
          .find((requestParamItem) => requestParamItem.name === paramKey
            || requestParamItem.element === paramKey);
      }
    });

    const paramValue = bodyParams[paramKey];

    return this.getParamAsString(
      paramKey,
      paramValue,
      methodRequestParams,
    );
  }

  async getRequestParamsAsString(
    method: string,
    bodyParams: SoapBodyParams,
    attributes: SoapBodyAttributes,
  ) {
    const methodParams = await this.wsdl.getMethodParamsByName(method);

    const requestParams = methodParams.request;

    const responseArray = [];
    Object.keys(bodyParams).forEach((paramKey) => responseArray.push(
      this.getMethodParamRequestString(requestParams, paramKey, bodyParams),
    ));

    let methodNameWithNameSpace = method;
    if (requestParams.length > 0 && requestParams[0].namespace) {
      methodNameWithNameSpace = `${requestParams[0].namespace}:${methodNameWithNameSpace}`;
    }

    return this.getParamAsString(methodNameWithNameSpace, responseArray.join(''), attributes);
  }

  async getRequestXml(
    method: string,
    bodyParams: SoapBodyParams,
    attributes: SoapBodyAttributes,
  ): Promise<string> {
    const headers = await this.getRequestHeadParams();
    const envelope = await this.getRequestEnvelopeParams();
    const body = await this.getRequestParamsAsString(method, bodyParams, attributes);

    const namespaces = envelope.namespaces.map((namespace) => `xmlns:${namespace.short}="${namespace.full}"`);
    const namespacesAsString = namespaces.join(' ');

    const headersEnvelope = (headers !== null) ? `<SOAP-ENV:Header>${headers.join('')}</SOAP-ENV:Header>` : '';
    const bodyEnvelope = `<SOAP-ENV:Body>${body}</SOAP-ENV:Body>`;

    const soapEnvelope = `<SOAP-ENV:Envelope
            xmlns:SOAP-ENV="${envelope.soapEnv}"
            ${namespacesAsString}>
            ${headersEnvelope}
            ${bodyEnvelope}
        </SOAP-ENV:Envelope>`;

    return `<?xml version="1.0" encoding="UTF-8"?>${soapEnvelope}`;
  }

  async request(body: string) {
    const urlWithoutParams = this.url.split('?')[0];

    const axiosConfig: AxiosRequestConfig = {
      url: urlWithoutParams,
      method: 'POST',
      headers: this.clientParams.httpHeaders as AxiosRequestHeaders,
      responseType: 'text',
      data: body,
    };

    if (this.requestAgent instanceof Agent) {
      axiosConfig.httpAgent = this.requestAgent;
    } else {
      axiosConfig.httpsAgent = this.requestAgent;
    }

    const result = await axios(axiosConfig);

    return result.data as string;
  }

  async call(method: string, bodyParams: SoapBodyParams, attributes: SoapBodyAttributes) {
    const requestXml = await this.getRequestXml(method, bodyParams, attributes);
    const result = await this.request(requestXml);
    return result;
  }
}
