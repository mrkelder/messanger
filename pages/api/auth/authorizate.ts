import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

import RefreshToken from "src/models/RefreshToken";
import User from "src/models/User";
import { Credentials } from "src/types/auth";
import { DatabaseUser } from "src/types/db";
import JWT from "src/utils/JWT";
import RequestHelper from "src/utils/RequestHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  class Authorization {
    private static requestHelper = new RequestHelper(req);
    private static credentials: Credentials =
      Authorization.requestHelper.getBody();

    public static async run() {
      await Authorization.checkIfPostMethod();
    }

    private static async checkIfPostMethod() {
      if (Authorization.isPostMethod())
        await Authorization.connectToDbAndTryToAuthorizate();
      else Authorization.throwWrongMethodError();
    }

    private static isPostMethod(): boolean {
      return Authorization.requestHelper.isPOST();
    }

    private static throwWrongMethodError() {
      res.status(405).send("This endpoint only accepts POST method");
    }

    private static async connectToDbAndTryToAuthorizate() {
      try {
        await mongoose.connect(process.env.MONGODB_HOST as string);
        await Authorization.tryToAuthorizate();
      } catch {
        Authorization.throwServerError();
      } finally {
        if (mongoose.connection.readyState === 1) await mongoose.disconnect();
      }
    }

    private static throwServerError() {
      res.status(500).send("Server could not handle the request");
    }

    private static async tryToAuthorizate() {
      if (Authorization.areCredentialsDefined())
        await Authorization.checkIfUserExists();
      else Authorization.throwCredentialsError();
    }

    private static areCredentialsDefined(): boolean {
      const { name, password } = Authorization.credentials;
      return !!name && !!password;
    }

    private static throwCredentialsError() {
      res.status(500).send("Some credential unspecified");
    }

    private static async checkIfUserExists() {
      const foundUser = await Authorization.lookForUser();
      if (foundUser)
        await Authorization.checkCredentials(
          foundUser._id as string,
          foundUser.password
        );
      else this.throwUserNotFoundError();
    }

    private static async lookForUser(): Promise<DatabaseUser | undefined> {
      return (await User.findByName(Authorization.credentials.name)) as
        | DatabaseUser
        | undefined;
    }

    private static throwUserNotFoundError() {
      res.status(404).send("User not found");
    }

    private static async checkCredentials(
      userId: string,
      actualPassword: string
    ) {
      if (await Authorization.areCredentialsEqual(actualPassword))
        await Authorization.sendSuccessResponse(userId);
      else Authorization.throwCredentialsUnequalError();
    }

    private static async areCredentialsEqual(
      actualPassword: string
    ): Promise<boolean> {
      return await bcrypt.compare(
        Authorization.credentials.password,
        actualPassword
      );
    }

    private static async sendSuccessResponse(userId: string) {
      const { accessToken, refreshToken } = await Authorization.createTokens(
        userId
      );

      await RefreshToken.refresh(userId, refreshToken);

      res
        .setHeader(
          "Set-Cookie",
          `refreshToken=${refreshToken}; httpOnly; max-age=31556952`
        )
        .json({ accessToken, _id: userId });
    }

    private static async createTokens(userId: string): Promise<{
      accessToken: string;
      refreshToken: string;
    }> {
      const accessToken = JWT.createAccessToken(userId);
      const refreshToken = JWT.createRefreshToken(userId);
      return { accessToken, refreshToken };
    }

    private static throwCredentialsUnequalError() {
      res.status(401).send("Password is not correct");
    }
  }

  await Authorization.run();
}
