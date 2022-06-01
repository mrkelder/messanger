import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

import Chat from "src/models/Chat";
import { DatabaseChat } from "src/types/db";
import JWT from "src/utils/JWT";
import RequestHelper from "src/utils/RequestHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  class GetChats {
    private static requestHelper = new RequestHelper(req);
    private static accessToken = req.cookies.accessToken;

    public static async run(): Promise<void> {
      await GetChats.checkGetMethod();
    }

    private static async checkGetMethod(): Promise<void> {
      if (GetChats.requestHelper.isGET()) await GetChats.checkAccessToken();
      else GetChats.throwMethodError();
    }

    private static async checkAccessToken(): Promise<void> {
      if (GetChats.accessToken) await GetChats.verifyToken();
      else GetChats.throwUnspecifiedTokenError();
    }

    private static async verifyToken(): Promise<void> {
      try {
        const tokenData = JWT.verifyAccessToken(GetChats.accessToken);
        await GetChats.sendSuccessfulResponse(tokenData._id);
      } catch {
        GetChats.throwExpiredTokenError();
      }
    }

    private static async sendSuccessfulResponse(
      idString: string
    ): Promise<void> {
      try {
        await mongoose.connect(process.env.MONGODB_HOST as string);
        res.json(await GetChats.retrieveChats(idString));
      } catch {
        GetChats.throwDatabaseError();
      } finally {
        if (mongoose.connection.readyState === 1) await mongoose.disconnect();
      }
    }

    private static async retrieveChats(
      idString: string
    ): Promise<DatabaseChat[]> {
      const _id = new mongoose.Types.ObjectId(idString);

      return (await Chat.find({
        members: { $in: _id }
      })) as DatabaseChat[];
    }

    private static throwMethodError() {
      res.status(405).send("This endpoint only accepts GET method");
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
  }

  GetChats.run();
}
