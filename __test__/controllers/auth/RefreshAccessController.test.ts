import { RefreshAccessController } from "src/controllers/auth";
import JWT from "src/utils/JWT";
import {
  TestCredentialsUtils,
  TestHttpUtils,
  TestMongodbUtils
} from "src/utils/TestUtils";

const testUser = new TestCredentialsUtils("authorizatoin-test");
const resultObject = TestHttpUtils.createReultObject();

const ids = {
  userId: ""
};

describe("Refresh access controller", () => {
  const credentials = testUser.getCredentials();

  beforeAll(async () => {
    await TestMongodbUtils.deleteUser(credentials.name);
  });

  beforeEach(async () => {
    ids.userId = await TestMongodbUtils.createUser(credentials);
  });

  afterEach(async () => {
    await TestMongodbUtils.deleteRefreshToken(ids.userId);
    await TestMongodbUtils.deleteUser(credentials.name);
  });

  test("should successfully update refresh token", async () => {
    const { userId } = ids;
    const refreshToken = await TestMongodbUtils.createRefreshToken(userId);
    const res = TestHttpUtils.createResponse(resultObject);
    const req = TestHttpUtils.createRequest("PUT");
    req.cookies.refreshToken = refreshToken;

    const controller = new RefreshAccessController({
      req,
      res
    });

    await controller.run();

    expect(resultObject.status).toBe(200);
  });

  test("should throw token error because token does not exist in db", async () => {
    const { userId } = ids;
    const refreshToken = JWT.createRefreshToken(userId);
    const res = TestHttpUtils.createResponse(resultObject);
    const req = TestHttpUtils.createRequest("PUT");
    req.cookies.refreshToken = refreshToken;

    const controller = new RefreshAccessController({
      req,
      res
    });

    await controller.run();

    expect(resultObject.status).toBe(401);
  });

  test("should throw token error because of an invalid token", async () => {
    const res = TestHttpUtils.createResponse(resultObject);
    const req = TestHttpUtils.createRequest("PUT");
    req.cookies.refreshToken = "xxx.yyy.zzz";

    const controller = new RefreshAccessController({
      req,
      res
    });

    await controller.run();
    expect(resultObject.status).toBe(401);
  });

  test("should throw http method error", async () => {
    const { userId } = ids;
    const refreshToken = await TestMongodbUtils.createRefreshToken(userId);
    const res = TestHttpUtils.createResponse(resultObject);
    const req = TestHttpUtils.createRequest("POST");
    req.cookies.refreshToken = refreshToken;

    const controller = new RefreshAccessController({
      req,
      res
    });

    await controller.run();

    expect(resultObject.status).toBe(405);
  });
});
