import mongoose from "mongoose";

import Chat from "src/models/Chat";
import { Chat as ChatType } from "src/types/chat";

import { AuthControllerInput, UserController } from "./UserController";

export class GetChatsController extends UserController {
  constructor(conf: AuthControllerInput) {
    super(conf);
  }

  public async run() {
    const bindedExec = this.exec.bind(this);
    await this.setUp(bindedExec);
  }

  protected async exec(userId: string): Promise<void> {
    this.checkHttpMethod("GET");
    const chats = await this.getChats(userId);
    this.sendSuccessResponse(chats);
  }

  private async getChats(userId: string): Promise<ChatType[]> {
    const _id = new mongoose.Types.ObjectId(userId);
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
      { $unset: ["messages"] },
      { $sort: { updated_at: -1 } }
    ]);

    return data;
  }

  protected sendSuccessResponse(chats: ChatType[]): void {
    this.res.json(chats);
  }
}
