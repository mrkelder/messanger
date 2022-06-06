import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

import Chat from "src/models/Chat";
import Message from "src/models/Message";
import User from "src/models/User";
import { Chat as ClientChat } from "src/types/chat";
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
      } catch (e) {
        console.error(e);
        GetChats.throwDatabaseError();
      } finally {
        if (mongoose.connection.readyState === 1) await mongoose.disconnect();
      }
    }

    private static async retrieveChats(
      idString: string
    ): Promise<ClientChat[]> {
      const _id = new mongoose.Types.ObjectId(idString);
      return await GetChats.performDatabaseQuery(_id);
    }

    private static async performDatabaseQuery(
      _id: mongoose.Types.ObjectId
    ): Promise<ClientChat[]> {
      const data = await Chat.aggregate([
        { $match: { members: { $in: [_id] } } },
        {
          $lookup: {
            from: "messages",
            localField: "_id",
            foreignField: "chatId",
            pipeline: [
              {
                $match: {
                  read: false,
                  author: { $ne: _id }
                }
              },
              { $sort: { updated_at: -1 } }
            ],
            as: "messages"
          }
        },
        {
          $lookup: {
            from: "users",
            let: { members: "$members" },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$members"] } } },
              { $project: { password: 0, __v: 0 } }
            ],
            as: "members"
          }
        },
        {
          $addFields: {
            countOfUnreadMessages: { $size: "$messages" }
          }
        },
        {
          $addFields: { lastMessage: { $arrayElemAt: ["$messages", 0] } }
        },
        { $unset: ["messages"] }
      ]);

      return data as ClientChat[];
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

  await GetChats.run();
}
