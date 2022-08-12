import { AuthorizationController } from "src/controllers/auth";

import {
  AuthControllerTestingUtils,
  StatusObject
} from "./AuthControllerTestingUtils";

const testUtils = new AuthControllerTestingUtils("authorizatoin-test");

describe("Authorzation controller", () => {
  const { name, password } = testUtils.credentials;

  beforeEach(async () => {
    await testUtils.deleteUser();
  });

  afterAll(async () => {
    await testUtils.deleteUser();
  });

  test("should authorizate user", async () => {
    await testUtils.createUser();
    let sO: StatusObject = { status: 200 };
    const testRes = { ...testUtils.res, status: testUtils.statusSetter(sO) };

    const controller = new AuthorizationController({
      req: testUtils.postReq as any,
      res: testRes
    });
    await controller.run();
    expect(sO.status).toBe(200);
  });

  test("should throw endpoint error", async () => {
    let sO: StatusObject = { status: 200 };
    const testReq = { ...testUtils.postReq, method: "GET" };
    const testRes = { ...testUtils.res, status: testUtils.statusSetter(sO) };

    const controller = new AuthorizationController({
      req: testReq as any,
      res: testRes
    });
    await controller.run();
    expect(sO.status).toBe(405);
  });

  test("should throw user doesn't exist error", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...testUtils.res, status: testUtils.statusSetter(sO) };
    const testReq = {
      ...testUtils.postReq,
      body: { name: String(Math.random()), password }
    };

    const controller = new AuthorizationController({
      req: testReq as any,
      res: testRes
    });
    await controller.run();

    expect(sO.status).toBe(404);
  });

  test("should throw unprovided name error", async () => {
    await testUtils.createUser();
    let sO: StatusObject = { status: 200 };
    const testRes = { ...testUtils.res, status: testUtils.statusSetter(sO) };
    const testReq = { ...testUtils.postReq, body: { password } };

    const controller = new AuthorizationController({
      req: testReq as any,
      res: testRes
    });
    await controller.run();

    expect(sO.status).toBe(404);
  });

  test("should throw unprovided password error", async () => {
    await testUtils.createUser();
    let sO: StatusObject = { status: 200 };
    const testRes = { ...testUtils.res, status: testUtils.statusSetter(sO) };
    const testReq = { ...testUtils.postReq, body: { name } };

    const controller = new AuthorizationController({
      req: testReq as any,
      res: testRes
    });
    await controller.run();

    expect(sO.status).toBe(500);
  });
});
