import mongoose from "mongoose";

import { CreateChatController } from "src/controllers/user";
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

async function getUserId(userName: string): Promise<string> {
  return execMongodbOperation<string>(async () => {
    const user = (await User.findByName(userName)) as UserDocument;
    return user.id;
  });
}

async function getChat(userId: string, peerId: string): Promise<DatabaseChat> {
  return execMongodbOperation<DatabaseChat>(async () => {
    const chats = await Chat.find({
      members: {
        $in: [
          new mongoose.Types.ObjectId(userId),
          new mongoose.Types.ObjectId(peerId)
        ]
      }
    });

    return chats[0];
  });
}

const testUser = new AuthControllerTestingUtils("create-chat-controller-user");
const testPeer = new AuthControllerTestingUtils("create-chat-controller-peer");

describe("Create chat controller", () => {
  beforeEach(async () => {
    await testUser.createUser();
    await testPeer.createUser();
  });

  afterEach(async () => {
    await testUser.deleteUser();
    await testPeer.deleteUser();
  });

  test("Should successfully create a chat", async () => {
    let sO: StatusObject = { status: 200 };
    const userId = await getUserId(testUser.credentials.name);
    const peerId = await getUserId(testPeer.credentials.name);

    const testRes = { ...testUser.res, status: testUser.statusSetter(sO) };
    const testReq = {
      ...testPeer.postReq,
      cookies: { accessToken: JWT.createAccessToken(userId) },
      body: { peerId }
    };
    const controller = new CreateChatController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();

    expect(await getChat(userId, peerId)).toBeDefined();
    expect(sO.status).toBe(200);
  });

  test("Should throw an error because user does not exist", async () => {
    let sO: StatusObject = { status: 200 };
    const userId = await getUserId(testUser.credentials.name);
    const peerId = await getUserId(testPeer.credentials.name);

    const testRes = { ...testUser.res, status: testUser.statusSetter(sO) };
    const testReq = {
      ...testPeer.postReq,
      cookies: {
        accessToken: JWT.createAccessToken(userId.replace(/./g, "c"))
      },
      body: { peerId }
    };
    const controller = new CreateChatController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.status).toBe(404);
  });

  test("Should throw an user not found because of an invalid accessToken", async () => {
    let sO: StatusObject = { status: 200 };
    const peerId = await getUserId(testPeer.credentials.name);

    const testRes = { ...testUser.res, status: testUser.statusSetter(sO) };
    const testReq = {
      ...testPeer.postReq,
      cookies: {
        accessToken: "xxxxxxxxxxxx.xxxxxx"
      },
      body: { peerId }
    };
    const controller = new CreateChatController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.status).toBe(404);
  });

  test("Should throw an error because the user and peer ids are equal", async () => {
    let sO: StatusObject = { status: 200 };
    const userId = await getUserId(testUser.credentials.name);

    const testRes = { ...testUser.res, status: testUser.statusSetter(sO) };
    const testReq = {
      ...testPeer.postReq,
      cookies: { accessToken: JWT.createAccessToken(userId) },
      body: { peerId: userId }
    };
    const controller = new CreateChatController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();

    expect(sO.status).toBe(400);
  });

  test("Should throw an error because of an unspecified accessToken", async () => {
    let sO: StatusObject = { status: 200 };
    const peerId = await getUserId(testPeer.credentials.name);

    const testRes = { ...testUser.res, status: testUser.statusSetter(sO) };
    const testReq = {
      ...testPeer.postReq,
      cookies: {},
      body: { peerId }
    };
    const controller = new CreateChatController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.status).toBe(403);
  });

  test("Should throw an error because of an unspecified peer", async () => {
    let sO: StatusObject = { status: 200 };
    const userId = await getUserId(testUser.credentials.name);

    const testRes = { ...testUser.res, status: testUser.statusSetter(sO) };
    const testReq = {
      ...testPeer.postReq,
      cookies: {
        accessToken: JWT.createAccessToken(userId)
      }
    };
    const controller = new CreateChatController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.status).toBe(400);
  });

  test("Should throw an error because of multiple peer ids", async () => {
    let sO: StatusObject = { status: 200 };
    const userId = await getUserId(testUser.credentials.name);
    const peerId = await getUserId(testPeer.credentials.name);

    const testRes = { ...testUser.res, status: testUser.statusSetter(sO) };
    const testReq = {
      ...testPeer.postReq,
      cookies: {
        accessToken: JWT.createAccessToken(userId)
      },
      body: { peerId: [peerId, peerId] }
    };
    const controller = new CreateChatController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.status).toBe(500);
  });

  test("Should throw an error because of an invalid http method", async () => {
    let sO: StatusObject = { status: 200 };

    const testRes = { ...testUser.res, status: testUser.statusSetter(sO) };
    const testReq = {
      ...testPeer.postReq,
      method: "DELETE",
      cookies: {
        accessToken: "x.x.x"
      },
      body: {}
    };
    const controller = new CreateChatController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.status).toBe(405);
  });
});
