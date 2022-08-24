export type execMongodbCallback<T> = () => Promise<T>;

export interface Credentials {
  name: string;
  password: string;
}

export type HttpMethods = "GET" | "POST" | "PUT" | "DELETE";

export interface ResultObject {
  status: number;
  data: any;
}

export interface MockRequest {
  method: HttpMethods;
  body: {
    [key: string]: string | number;
  };
  cookies: {
    [key: string]: string;
  };
}

export interface MockResponse {
  removeHeader: () => MockResponse;
  setHeader: () => MockResponse;
  status: (statusCode: number) => MockResponse;
  json: (data: any) => MockResponse;
  send: (data: string) => MockResponse;
}
