import { AuthorizationController } from "src/controllers/auth";
import {
  TestCredentialsUtils,
  TestHttpUtils,
  TestMongodbUtils
} from "src/utils/TestUtils";

const testUtils = new TestCredentialsUtils("authorizatoin-test");
const resultObject = TestHttpUtils.createReultObject();

const ids = { userId: "" };

describe("Authorzation controller", () => {
  const credentials = testUtils.getCredentials();
  const { name, password } = credentials;

  beforeAll(async () => {
    await TestMongodbUtils.deleteUser(name);
  });

  afterEach(async () => {
    await TestMongodbUtils.deleteUser(name);
  });

  describe("With user creation before the tests", () => {
    beforeEach(async () => {
      ids.userId = await TestMongodbUtils.createUser(credentials);
    });

    afterEach(async () => {
      await TestMongodbUtils.deleteRefreshToken(ids.userId);
    });

    test("should authorizate user", async () => {
      const req = TestHttpUtils.createRequest("POST");
      const res = TestHttpUtils.createResponse(resultObject);
      req.body.name = name;
      req.body.password = password;

      const controller = new AuthorizationController({
        req,
        res
      });
      await controller.run();
      expect(resultObject.status).toBe(200);
    });

    test("should throw unprovided name error", async () => {
      const req = TestHttpUtils.createRequest("POST");
      const res = TestHttpUtils.createResponse(resultObject);
      req.body.password = password;

      const controller = new AuthorizationController({
        req,
        res
      });
      await controller.run();

      expect(resultObject.status).toBe(404);
    });

    test("should throw unprovided password error", async () => {
      try {
        const req = TestHttpUtils.createRequest("POST");
        const res = TestHttpUtils.createResponse(resultObject);
        req.body.name = name;

        const controller = new AuthorizationController({
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
  });

  describe("Without user creation before the tests", () => {
    test("should throw endpoint error", async () => {
      const req = TestHttpUtils.createRequest("GET");
      const res = TestHttpUtils.createResponse(resultObject);
      req.body.name = name;
      req.body.password = password;

      const controller = new AuthorizationController({
        req,
        res
      });
      await controller.run();
      expect(resultObject.status).toBe(405);
    });

    test("should throw user doesn't exist error", async () => {
      const randomName = String(Math.random());

      await TestMongodbUtils.deleteUser(randomName);

      const req = TestHttpUtils.createRequest("POST");
      const res = TestHttpUtils.createResponse(resultObject);
      req.body.name = randomName;
      req.body.password = password;

      const controller = new AuthorizationController({
        req,
        res
      });
      await controller.run();

      expect(resultObject.status).toBe(404);
    });
  });
});
