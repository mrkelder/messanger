import { NextApiRequest, NextApiResponse } from "next";

import JWT from "src/utils/JWT";
import RequestHelper from "src/utils/RequestHelper";

type AuthHttpMethods = "GET" | "POST";

type ErrorReturn = Error | void;

export interface AuthControllerInput {
  req: NextApiRequest;
  res: NextApiResponse;
}

export abstract class UserController {
  protected accessToken: string;
  protected isUnexpectedErrorThrown = false;
  protected requestHelper: RequestHelper;
  protected req: AuthControllerInput["req"];
  protected res: AuthControllerInput["res"];

  constructor({ req, res }: AuthControllerInput) {
    this.requestHelper = new RequestHelper(req);
    this.accessToken = this.requestHelper.getBody().accessToken;
    this.req = req;
    this.res = res;
  }

  protected async verifyToken(): Promise<void> {
    try {
      const tokenData = JWT.verifyAccessToken(this.accessToken);
      await this.sendSuccessResponse(tokenData._id);
    } catch {
      this.throwExpiredToken();
    }
  }

  protected checkHttpMethod(method: AuthHttpMethods): void | Error {
    if (!this.requestHelper[`is${method}`]()) {
      this.throwHttpMethod();
      throw new Error();
    }
  }

  protected throwHttpMethod(): ErrorReturn {
    return this.throwError(405, "Unacceptable http method");
  }

  protected throwInvalidUserName() {
    return this.throwError(500, "User name is not specified");
  }

  protected throwUnspecifiedToken() {
    return this.throwError(401, "Access token is not specified");
  }

  protected throwExpiredToken() {
    return this.throwError(403, "Access token is expired");
  }

  protected throwDatabase() {
    return this.throwError(503, "Database is not available at the moment");
  }

  protected throwUserNotFound() {
    return this.throwError(404, "Users not found");
  }

  protected throwError(statusCode: number, errorMessage: string): ErrorReturn {
    this.res.status(statusCode).send(errorMessage);
    if (this.isUnexpectedErrorThrown) throw new Error(errorMessage);
    this.isUnexpectedErrorThrown = true;
  }

  protected abstract sendSuccessResponse(...params: any): void;
  protected abstract exec(): unknown;
}
