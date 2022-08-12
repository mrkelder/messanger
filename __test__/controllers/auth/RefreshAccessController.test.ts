import { RefreshAccessController } from "src/controllers/auth";
import JWT from "src/utils/JWT";

import {
  AuthControllerTestingUtils,
  StatusObject
} from "./AuthControllerTestingUtils";

const testUtils = new AuthControllerTestingUtils("refresh-access-test");

describe("Refresh access controller", () => {
  beforeAll(async () => {
    await testUtils.deleteUser();
  });

  beforeEach(async () => {
    await testUtils.createUser();
  });

  afterEach(async () => {
    await testUtils.deleteRefreshToken();
    await testUtils.deleteUser();
  });

  test("should successfully update refresh token", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...testUtils.res, status: testUtils.statusSetter(sO) };
    const refreshToken = await testUtils.createRefreshToken(
      await testUtils.retrieveUserId()
    );
    const reqWithToken = { ...testUtils.putReq, cookies: { refreshToken } };

    const controller = new RefreshAccessController({
      req: reqWithToken as any,
      res: testRes
    });

    await controller.run();

    expect(sO.status).toBe(200);
  });

  test("should throw token error because token does not exist in db", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...testUtils.res, status: testUtils.statusSetter(sO) };
    const refreshToken = JWT.createRefreshToken(
      await testUtils.retrieveUserId()
    );
    const reqWithToken = { ...testUtils.putReq, cookies: { refreshToken } };

    const controller = new RefreshAccessController({
      req: reqWithToken as any,
      res: testRes
    });

    await controller.run();

    expect(sO.status).toBe(401);
  });

  test("should throw token error because of an invalid token", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...testUtils.res, status: testUtils.statusSetter(sO) };
    const reqWithToken = {
      ...testUtils.putReq,
      cookies: { refreshToken: "xxx.yyy.zzz" }
    };

    const controller = new RefreshAccessController({
      req: reqWithToken as any,
      res: testRes
    });

    await controller.run();

    expect(sO.status).toBe(500);
  });

  test("should throw http method error", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...testUtils.res, status: testUtils.statusSetter(sO) };
    const testReq = { ...testUtils.putReq, method: "POST" };
    const controller = new RefreshAccessController({
      req: testReq as any,
      res: testRes
    });

    await controller.run();

    expect(sO.status).toBe(405);
  });
});
