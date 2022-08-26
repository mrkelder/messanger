import { CreateChatController } from "src/controllers/user";
import {
  TestCredentialsUtils,
  TestHttpUtils,
  TestMongodbUtils
} from "src/utils/TestUtils";

const testUser = new TestCredentialsUtils("create-chat-controller-user");
const testPeer = new TestCredentialsUtils("create-chat-controller-peer");
const resultObject = TestHttpUtils.createReultObject();

const ids = {
  userId: "",
  peerId: ""
};

describe("Create chat controller", () => {
  beforeEach(async () => {
    ids.userId = await TestMongodbUtils.createUser(testUser.getCredentials());
    ids.peerId = await TestMongodbUtils.createUser(testPeer.getCredentials());
  });

  afterEach(async () => {
    await TestMongodbUtils.deleteUser(testUser.getCredentials().name);
    await TestMongodbUtils.deleteUser(testPeer.getCredentials().name);
  });

  test("Should successfully create a chat", async () => {
    const { userId, peerId } = ids;
    const req = TestHttpUtils.createRequest("POST", userId);
    const res = TestHttpUtils.createResponse(resultObject);
    req.body.peerId = peerId;

    const controller = new CreateChatController({
      req,
      res
    });

    await controller.run();

    expect(await TestMongodbUtils.getChat(userId, peerId)).toBeDefined();
    expect(resultObject.status).toBe(200);
    await TestMongodbUtils.deleteChat(userId);
  });

  test("Should throw an error because user does not exist", async () => {
    const { userId, peerId } = ids;
    const req = TestHttpUtils.createRequest("POST", userId.replace(/./g, "c"));
    const res = TestHttpUtils.createResponse(resultObject);
    req.body.peerId = peerId;

    const controller = new CreateChatController({
      req,
      res
    });

    await controller.run();
    expect(resultObject.status).toBe(404);
  });

  test("Should throw an error because of an invalid accessToken", async () => {
    const { peerId } = ids;
    const req = TestHttpUtils.createRequest("POST");
    const res = TestHttpUtils.createResponse(resultObject);
    req.body.peerId = peerId;
    req.cookies.accessToken = "xxxxxxxxxxxx.xxxxxx";

    const controller = new CreateChatController({
      req,
      res
    });

    await controller.run();
    expect(resultObject.status).toBe(403);
  });

  test("Should throw an error because the user and peer ids are equal", async () => {
    const { userId } = ids;
    const req = TestHttpUtils.createRequest("POST", userId);
    const res = TestHttpUtils.createResponse(resultObject);
    req.body.peerId = userId;

    const controller = new CreateChatController({
      req,
      res
    });

    await controller.run();

    expect(resultObject.status).toBe(400);
  });

  test("Should throw an error because of an unspecified accessToken", async () => {
    const { peerId } = ids;
    const req = TestHttpUtils.createRequest("POST");
    const res = TestHttpUtils.createResponse(resultObject);
    req.body.peerId = peerId;

    const controller = new CreateChatController({
      req,
      res
    });

    await controller.run();
    expect(resultObject.status).toBe(403);
  });

  test("Should throw an error because of an unspecified peer", async () => {
    const { userId } = ids;
    const req = TestHttpUtils.createRequest("POST", userId);
    const res = TestHttpUtils.createResponse(resultObject);

    const controller = new CreateChatController({
      req,
      res
    });

    await controller.run();
    expect(resultObject.status).toBe(400);
  });

  test("Should throw an error because of multiple peer ids", async () => {
    try {
      const { userId, peerId } = ids;
      const req = TestHttpUtils.createRequest("POST", userId);
      const res = TestHttpUtils.createResponse(resultObject);
      req.body.peerId = [peerId, peerId] as any;

      const controller = new CreateChatController({
        req,
        res
      });

      await controller.run();
    } catch {
      expect(resultObject.status).toBe(500);
    } finally {
      expect(resultObject.status).toBe(500);
    }
  });

  test("Should throw an error because of an invalid http method", async () => {
    const { userId, peerId } = ids;
    const req = TestHttpUtils.createRequest("POST", userId);
    const res = TestHttpUtils.createResponse(resultObject);
    req.method = "DELETE";
    req.body.peerId = peerId;

    const controller = new CreateChatController({
      req,
      res
    });

    await controller.run();
    expect(resultObject.status).toBe(405);
  });
});
