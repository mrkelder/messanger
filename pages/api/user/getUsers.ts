import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

import User from "src/models/User";
import JWT from "src/utils/JWT";
import RequestHelper from "src/utils/RequestHelper";

type UserWithoutPassword = { _id: string; name: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  class GetChats {
    private static requestHelper = new RequestHelper(req);
    private static accessToken = req.cookies.accessToken;
    private static userName = req.query.userName;

    public static async run(): Promise<void> {
      await GetChats.checkGetMethod();
    }

    private static async checkGetMethod(): Promise<void> {
      if (GetChats.requestHelper.isGET()) await GetChats.checkUserName();
      else GetChats.throwMethodError();
    }

    private static async checkUserName(): Promise<void> {
      if (GetChats.userName && GetChats.userName.length > 0)
        await GetChats.checkAccessToken();
      else GetChats.throwInvalidUserNameError();
    }

    private static async checkAccessToken(): Promise<void> {
      if (GetChats.accessToken) await GetChats.verifyToken();
      else GetChats.throwUnspecifiedTokenError();
    }

    private static async verifyToken(): Promise<void> {
      try {
        JWT.verifyAccessToken(GetChats.accessToken);
        await GetChats.sendSuccessfulResponse();
      } catch {
        GetChats.throwExpiredTokenError();
      }
    }

    private static async sendSuccessfulResponse(): Promise<void> {
      try {
        await mongoose.connect(process.env.MONGODB_HOST as string);
        const foundUsers = await GetChats.performDatabaseQuery();
        GetChats.sendTotalRepsonse(foundUsers);
      } catch (e) {
        GetChats.throwDatabaseError();
      } finally {
        if (mongoose.connection.readyState === 1) await mongoose.disconnect();
      }
    }

    private static async performDatabaseQuery(): Promise<
      UserWithoutPassword[]
    > {
      const data = await User.find(
        { name: { $regex: GetChats.userName } },
        { password: 0, __v: 0 }
      );

      return data as UserWithoutPassword[];
    }

    private static sendTotalRepsonse(foundUsers: UserWithoutPassword[]): void {
      if (foundUsers.length > 0) res.json(foundUsers);
      else GetChats.throwNotFoundError();
    }

    private static throwMethodError() {
      res.status(405).send("This endpoint only accepts GET method");
    }

    private static throwInvalidUserNameError() {
      res.status(500).send("User name is not specified");
    }

    private static throwUnspecifiedTokenError() {
      res.status(401).send("Access token is not specified");
    }

    private static throwExpiredTokenError() {
      res.status(403).send("Access token is expired");
    }

    private static throwDatabaseError() {
      res.status(503).send("Database is not available at the moment");
    }

    private static throwNotFoundError() {
      res.status(404).send("Users not found");
    }
  }

  await GetChats.run();
}
