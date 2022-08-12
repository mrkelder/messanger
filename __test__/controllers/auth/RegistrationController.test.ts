import { RegistrationController } from "src/controllers/auth";
import { UserDocument } from "src/models/User";

import {
  AuthControllerTestingUtils,
  StatusObject
} from "./AuthControllerTestingUtils";

const {
  deleteUser,
  createUser,
  res,
  statusSetter,
  credentials,
  postReq,
  findUser
} = AuthControllerTestingUtils;

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
    const controller = new RegistrationController({
      req: postReq,
      res: testRes
    });
    await controller.run();

    const registratedUser = (await findUser()) as UserDocument;

    expect(sO.status).toBe(200);
    expect(registratedUser.name).toBe(name);
  });

  test("should throw endpoint error", async () => {
    let sO: StatusObject = { status: 200 };
    const testRes = { ...res, status: statusSetter(sO) };
    const testReq = { ...postReq, method: "GET" };
    const controller = new RegistrationController({
      req: testReq,
      res: testRes
    });
    await controller.run();

    expect(sO.status).toBe(405);
  });

  test("should throw unprovided name error", async () => {
    let sO: StatusObject = { status: 200 };
    const testReq = { ...postReq, body: { password } };
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
    const testReq = { ...postReq, body: { name } };
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
      req: postReq,
      res: testRes
    });
    await controller.run();

    expect(sO.status).toBe(409);
  });
});
