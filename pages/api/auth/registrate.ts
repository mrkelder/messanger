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
  class Registration {
    private static requestHelper = new RequestHelper(req);
    private static credentials: Credentials =
      Registration.requestHelper.getBody();

    public static async run() {
      await Registration.checkIfPostMethod();
    }

    private static async checkIfPostMethod() {
      if (Registration.isPostMethod())
        await Registration.connectToDbAndTryToRegistrate();
      else Registration.throwWrongMethodError();
    }

    private static isPostMethod(): boolean {
      return Registration.requestHelper.isPOST();
    }

    private static throwWrongMethodError() {
      res.status(405).send("This endpoint only accepts POST method");
    }

    private static async connectToDbAndTryToRegistrate() {
      try {
        await mongoose.connect(process.env.MONGODB_HOST as string);
        await Registration.tryToRegistrate();
      } catch {
        Registration.throwServerError();
      } finally {
        if (mongoose.connection.readyState === 1) await mongoose.disconnect();
      }
    }

    private static async tryToRegistrate() {
      if (Registration.areCredentialsDefined())
        await Registration.checkIfUserExists();
      else Registration.throwCredentialsError();
    }

    private static throwServerError() {
      res.status(500).send("Server could not handle the request");
    }

    private static areCredentialsDefined(): boolean {
      const { name, password } = Registration.credentials;
      return !!name && !!password;
    }

    private static throwCredentialsError() {
      res.status(500).send("Either name or password was not provided");
    }

    private static async checkIfUserExists() {
      const foundUser = await Registration.lookForUsers();
      if (foundUser) Registration.throwUserExistsError();
      else await Registration.completeRegistration();
    }

    private static async lookForUsers(): Promise<DatabaseUser | undefined> {
      const { name } = Registration.credentials;
      return (await User.findByName(name))[0] as DatabaseUser | undefined;
    }

    private static throwUserExistsError() {
      res.status(409).send("The user already exists");
    }

    private static async completeRegistration() {
      const newUser = await Registration.createUser();
      Registration.sendSuccessResponse(newUser._id as string);
    }

    private static async createUser(): Promise<DatabaseUser> {
      const { name, password } = Registration.credentials;
      const encryptedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        password: encryptedPassword
      });
      await newUser.save();
      return newUser;
    }

    private static sendSuccessResponse(userId: string) {
      const { accessToken, refreshToken } = Registration.createTokens(userId);
      res
        .status(200)
        .setHeader(
          "Set-Cookie",
          `refreshToken=${refreshToken}; httpOnly; max-age=31556952`
        )
        .json({ accessToken });
    }

    private static createTokens(userId: string): {
      accessToken: string;
      refreshToken: string;
    } {
      const accessToken = JWT.createAccessToken(userId);
      const refreshToken = JWT.createRefreshToken(userId);
      return { accessToken, refreshToken };
    }
  }

  await Registration.run();
}
