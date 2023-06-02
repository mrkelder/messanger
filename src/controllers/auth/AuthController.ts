import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

import RefreshToken from "src/models/RefreshToken";
import JWT from "src/utils/JWT";
import RequestHelper from "src/utils/RequestHelper";

type AuthHttpMethods = "POST" | "PUT";

type ExecMethod = () => Promise<unknown>;

type ErrorReturn = Error | void;

export interface AuthControllerInput {
  req: NextApiRequest;
  res: NextApiResponse;
}

export interface CredentialsBody {
  name: string;
  password: string;
}

export abstract class AuthController {
  private isUnexpectedErrorThrown = false;
  private requestHelper: RequestHelper;
  protected req: AuthControllerInput["req"];
  protected res: AuthControllerInput["res"];

  constructor({ req, res }: AuthControllerInput) {
    this.requestHelper = new RequestHelper(req);
    this.req = req;
    this.res = res;
  }

  protected async createTokens(userId: string) {
    const accessToken = JWT.createAccessToken(userId);
    const refreshToken = JWT.createRefreshToken(userId);
    await this.saveRefreshTokenToDatabase(userId, refreshToken);
    return { accessToken, refreshToken };
  }

  private async saveRefreshTokenToDatabase(
    userId: string,
    refreshToken: string
  ) {
    await RefreshToken.refreshOrInsert(
      new mongoose.Types.ObjectId(userId),
      refreshToken
    );
  }

  protected async setUp(execMethod: ExecMethod) {
    try {
      await this.connectToDb();
      await execMethod();
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

  protected getBody<T>(): T {
    return this.requestHelper.getBody() as T;
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

  protected throwServerError(): ErrorReturn {
    return this.throwError(500, "Server could not handle the request");
  }

  protected throwRefreshTokenInvalid(): ErrorReturn {
    return this.throwError(401, "Refresh token invalid");
  }

  protected throwUserExists(): ErrorReturn {
    return this.throwError(409, "The user already exists");
  }

  protected throwUserNotFound(): ErrorReturn {
    return this.throwError(404, "User not found");
  }

  protected throwInvalidPassword(): ErrorReturn {
    return this.throwError(401, "Password is not correct");
  }

  protected throwError(statusCode: number, errorMessage: string): ErrorReturn {
    if (!this.res.headersSent) this.res.status(statusCode).send(errorMessage);
    this.isUnexpectedErrorThrown = true;
    throw new Error(errorMessage);
  }

  protected abstract sendSuccessResponse(...params: any): void;
  protected abstract exec(): unknown;
}
