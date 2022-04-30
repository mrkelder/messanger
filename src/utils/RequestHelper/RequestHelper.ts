import { NextApiRequest } from "next";

type HttpMethods = "GET" | "POST" | "PUT" | "DELETE";

class RequestHelper {
  private request: NextApiRequest;

  constructor(req: NextApiRequest) {
    this.request = req;
  }

  public getBody(): any {
    try {
      const { body } = this.request;
      if (typeof body === "string") return JSON.parse(body);
      else if (typeof body === "object") return body as Object;
      else return undefined;
    } catch {
      return undefined;
    }
  }

  public isGET(): boolean {
    return this.isExpectedMethod("GET");
  }

  public isPOST(): boolean {
    return this.isExpectedMethod("POST");
  }

  public isPUT(): boolean {
    return this.isExpectedMethod("PUT");
  }

  public isDELETE(): boolean {
    return this.isExpectedMethod("DELETE");
  }

  private isExpectedMethod(method: HttpMethods): boolean {
    return this.request.method?.toUpperCase() === method;
  }
}

export default RequestHelper;
