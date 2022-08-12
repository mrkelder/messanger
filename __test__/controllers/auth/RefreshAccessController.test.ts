import { RefreshAccessController } from "src/controllers/auth";
import JWT from "src/utils/JWT";

import {
  AuthControllerTestingUtils,
  StatusObject
} from "./AuthControllerTestingUtils";

const {
  deleteUser,
  createUser,
  deleteRefreshToken,
  res,
  putReq,
  statusSetter,
  createRefreshToken,
  retrieveUserId
} = AuthControllerTestingUtils;

describe("Refresh access controller", () => {
  beforeAll(async () => {
    await deleteUser();
  });

  beforeEach(async () => {
    await createUser();
  });

  afterEach(async () => {
    await deleteRefreshToken();
    await deleteUser();
  });

  test("should successfully update refresh token", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...res, status: statusSetter(sO) };
    const refreshToken = await createRefreshToken(await retrieveUserId());
    const reqWithToken = { ...putReq, cookies: { refreshToken } };

    const controller = new RefreshAccessController({
      req: reqWithToken,
      res: testRes
    });

    await controller.run();

    expect(sO.status).toBe(200);
  });

  test("should throw token error because token does not exist in db", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...res, status: statusSetter(sO) };
    const refreshToken = JWT.createRefreshToken(await retrieveUserId());
    const reqWithToken = { ...putReq, cookies: { refreshToken } };

    const controller = new RefreshAccessController({
      req: reqWithToken,
      res: testRes
    });

    await controller.run();

    expect(sO.status).toBe(401);
  });

  test("should throw token error because of an invalid token", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...res, status: statusSetter(sO) };
    const reqWithToken = {
      ...putReq,
      cookies: { refreshToken: "xxx.yyy.zzz" }
    };

    const controller = new RefreshAccessController({
      req: reqWithToken,
      res: testRes
    });

    await controller.run();

    expect(sO.status).toBe(500);
  });

  test("should throw http method error", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...res, status: statusSetter(sO) };
    const testReq = { ...putReq, method: "POST" };
    const controller = new RefreshAccessController({
      req: testReq,
      res: testRes
    });

    await controller.run();

    expect(sO.status).toBe(405);
  });
});
