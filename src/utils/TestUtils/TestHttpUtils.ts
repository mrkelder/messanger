import JWT from "../JWT";
import {
  MockRequest,
  MockResponse,
  ResultObject,
  HttpMethods
} from "./TestUtils";

export class TestHttpUtils {
  private static res: MockResponse = {
    removeHeader: () => this.res,
    setHeader: () => this.res,
    status: () => this.res,
    json: () => this.res,
    send: () => this.res
  };

  public static createReultObject(): ResultObject {
    return { status: 200, data: null };
  }

  public static createRequest(
    httpMethod: HttpMethods,
    accessTokenUserId?: string
  ): MockRequest {
    return {
      method: httpMethod,
      body: {},
      cookies: {
        ...(accessTokenUserId && {
          accessToken: JWT.createAccessToken(accessTokenUserId)
        })
      }
    };
  }

  public static createResponse(sO: ResultObject): MockResponse {
    return {
      ...this.res,
      status: this.statusSetter(sO),
      json: this.jsonSetter(sO)
    };
  }

  private static statusSetter(statusObject: ResultObject) {
    return (statusCode: number) => {
      statusObject.status = statusCode;
      return this.res;
    };
  }

  private static jsonSetter(statusObject: any) {
    return (data: any) => {
      statusObject.data = data;
      return this.res;
    };
  }
}
