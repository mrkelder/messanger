import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

import JWT from "src/utils/JWT";
import RequestHelper from "src/utils/RequestHelper";

type AuthHttpMethods = "GET" | "POST";

type ExecMethod = (userId: string) => Promise<void>;

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

  protected async setUp(execMethod: ExecMethod) {
    try {
      const userId = (await this.checkAccessToken()) as string;
      await this.connectToDb();
      await execMethod(userId);
    } catch {
      if (!this.isUnexpectedErrorThrown) this.throwServerError();
    } finally {
      await this.disconnectFromDb();
    }
  }

  protected async connectToDb() {
    await mongoose.connect(process.env.MONGODB_HOST as string);
  }

  protected async disconnectFromDb() {
    if (mongoose.connection.readyState === 1) await mongoose.disconnect();
  }

  protected async checkAccessToken(): Promise<string | ErrorReturn> {
    try {
      const tokenData = JWT.verifyAccessToken(this.accessToken);
      return tokenData._id;
    } catch {
      return this.throwExpiredToken();
    }
  }

  protected checkHttpMethod(method: AuthHttpMethods): void | Error {
    if (!this.requestHelper[`is${method}`]()) {
      this.throwHttpMethod();
      throw new Error();
    }
  }

  protected throwServerError(): ErrorReturn {
    return this.throwError(500, "Server could not handle the request");
  }

  protected throwHttpMethod() {
    return this.throwError(405, "Unacceptable http method");
  }

  protected throwInvalidPeerId() {
    return this.throwError(500, "Such user does not exist");
  }

  protected throwUnspecifiedToken() {
    return this.throwError(401, "Access token is not specified");
  }

  protected throwExpiredToken() {
    return this.throwError(403, "Access token is expired");
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
  protected abstract exec(
    ...params: Parameters<ExecMethod>
  ): ReturnType<ExecMethod>;
}
