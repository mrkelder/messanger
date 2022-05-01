import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

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
      } catch (err) {
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
        await Authorization.verifyAccessToken(
          Authorization.credentials.accessToken as string
        );
      else Authorization.throwCredentialsError();
    }

    private static areCredentialsDefined(): boolean {
      const { name, password, accessToken } = Authorization.credentials;
      console.log(Authorization.credentials);

      return !!name && !!password && !!accessToken;
    }

    private static throwCredentialsError() {
      res.status(500).send("Some credential unspecified");
    }

    private static async verifyAccessToken(accessToken: string) {
      try {
        const { _id } = JWT.verifyAccessToken(accessToken);
        await Authorization.checkIfUserExists(_id);
      } catch {
        Authorization.throwAccessTokenError();
      }
    }

    private static throwAccessTokenError() {
      res.status(403).send("Access token expired");
    }

    private static async checkIfUserExists(userId: string) {
      const foundUser = await Authorization.lookForUser(userId);
      if (foundUser) await Authorization.checkCredentials(foundUser.password);
      else this.throwUserNotFoundError();
    }

    private static async lookForUser(
      userId: string
    ): Promise<DatabaseUser | undefined> {
      return (await User.findById(userId)) as DatabaseUser | undefined;
    }

    private static throwUserNotFoundError() {
      res.status(404).send("User not found");
    }

    private static async checkCredentials(actualPassword: string) {
      if (await Authorization.areCredentialsEqual(actualPassword))
        Authorization.sendSuccessResponse();
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

    private static sendSuccessResponse() {
      res.send("Success");
    }

    private static throwCredentialsUnequalError() {
      res.status(401).send("Password is not correct");
    }
  }

  await Authorization.run();
}
