export interface SoapHeaders {
  name: string,
  value: string,
}

export type HttpHeaders = Record<string, string> & {
  "set-cookie"?: string[]
};

export interface SoapBodyAttributes {
  [name: string]: string,
}

export interface SoapBodyParams {
  [name: string]: string,
}

export interface SoapParams {
  host: string,
  path: string,
  wsdl: string,
  soapHeaders?: Array<SoapHeaders>,
  httpHeaders?: HttpHeaders,
}

export interface SoapOptions {
  secure: boolean,
}
