import mongoose from "mongoose";

import { GetUsersController } from "src/controllers/user";
import User, { UserDocument } from "src/models/User";
import JWT from "src/utils/JWT";

import {
  AuthControllerTestingUtils,
  StatusObject
} from "../auth/AuthControllerTestingUtils";

async function execMongodbOperation<T>(func: () => Promise<T>): Promise<T> {
  await mongoose.connect(process.env.MONGODB_HOST as string);
  const result = await func();
  await mongoose.disconnect();
  return result;
}

async function getUserId(userName: string): Promise<string> {
  return execMongodbOperation<string>(async () => {
    const user = (await User.findByName(userName)) as UserDocument;
    return user.id;
  });
}

describe("Get users successful responses", () => {
  const testUser = new AuthControllerTestingUtils("get-users-controller-user");
  const testPeer = new AuthControllerTestingUtils("get-users-controller-peer");

  beforeEach(async () => {
    await testUser.createUser();
    await testPeer.createUser();
  });

  afterEach(async () => {
    await testUser.deleteUser();
    await testPeer.deleteUser();
  });

  test("Should return the user", async () => {
    let sO: StatusObject = { status: 200, data: [] };
    const userId = await getUserId(testUser.credentials.name);
    const testRes = {
      ...testUser.res,
      status: testUser.statusSetter(sO),
      json: testUser.resultDataSetter(sO)
    };
    const testReq = {
      ...testPeer.getReq,
      query: { userName: testPeer.credentials.name },
      cookies: { accessToken: JWT.createAccessToken(userId) }
    };
    const controller = new GetUsersController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.data).toHaveLength(1);
  });

  test("Should return the user despite the incompleteness of the name", async () => {
    let sO: StatusObject = { status: 200, data: [] };
    const userId = await getUserId(testUser.credentials.name);
    const testRes = {
      ...testUser.res,
      status: testUser.statusSetter(sO),
      json: testUser.resultDataSetter(sO)
    };
    const testReq = {
      ...testPeer.getReq,
      query: { userName: testPeer.credentials.name.substring(5) },
      cookies: { accessToken: JWT.createAccessToken(userId) }
    };
    const controller = new GetUsersController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.data).toHaveLength(1);
  });

  test("Should return the user despite the casing", async () => {
    let sO: StatusObject = { status: 200, data: [] };
    const userId = await getUserId(testUser.credentials.name);
    const testRes = {
      ...testUser.res,
      status: testUser.statusSetter(sO),
      json: testUser.resultDataSetter(sO)
    };
    const testReq = {
      ...testPeer.getReq,
      query: { userName: testPeer.credentials.name.toUpperCase() },
      cookies: { accessToken: JWT.createAccessToken(userId) }
    };
    const controller = new GetUsersController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.data).toHaveLength(1);
  });
});

describe("Get users failure responses", () => {
  const testUser = new AuthControllerTestingUtils(
    "create-chat-controller-user-2"
  );
  const testDeletedUser = new AuthControllerTestingUtils("some-unreal-name");

  beforeAll(async () => {
    await testUser.createUser();
    await testDeletedUser.deleteUser();
  });

  afterAll(async () => {
    await testUser.deleteUser();
  });

  test("Should throw no results error", async () => {
    let sO: StatusObject = { status: 200 };
    const userId = await getUserId(testUser.credentials.name);
    const testRes = {
      ...testUser.res,
      status: testUser.statusSetter(sO),
      json: testUser.resultDataSetter(sO)
    };
    const testReq = {
      ...testUser.getReq,
      query: { userName: testDeletedUser.credentials.name },
      cookies: { accessToken: JWT.createAccessToken(userId) }
    };
    const controller = new GetUsersController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.status).toBe(404);
  });

  test("Should throw no results error because the user and the search names match", async () => {
    let sO: StatusObject = { status: 200 };
    const userId = await getUserId(testUser.credentials.name);
    const testRes = {
      ...testUser.res,
      status: testUser.statusSetter(sO),
      json: testUser.resultDataSetter(sO)
    };
    const testReq = {
      ...testUser.getReq,
      query: { userName: testUser.credentials.name },
      cookies: { accessToken: JWT.createAccessToken(userId) }
    };
    const controller = new GetUsersController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.status).toBe(404);
  });

  test("Should throw an error because of an unspecified search name", async () => {
    let sO: StatusObject = { status: 200 };
    try {
      const userId = await getUserId(testUser.credentials.name);
      const testRes = {
        ...testUser.res,
        status: testUser.statusSetter(sO),
        json: testUser.resultDataSetter(sO)
      };
      const testReq = {
        ...testUser.getReq,
        query: {},
        cookies: { accessToken: JWT.createAccessToken(userId) }
      };
      const controller = new GetUsersController({
        req: testReq as any,
        res: testRes as any
      });

      await controller.run();
    } catch {
      expect(sO.status).toBe(500);
    } finally {
      expect(sO.status).toBe(500);
    }
  });

  test("Should throw an error because of the multiple search name queries", async () => {
    let sO: StatusObject = { status: 200 };
    try {
      const userId = await getUserId(testUser.credentials.name);
      const testRes = {
        ...testUser.res,
        status: testUser.statusSetter(sO),
        json: testUser.resultDataSetter(sO)
      };
      const testReq = {
        ...testUser.getReq,
        query: { userName: ["name", "name"] },
        cookies: { accessToken: JWT.createAccessToken(userId) }
      };
      const controller = new GetUsersController({
        req: testReq as any,
        res: testRes as any
      });

      await controller.run();
    } catch {
      expect(sO.status).toBe(500);
    } finally {
      expect(sO.status).toBe(500);
    }
  });

  test("Should throw an error because accessToken is not passed", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = {
      ...testUser.res,
      status: testUser.statusSetter(sO),
      json: testUser.resultDataSetter(sO)
    };
    const testReq = {
      ...testUser.getReq,
      query: { userName: testDeletedUser.credentials.name },
      cookies: {}
    };
    const controller = new GetUsersController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.status).toBe(403);
  });

  test("Should throw an error because accessToken is invalid", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = {
      ...testUser.res,
      status: testUser.statusSetter(sO),
      json: testUser.resultDataSetter(sO)
    };
    const testReq = {
      ...testUser.getReq,
      query: { userName: testDeletedUser.credentials.name },
      cookies: { accessToken: "xxxxxxxxxxxx.xxxxxx" }
    };
    const controller = new GetUsersController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.status).toBe(403);
  });

  test("Should throw an error because of invalid http method", async () => {
    let sO: StatusObject = { status: 200 };
    const userId = await getUserId(testUser.credentials.name);
    const testRes = {
      ...testUser.res,
      status: testUser.statusSetter(sO),
      json: testUser.resultDataSetter(sO)
    };
    const testReq = {
      ...testUser.postReq,
      query: { userName: testDeletedUser.credentials.name },
      cookies: { accessToken: JWT.createAccessToken(userId) }
    };
    const controller = new GetUsersController({
      req: testReq as any,
      res: testRes as any
    });

    await controller.run();
    expect(sO.status).toBe(405);
  });
});
