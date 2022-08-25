import { RegistrationController } from "src/controllers/auth";
import { UserDocument } from "src/models/User";
import {
  TestCredentialsUtils,
  TestHttpUtils,
  TestMongodbUtils
} from "src/utils/TestUtils";

const testUser = new TestCredentialsUtils("registration-test");
const resultObject = TestHttpUtils.createReultObject();

describe("Registration controller", () => {
  const credentials = testUser.getCredentials();
  const { name, password } = credentials;

  beforeEach(async () => {
    await TestMongodbUtils.deleteUser(name);
  });

  afterAll(async () => {
    await TestMongodbUtils.deleteUser(name);
  });

  test("should successfully registrate a user", async () => {
    const testReq = TestHttpUtils.createRequest("POST");
    const testRes = TestHttpUtils.createResponse(resultObject);
    testReq.body.name = name;
    testReq.body.password = password;

    const controller = new RegistrationController({
      req: testReq,
      res: testRes
    });
    await controller.run();

    const registratedUser = (await TestMongodbUtils.getUser(
      name
    )) as UserDocument;

    expect(resultObject.status).toBe(200);
    expect(registratedUser.name).toBe(name);

    const user = (await TestMongodbUtils.getUser(name)) as UserDocument;
    await TestMongodbUtils.deleteRefreshToken(user.id);
  });

  test("should throw http method error", async () => {
    const testReq = TestHttpUtils.createRequest("GET");
    const testRes = TestHttpUtils.createResponse(resultObject);
    testReq.body.name = name;
    testReq.body.password = password;

    const controller = new RegistrationController({
      req: testReq,
      res: testRes
    });
    await controller.run();

    expect(resultObject.status).toBe(405);
  });

  test("should throw unprovided name error", async () => {
    try {
      const testReq = TestHttpUtils.createRequest("POST");
      const testRes = TestHttpUtils.createResponse(resultObject);
      testReq.body.password = password;

      const controller = new RegistrationController({
        req: testReq,
        res: testRes
      });
      await controller.run();
    } catch {
      expect(resultObject.status).toBe(500);
    } finally {
      expect(resultObject.status).toBe(500);
    }
  });

  test("should throw unprovided password error", async () => {
    try {
      const testReq = TestHttpUtils.createRequest("POST");
      const testRes = TestHttpUtils.createResponse(resultObject);
      testReq.body.name = name;

      const controller = new RegistrationController({
        req: testReq,
        res: testRes
      });
      await controller.run();
    } catch {
      expect(resultObject.status).toBe(500);
    } finally {
      expect(resultObject.status).toBe(500);
    }
  });

  test("should throw user already exists error", async () => {
    await TestMongodbUtils.createUser(credentials);
    const testReq = TestHttpUtils.createRequest("POST");
    const testRes = TestHttpUtils.createResponse(resultObject);
    testReq.body.name = name;
    testReq.body.password = password;

    const controller = new RegistrationController({
      req: testReq,
      res: testRes
    });
    await controller.run();

    expect(resultObject.status).toBe(409);
  });
});
