import { AuthorizationController } from "src/controllers/auth";

import {
  AuthControllerTestingUtils,
  StatusObject
} from "./AuthControllerTestingUtils";

const { deleteUser, createUser, res, statusSetter, credentials, postReq } =
  AuthControllerTestingUtils;

describe("Authorzation controller", () => {
  const { name, password } = credentials;

  beforeEach(async () => {
    await deleteUser();
  });

  afterAll(async () => {
    await deleteUser();
  });

  test("should authorizate user", async () => {
    await createUser();
    let sO: StatusObject = { status: 200 };
    const testRes = { ...res, status: statusSetter(sO) };

    const controller = new AuthorizationController({
      req: postReq,
      res: testRes
    });
    await controller.run();
    expect(sO.status).toBe(200);
  });

  test("should throw endpoint error", async () => {
    let sO: StatusObject = { status: 200 };
    const testReq = { ...postReq, method: "GET" };
    const testRes = { ...res, status: statusSetter(sO) };

    const controller = new AuthorizationController({
      req: testReq,
      res: testRes
    });
    await controller.run();
    expect(sO.status).toBe(405);
  });

  test("should throw user doesn't exist error", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...res, status: statusSetter(sO) };
    const testReq = {
      ...postReq,
      body: { name: String(Math.random()), password }
    };

    const controller = new AuthorizationController({
      req: testReq,
      res: testRes
    });
    await controller.run();

    expect(sO.status).toBe(404);
  });

  test("should throw unprovided name error", async () => {
    await createUser();
    let sO: StatusObject = { status: 200 };
    const testRes = { ...res, status: statusSetter(sO) };
    const testReq = { ...postReq, body: { password } };

    const controller = new AuthorizationController({
      req: testReq,
      res: testRes
    });
    await controller.run();

    expect(sO.status).toBe(404);
  });

  test("should throw unprovided password error", async () => {
    await createUser();
    let sO: StatusObject = { status: 200 };
    const testRes = { ...res, status: statusSetter(sO) };
    const testReq = { ...postReq, body: { name } };

    const controller = new AuthorizationController({
      req: testReq,
      res: testRes
    });
    await controller.run();

    expect(sO.status).toBe(500);
  });
});
