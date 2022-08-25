import { NextApiRequest, NextApiResponse } from "next";

import { GetUsersController } from "src/controllers/user";
import {
  TestCredentialsUtils,
  TestMongodbUtils,
  TestHttpUtils
} from "src/utils/TestUtils";

describe("Get users successful responses", () => {
  const testUser = new TestCredentialsUtils("get-users-controller-user");
  const testPeer = new TestCredentialsUtils("get-users-controller-peer");
  const resultObject = TestHttpUtils.createReultObject();

  const ids = {
    userId: "",
    peerId: ""
  };

  beforeEach(async () => {
    ids.userId = await TestMongodbUtils.createUser(testUser.getCredentials());
    ids.peerId = await TestMongodbUtils.createUser(testPeer.getCredentials());
  });

  afterEach(async () => {
    await TestMongodbUtils.deleteUser(testUser.getCredentials().name);
    await TestMongodbUtils.deleteUser(testPeer.getCredentials().name);
  });

  test("Should return the user", async () => {
    const { userId } = ids;
    const testReq = TestHttpUtils.createRequest("GET", userId);
    const testRes = TestHttpUtils.createResponse(resultObject);
    testReq.query.userName = testPeer.getCredentials().name;

    const controller = new GetUsersController({
      req: testReq as NextApiRequest,
      res: testRes as unknown as NextApiResponse
    });

    await controller.run();
    expect(resultObject.data).toHaveLength(1);
  });

  test("Should return the user despite the incompleteness of the name", async () => {
    const { userId } = ids;
    const testReq = TestHttpUtils.createRequest("GET", userId);
    const testRes = TestHttpUtils.createResponse(resultObject);
    testReq.query.userName = testPeer.getCredentials().name.substring(5);

    const controller = new GetUsersController({
      req: testReq as NextApiRequest,
      res: testRes as unknown as NextApiResponse
    });

    await controller.run();
    expect(resultObject.data).toHaveLength(1);
  });

  test("Should return the user despite the casing", async () => {
    const { userId } = ids;
    const testReq = TestHttpUtils.createRequest("GET", userId);
    const testRes = TestHttpUtils.createResponse(resultObject);
    testReq.query.userName = testPeer.getCredentials().name.toUpperCase();

    const controller = new GetUsersController({
      req: testReq as NextApiRequest,
      res: testRes as unknown as NextApiResponse
    });

    await controller.run();
    expect(resultObject.data).toHaveLength(1);
  });
});

describe("Get users failure responses", () => {
  const testUser = new TestCredentialsUtils("get-users-controller-user-2");
  const testDeletedUser = new TestCredentialsUtils(
    "get-users-controller-deleted-user-2"
  );
  const resultObject = TestHttpUtils.createReultObject();

  const ids = {
    userId: ""
  };

  beforeAll(async () => {
    ids.userId = await TestMongodbUtils.createUser(testUser.getCredentials());
    await TestMongodbUtils.deleteUser(testDeletedUser.getCredentials().name);
  });

  afterAll(async () => {
    await TestMongodbUtils.deleteUser(testUser.getCredentials().name);
  });

  test("Should throw no results error", async () => {
    const { userId } = ids;
    const testReq = TestHttpUtils.createRequest("GET", userId);
    const testRes = TestHttpUtils.createResponse(resultObject);
    testReq.query.userName = testDeletedUser.getCredentials().name;

    const controller = new GetUsersController({
      req: testReq as NextApiRequest,
      res: testRes as unknown as NextApiResponse
    });

    await controller.run();
    expect(resultObject.status).toBe(404);
  });

  test("Should throw no results error because the user and the search names match", async () => {
    const { userId } = ids;
    const testReq = TestHttpUtils.createRequest("GET", userId);
    const testRes = TestHttpUtils.createResponse(resultObject);
    testReq.query.userName = testUser.getCredentials().name;

    const controller = new GetUsersController({
      req: testReq as NextApiRequest,
      res: testRes as unknown as NextApiResponse
    });

    await controller.run();
    expect(resultObject.status).toBe(404);
  });

  test("Should throw an error because of an unspecified search name", async () => {
    try {
      const { userId } = ids;
      const testReq = TestHttpUtils.createRequest("GET", userId);
      const testRes = TestHttpUtils.createResponse(resultObject);

      const controller = new GetUsersController({
        req: testReq as any,
        res: testRes as any
      });

      await controller.run();
    } catch {
      expect(resultObject.status).toBe(500);
    } finally {
      expect(resultObject.status).toBe(500);
    }
  });

  test("Should throw an error because of the multiple search name queries", async () => {
    try {
      const { userId } = ids;
      const testReq = TestHttpUtils.createRequest("GET", userId);
      const testRes = TestHttpUtils.createResponse(resultObject);
      testReq.query.userName = ["name", "name"] as any;

      const controller = new GetUsersController({
        req: testReq as any,
        res: testRes as any
      });

      await controller.run();
    } catch {
      expect(resultObject.status).toBe(500);
    } finally {
      expect(resultObject.status).toBe(500);
    }
  });

  test("Should throw an error because accessToken is not passed", async () => {
    const testReq = TestHttpUtils.createRequest("GET");
    const testRes = TestHttpUtils.createResponse(resultObject);

    const controller = new GetUsersController({
      req: testReq as NextApiRequest,
      res: testRes as unknown as NextApiResponse
    });

    await controller.run();
    expect(resultObject.status).toBe(403);
  });

  test("Should throw an error because accessToken is invalid", async () => {
    const testReq = TestHttpUtils.createRequest("GET");
    const testRes = TestHttpUtils.createResponse(resultObject);
    testReq.cookies.accessToken = "xxxxxxxxxxxxxx.xxxxxxxxxx";
    testReq.query.userName = testDeletedUser.getCredentials().name;

    const controller = new GetUsersController({
      req: testReq as NextApiRequest,
      res: testRes as unknown as NextApiResponse
    });

    await controller.run();
    expect(resultObject.status).toBe(403);
  });

  test("Should throw an error because of invalid http method", async () => {
    const { userId } = ids;
    const testReq = TestHttpUtils.createRequest("POST", userId);
    const testRes = TestHttpUtils.createResponse(resultObject);
    testReq.query.userName = testDeletedUser.getCredentials().name;

    const controller = new GetUsersController({
      req: testReq as NextApiRequest,
      res: testRes as unknown as NextApiResponse
    });

    await controller.run();
    expect(resultObject.status).toBe(405);
  });
});
