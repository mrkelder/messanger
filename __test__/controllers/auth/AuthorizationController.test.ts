import bcrypt from "bcrypt";
import mongoose from "mongoose";

import { AuthorizationController } from "src/controllers/auth";
import User from "src/models/User";

interface StatusObject {
  status: number;
}

const credentials = {
  name: "test-user-name",
  password: "some-test-password"
};

const req = {
  method: "POST",
  body: credentials
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

async function execMongodbOperation(func: () => Promise<void>) {
  await mongoose.connect(process.env.MONGODB_HOST as string);
  await func();
  await mongoose.disconnect();
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

async function deleteUser() {
  await execMongodbOperation(async () => {
    const { name } = credentials;
    await User.deleteByName(name);
  });
}

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

    const controller = new AuthorizationController({ req, res: testRes });
    await controller.run();
    expect(sO.status).toBe(200);
  });

  test("should throw endpoint error", async () => {
    let sO: StatusObject = { status: 200 };
    const testReq = { ...req, method: "GET" };
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
    const testReq = { ...req, body: { name: String(Math.random()), password } };

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
    const testReq = { ...req, body: { password } };

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
    const testReq = { ...req, body: { name } };

    const controller = new AuthorizationController({
      req: testReq,
      res: testRes
    });
    await controller.run();

    expect(sO.status).toBe(500);
  });
});
