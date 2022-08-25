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
    this.accessToken = req.cookies.accessToken as string;
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
    if (!this.accessToken) this.throwInvalidToken();
    try {
      const tokenData = JWT.verifyAccessToken(this.accessToken);
      return tokenData._id;
    } catch {
      this.throwInvalidToken();
    }
  }

  protected checkHttpMethod(method: AuthHttpMethods): void | Error {
    if (!this.requestHelper[`is${method}`]()) {
      this.throwHttpMethod();
    }
  }

  protected throwServerError(): ErrorReturn {
    this.throwError(500, "Server could not handle the request");
  }

  protected throwHttpMethod() {
    this.throwError(405, "Unacceptable http method");
  }

  protected throwInvalidPeerId() {
    this.throwError(400, "Peer id is invalid");
  }

  protected throwInvalidToken() {
    this.throwError(403, "Access token is expired");
  }

  protected throwUserNotFound() {
    this.throwError(404, "Users not found");
  }

  protected throwError(statusCode: number, errorMessage: string): ErrorReturn {
    this.res.status(statusCode).send(errorMessage);
    this.isUnexpectedErrorThrown = true;
    throw new Error(errorMessage);
  }

  protected abstract sendResponse(...params: any): void;
  protected abstract exec(
    ...params: Parameters<ExecMethod>
  ): ReturnType<ExecMethod>;
}
