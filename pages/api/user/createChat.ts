import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

import Chat from "src/models/Chat";
import JWT from "src/utils/JWT";
import RequestHelper from "src/utils/RequestHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  class CreateChat {
    private static requestHelper = new RequestHelper(req);
    private static body = CreateChat.requestHelper.getBody();
    private static accessToken = req.cookies.accessToken;

    public static async run(): Promise<void> {
      await CreateChat.checkPostMethod();
    }

    private static async checkPostMethod(): Promise<void> {
      if (CreateChat.requestHelper.isPOST()) await CreateChat.checkPeerId();
      else CreateChat.throwMethodError();
    }

    private static async checkPeerId(): Promise<void> {
      if (
        typeof CreateChat.body.peerId === "string" &&
        CreateChat.body.peerId.length > 0
      )
        await CreateChat.checkAccessToken();
      else CreateChat.throwInvalidPeerIdError();
    }

    private static async checkAccessToken(): Promise<void> {
      if (CreateChat.accessToken) await CreateChat.verifyToken();
      else CreateChat.throwUnspecifiedTokenError();
    }

    private static async verifyToken(): Promise<void> {
      try {
        const tokenData = JWT.verifyAccessToken(CreateChat.accessToken);
        await CreateChat.sendSuccessfulResponse(tokenData._id);
      } catch {
        CreateChat.throwExpiredTokenError();
      }
    }

    private static async sendSuccessfulResponse(userId: string): Promise<void> {
      try {
        await mongoose.connect(process.env.MONGODB_HOST as string);

        res.json({
          chatId: await CreateChat.createChatInDB(
            new mongoose.Types.ObjectId(userId)
          )
        });
      } catch (e) {
        CreateChat.throwDatabaseError();
      } finally {
        if (mongoose.connection.readyState === 1) await mongoose.disconnect();
      }
    }

    private static async createChatInDB(
      userId: mongoose.Types.ObjectId
    ): Promise<string> {
      const userIdObject = new mongoose.Types.ObjectId(userId);
      const peerIdObject = new mongoose.Types.ObjectId(
        CreateChat.body.peerId as string
      );

      const members = [userIdObject, peerIdObject];

      const results = await Chat.find({
        members: { $all: members }
      });

      if (results.length === 0) {
        const newChat = new Chat({ members: members });
        await newChat.save();
        return newChat._id as string;
      } else return results[0]._id as string;
    }

    private static throwMethodError() {
      res.status(405).send("This endpoint only accepts GET method");
    }

    private static throwInvalidPeerIdError() {
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
  }

  await CreateChat.run();
}
