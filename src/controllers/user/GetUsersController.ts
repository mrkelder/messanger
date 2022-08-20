import mongoose from "mongoose";

import User from "src/models/User";
import { DatabaseUser } from "src/types/db";

import { AuthControllerInput, UserController } from "./UserController";

type UserWithoutPassword = Omit<DatabaseUser, "password">;

export class GetUsersController extends UserController {
  constructor(conf: AuthControllerInput) {
    super(conf);
  }

  public async run() {
    const bindedExec = this.exec.bind(this);
    await this.setUp(bindedExec);
  }

  protected async exec(userId: string): Promise<void> {
    const { userName } = this.req.query;
    this.checkHttpMethod("GET");
    const users = await this.getUsers(userId, userName as string);
    this.sendResponse(users);
  }

  private async getUsers(
    userId: string,
    userName: string
  ): Promise<UserWithoutPassword[]> {
    const data = await User.find(
      {
        _id: { $ne: new mongoose.Types.ObjectId(userId) },
        name: { $regex: userName }
      },
      { password: 0, __v: 0 }
    );

    return data;
  }

  protected sendResponse(users: UserWithoutPassword[]): void {
    if (users.length > 0) this.res.json(users);
    else this.throwUserNotFound();
  }
}
