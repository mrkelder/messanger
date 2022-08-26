import { GetChatsController } from "src/controllers/user";
import {
  TestCredentialsUtils,
  TestHttpUtils,
  TestMongodbUtils
} from "src/utils/TestUtils";

const testUser = new TestCredentialsUtils("get-chats-controller-user");
const resultObject = TestHttpUtils.createReultObject();

const ids = {
  userId: ""
};

describe("Chat list", () => {
  beforeAll(async () => {
    ids.userId = await TestMongodbUtils.createUser(testUser.getCredentials());
    await TestMongodbUtils.createChat(ids.userId);
  });

  afterAll(async () => {
    await TestMongodbUtils.deleteChat(ids.userId);
    await TestMongodbUtils.deleteUser(testUser.getCredentials().name);
  });

  test("Should successfully fetch chats", async () => {
    const { userId } = ids;
    const req = TestHttpUtils.createRequest("GET", userId);
    const res = TestHttpUtils.createResponse(resultObject);

    const controller = new GetChatsController({
      req,
      res
    });

    await controller.run();
    const chat = await TestMongodbUtils.getChat(userId);
    expect(resultObject.status).toBe(200);
    expect(chat).toBeDefined();
  });

  test("Should throw an error because accessToken is not passed", async () => {
    const req = TestHttpUtils.createRequest("GET");
    const res = TestHttpUtils.createResponse(resultObject);

    const controller = new GetChatsController({
      req,
      res
    });

    await controller.run();
    expect(resultObject.status).toBe(403);
  });

  test("Should throw an error because accessToken is invalid", async () => {
    const req = TestHttpUtils.createRequest("GET");
    const res = TestHttpUtils.createResponse(resultObject);
    req.cookies.accessToken = "xxxxxxx.xxxxxxxxxxx.xxxxxxxxxxxx";

    const controller = new GetChatsController({
      req,
      res
    });

    await controller.run();
    expect(resultObject.status).toBe(403);
  });

  test("Should throw an error because of invalid http method", async () => {
    const { userId } = ids;
    const req = TestHttpUtils.createRequest("POST", userId);
    const res = TestHttpUtils.createResponse(resultObject);

    const controller = new GetChatsController({
      req,
      res
    });

    await controller.run();
    expect(resultObject.status).toBe(405);
  });
});
