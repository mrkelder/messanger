import bcrypt from "bcrypt";
import mongoose from "mongoose";

import { RegistrationController } from "src/controllers/auth";
import User, { UserDocument } from "src/models/User";

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

async function execMongodbOperation<ReturnValue>(
  func: () => Promise<ReturnValue>
) {
  await mongoose.connect(process.env.MONGODB_HOST as string);
  const result = (await func()) as ReturnValue;
  await mongoose.disconnect();
  return result;
}

async function findUser(name: string): Promise<UserDocument | void> {
  return await execMongodbOperation<UserDocument | void>(async () => {
    return await User.findByName(name);
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

describe("Registration controller", () => {
  const { name, password } = credentials;

  beforeEach(async () => {
    await deleteUser();
  });

  afterAll(async () => {
    await deleteUser();
  });

  test("should successfully registrate a user", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...res, status: statusSetter(sO) };
    const controller = new RegistrationController({ req, res: testRes });
    await controller.run();

    const registratedUser = (await findUser(name)) as UserDocument;

    expect(sO.status).toBe(200);
    expect(registratedUser.name).toBe(name);
  });

  test("should throw endpoint error", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...res, status: statusSetter(sO) };
    const testReq = { ...req, method: "GET" };
    const controller = new RegistrationController({
      req: testReq,
      res: testRes
    });
    await controller.run();

    expect(sO.status).toBe(405);
  });

  test("should throw unprovided name error", async () => {
    let sO: StatusObject = { status: 200 };
    const testReq = { ...req, body: { password } };
    const testRes = {
      ...res,
      status: statusSetter(sO)
    };
    const controller = new RegistrationController({
      req: testReq,
      res: testRes
    });
    await controller.run();

    expect(sO.status).toBe(500);
  });

  test("should throw unprovided password error", async () => {
    let sO: StatusObject = { status: 200 };
    const testReq = { ...req, body: { name } };
    const testRes = {
      ...res,
      status: statusSetter(sO)
    };
    const controller = new RegistrationController({
      req: testReq,
      res: testRes
    });
    await controller.run();

    expect(sO.status).toBe(500);
  });

  test("should throw user already exists error", async () => {
    await createUser();
    let sO: StatusObject = { status: 200 };
    const testRes = {
      ...res,
      status: statusSetter(sO)
    };
    const controller = new RegistrationController({
      req,
      res: testRes
    });
    await controller.run();

    expect(sO.status).toBe(409);
  });
});
