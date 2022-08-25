import { RegistrationController } from "src/controllers/auth";
import { UserDocument } from "src/models/User";

import {
  AuthControllerTestingUtils,
  StatusObject
} from "./AuthControllerTestingUtils";

const testUtils = new AuthControllerTestingUtils("registration-test");

describe("Registration controller", () => {
  const { name, password } = testUtils.credentials;

  beforeEach(async () => {
    await testUtils.deleteUser();
  });

  afterAll(async () => {
    await testUtils.deleteUser();
  });

  test("should successfully registrate a user", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...testUtils.res, status: testUtils.statusSetter(sO) };
    const controller = new RegistrationController({
      req: testUtils.postReq as any,
      res: testRes
    });
    await controller.run();

    const registratedUser = (await testUtils.findUser()) as UserDocument;

    expect(sO.status).toBe(200);
    expect(registratedUser.name).toBe(name);
  });

  test("should throw endpoint error", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...testUtils.res, status: testUtils.statusSetter(sO) };
    const testReq = { ...testUtils.postReq, method: "GET" };
    const controller = new RegistrationController({
      req: testReq as any,
      res: testRes
    });
    await controller.run();

    expect(sO.status).toBe(405);
  });

  test("should throw unprovided name error", async () => {
    let sO: StatusObject = { status: 200 };
    try {
      const testReq = { ...testUtils.postReq, body: { password } };
      const testRes = {
        ...testUtils.res,
        status: testUtils.statusSetter(sO)
      };
      const controller = new RegistrationController({
        req: testReq as any,
        res: testRes
      });
      await controller.run();
    } catch {
      expect(sO.status).toBe(500);
    } finally {
      expect(sO.status).toBe(500);
    }
  });

  test("should throw unprovided password error", async () => {
    let sO: StatusObject = { status: 200 };
    try {
      const testReq = { ...testUtils.postReq, body: { name } };
      const testRes = {
        ...testUtils.res,
        status: testUtils.statusSetter(sO)
      };
      const controller = new RegistrationController({
        req: testReq as any,
        res: testRes
      });
      await controller.run();
    } catch {
      expect(sO.status).toBe(500);
    } finally {
      expect(sO.status).toBe(500);
    }
  });

  test("should throw user already exists error", async () => {
    await testUtils.createUser();
    let sO: StatusObject = { status: 200 };
    const testRes = {
      ...testUtils.res,
      status: testUtils.statusSetter(sO)
    };
    const controller = new RegistrationController({
      req: testUtils.postReq as any,
      res: testRes
    });
    await controller.run();

    expect(sO.status).toBe(409);
  });
});
