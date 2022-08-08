import bcrypt from "bcrypt";
import mongoose from "mongoose";

import { RefreshAccessController } from "src/controllers/auth";
import RefreshToken from "src/models/RefreshToken";
import User, { UserDocument } from "src/models/User";
import JWT from "src/utils/JWT";

interface StatusObject {
  status: number;
}

const credentials = {
  name: "test-user-name",
  password: "some-test-password"
};

const req = {
  method: "PUT",
  cookies: {}
} as any;

const res = {
  removeHeader: () => res,
  setHeader: () => res,
  status: () => res,
  json: () => res,
  send: () => res
} as any;

function statusSetter(statusObject: StatusObject) {
  return (statusCode: number) => {
    statusObject.status = statusCode;
    return res;
  };
}

async function execMongodbOperation<ReturnValue>(
  func: () => Promise<ReturnValue>
) {
  await mongoose.connect(process.env.MONGODB_HOST as string);
  const result = (await func()) as ReturnValue;
  await mongoose.disconnect();
  return result;
}

async function deleteRefreshToken() {
  await execMongodbOperation(async () => {
    const { name } = credentials;
    const user = (await User.findByName(name)) as UserDocument;
    await RefreshToken.deleteByUserId(user.id);
  });
}

async function deleteUser() {
  await execMongodbOperation(async () => {
    const { name } = credentials;
    await User.deleteByName(name);
  });
}

async function createUser() {
  await execMongodbOperation(async () => {
    const { name, password } = credentials;
    const newUser = new User({
      name,
      password: await bcrypt.hash(password, 10)
    });
    await newUser.save();
  });
}

async function createRefreshToken(userId: string) {
  return await execMongodbOperation<string>(async () => {
    const newToken = new RefreshToken({
      token: JWT.createRefreshToken(userId),
      userId
    });
    await newToken.save();

    return newToken.token;
  });
}

async function retrieveUserId() {
  return await execMongodbOperation<string>(async () => {
    const { name } = credentials;
    const user = (await User.findByName(name)) as UserDocument;

    return user.id;
  });
}

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
    const reqWithToken = { ...req, cookies: { refreshToken } };

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
    const reqWithToken = { ...req, cookies: { refreshToken } };

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
    const reqWithToken = { ...req, cookies: { refreshToken: "xxx.yyy.zzz" } };

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
    const testReq = { ...req, method: "POST" };
    const controller = new RefreshAccessController({
      req: testReq,
      res: testRes
    });

    await controller.run();

    expect(sO.status).toBe(405);
  });
});
