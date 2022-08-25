import mongoose from "mongoose";

import Chat from "src/models/Chat";
import User from "src/models/User";

import { AuthControllerInput, UserController } from "./UserController";

export class CreateChatController extends UserController {
  constructor(conf: AuthControllerInput) {
    super(conf);
  }

  public async run() {
    const bindedExec = this.exec.bind(this);
    await this.setUp(bindedExec);
  }

  protected async exec(userId: string): Promise<void> {
    const peerId = this.requestHelper.getBody().peerId as string;
    this.checkHttpMethod("POST");
    await this.checkUser(userId);
    await this.checkPeerId(userId, peerId);
    const chatId = await this.createChat(userId, peerId);
    this.sendResponse(chatId);
  }

  private async checkUser(userId: string): Promise<Error | void> {
    const user = await User.findById(userId);
    if (!user) this.throwUserNotFound();
  }

  private async checkPeerId(
    userId: string,
    peerId: string
  ): Promise<Error | void> {
    const peerUser = await User.findById(peerId);
    if (!peerUser || userId === peerId) this.throwInvalidPeerId();
  }

  private async createChat(userId: string, peerId: string): Promise<string> {
    const userIdObject = new mongoose.Types.ObjectId(userId);
    const peerIdObject = new mongoose.Types.ObjectId(peerId);

    const members = [userIdObject, peerIdObject];

    const results = await Chat.find({
      members: { $all: members }
    });

    if (results.length === 0) {
      const newChat = new Chat({ members: members });
      await newChat.save();
      return newChat.id;
    } else return results[0].id;
  }

  protected sendResponse(chatId: string): void {
    this.res.json({
      chatId
    });
  }
}
