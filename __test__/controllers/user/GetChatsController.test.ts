import mongoose from "mongoose";

import { GetChatsController } from "src/controllers/user";
import Chat from "src/models/Chat";
import User, { UserDocument } from "src/models/User";
import { DatabaseChat } from "src/types/db";
import JWT from "src/utils/JWT";

import {
  AuthControllerTestingUtils,
  StatusObject
} from "../auth/AuthControllerTestingUtils";

async function execMongodbOperation<T>(func: () => Promise<T>): Promise<T> {
  await mongoose.connect(process.env.MONGODB_HOST as string);
  const result = await func();
  await mongoose.disconnect();
  return result;
}

async function createChat(userId: string) {
  return execMongodbOperation(async () => {
    const newChat = new Chat({ members: new mongoose.Types.ObjectId(userId) });
    await newChat.save();
  });
}

async function deleteChat(userId: string) {
  return execMongodbOperation(async () => {
    await Chat.deleteOne({
      members: { $in: [new mongoose.Types.ObjectId(userId)] }
    });
  });
}

async function getChat(userId: string): Promise<DatabaseChat> {
  return execMongodbOperation<DatabaseChat>(async () => {
    const chats = await Chat.find({
      members: {
        $in: [new mongoose.Types.ObjectId(userId)]
      }
    });

    return chats[0];
  });
}

async function getUserId(userName: string): Promise<string> {
  return execMongodbOperation<string>(async () => {
    const user = (await User.findByName(userName)) as UserDocument;
    return user.id;
  });
}

const testUser = new AuthControllerTestingUtils("get-chats-controller-user");

describe("Chat list", () => {
  beforeAll(async () => {
    await testUser.createUser();
    await createChat(await getUserId(testUser.credentials.name));
  });

  afterAll(async () => {
    await deleteChat(await getUserId(testUser.credentials.name));
    await testUser.deleteUser();
  });

  test("Should successfully fetch chats", async () => {
    const userId = await getUserId(testUser.credentials.name);
    let sO: StatusObject = { status: 200 };
    const testRes = { ...testUser.res, status: testUser.statusSetter(sO) };
    const testReq = {
      ...testUser.getReq,
      cookies: { accessToken: JWT.createAccessToken(userId) }
    };
    const controller = new GetChatsController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    const chat = await getChat(userId);
    expect(sO.status).toBe(200);
    expect(chat).toBeDefined();
  });

  test("Should throw an error because accessToken is not passed", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...testUser.res, status: testUser.statusSetter(sO) };
    const testReq = {
      ...testUser.getReq,
      cookies: {}
    };
    const controller = new GetChatsController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.status).toBe(403);
  });

  test("Should throw an error because accessToken is invalid", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...testUser.res, status: testUser.statusSetter(sO) };
    const testReq = {
      ...testUser.getReq,
      cookies: { accessToken: "xxxxxxx.xxxxxxxxxxx.xxxxxxxxxxxx" }
    };
    const controller = new GetChatsController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.status).toBe(403);
  });

  test("Should throw an error because of invalid http method", async () => {
    const userId = await getUserId(testUser.credentials.name);
    let sO: StatusObject = { status: 200 };
    const testRes = { ...testUser.res, status: testUser.statusSetter(sO) };
    const testReq = {
      ...testUser.postReq,
      cookies: { accessToken: JWT.createAccessToken(userId) }
    };
    const controller = new GetChatsController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.status).toBe(405);
  });
});
