export interface SoapHeaders {
  name: string,
  value: string,
}

export type HttpHeaders = Record<string, string> & {
  'set-cookie'?: string[]
};

export interface SoapBodyAttributes {
  [name: string]: string,
}

export interface SoapBodyParams {
  [name: string]: string,
}

export interface SoapParams {
  soapHeaders?: Array<SoapHeaders>,
  httpHeaders?: HttpHeaders,
}
