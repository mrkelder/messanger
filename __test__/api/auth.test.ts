import mongoose from "mongoose";

import User from "src/models/User";

const host = process.env.NEXT_PUBLIC_HOST;
const registrateAPI = host + "/api/auth/registrate";
const authorizateAPI = host + "/api/auth/authorizate";

const testUser = {
  name: "test-user-name-that-mustn't-be-copied",
  password: "some-password"
};

const body = JSON.stringify(testUser);
const failAuthorizationBody = JSON.stringify(testUser);

const request = {
  method: "POST",
  body
};

const failAuthorizationRequest = {
  method: "POST",
  body: failAuthorizationBody
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_HOST as string);
  await User.deleteByName(testUser.name);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Registration", () => {
  test("Should successfully registrate a user", async () => {
    const result = await fetch(registrateAPI, request);
    expect(result.ok).toBeTruthy();
  });

  test("Should result in an error due to other the user having the same name", async () => {
    const result = await fetch(registrateAPI, request);
    expect(result.ok).toBeFalsy();
  });
});

describe("Authorization", () => {
  test("Should result in a successful authorization", async () => {
    const result = await fetch(authorizateAPI, request);
    expect(result.ok).toBeTruthy();
  });

  test("Should result in an error because of the wrong password", async () => {
    const result = await fetch(authorizateAPI, failAuthorizationRequest);
    expect(result.ok).toBeFalsy();
  });

  test("Should result in an error because the is deleted", async () => {
    await User.deleteByName(testUser.name);
    const result = await fetch(authorizateAPI, request);
    expect(result.ok).toBeFalsy();
  });
});

export {};
