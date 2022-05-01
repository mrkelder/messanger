import axios from "axios";
import mongoose from "mongoose";

import RefreshToken from "src/models/RefreshToken";
import User from "src/models/User";

const host = process.env.NEXT_PUBLIC_HOST;
const registrateAPI = host + "/api/auth/registrate";
const authorizateAPI = host + "/api/auth/authorizate";
const conf = { headers: { "Content-Type": "text/plain" } };

const testUser = {
  name: "test-user-name-that-mustn't-be-copied",
  password: "some-password"
};
const testUserWithoutName = { password: testUser.password };
const testUserWithoutPassword = { name: testUser.name };

jest.setTimeout(15 * 1000);

async function deleteUser() {
  const user = (await User.findByName(testUser.name))[0];
  if (user) {
    await RefreshToken.deleteByUserId(user._id);
    await User.deleteByName(testUser.name);
  }
}

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/messenger");
  await deleteUser();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Registration", () => {
  test("Should throw an error because of the wrong http method", async () => {
    try {
      await axios.get(registrateAPI);
    } catch ({ message }) {
      expect(message).toMatch("405");
    }
  });

  test("Should throw an error because of an unspecified name", async () => {
    try {
      await axios.post(
        registrateAPI,
        JSON.stringify(testUserWithoutName),
        conf
      );
    } catch ({ message }) {
      expect(message).toMatch("500");
    }
  });

  test("Should throw an error because of an unspecified password", async () => {
    try {
      await axios.post(
        registrateAPI,
        JSON.stringify(testUserWithoutPassword),
        conf
      );
    } catch ({ message }) {
      expect(message).toMatch("500");
    }
  });

  test("Should throw an error because of an invalid body", async () => {
    try {
      await axios.post(registrateAPI, "{ name:", conf);
    } catch ({ message }) {
      expect(message).toMatch("500");
    }
  });

  test("Should successfully registrate a user", async () => {
    const result = await axios.post(
      registrateAPI,
      JSON.stringify(testUser),
      conf
    );
    expect(result.status).toBe(200);
    expect(result.data.accessToken).toBeDefined();
  });

  test("Should throw an error because of other the user having the same name", async () => {
    try {
      await axios.post(registrateAPI, JSON.stringify(testUser), conf);
    } catch ({ message }) {
      expect(message).toMatch("409");
    }
  });
});

describe("Authorization", () => {
  beforeEach(async () => {
    await deleteUser();
  });

  async function registrateUser(): Promise<string> {
    const result = await axios.post(
      registrateAPI,
      JSON.stringify(testUser),
      conf
    );
    return result.data.accessToken;
  }

  const testUserWithAccessToken = (accessToken: string) => ({
    ...testUser,
    accessToken
  });

  const testUserWithoutNameWithAccessToken = (accessToken: string) => ({
    ...testUserWithoutName,
    accessToken
  });

  const testUserWithoutPasswordWithAccessToken = (accessToken: string) => ({
    ...testUserWithoutPassword,
    accessToken
  });

  const testUserWithWrongNameWithAccessToken = (accessToken: string) => ({
    password: testUser.password,
    name: "some-other-user",
    accessToken
  });

  const testUserWithWrongPasswordWithAccessToken = (accessToken: string) => ({
    name: testUser.name,
    password: "some-other-password",
    accessToken
  });

  test("Should throw an error because of the wrong http method", async () => {
    try {
      await axios.get(authorizateAPI);
    } catch ({ message }) {
      expect(message).toMatch("405");
    }
  });

  test("Should throw an error because of an unspecified name", async () => {
    try {
      const accessToken = await registrateUser();
      await axios.post(
        authorizateAPI,
        JSON.stringify(testUserWithoutNameWithAccessToken(accessToken)),
        conf
      );
    } catch ({ message }) {
      expect(message).toMatch("500");
    }
  });

  test("Should throw an error because of an unspecified password", async () => {
    try {
      const accessToken = await registrateUser();
      await axios.post(
        authorizateAPI,
        JSON.stringify(testUserWithoutPasswordWithAccessToken(accessToken)),
        conf
      );
    } catch ({ message }) {
      expect(message).toMatch("500");
    }
  });

  test("Should throw an error because such user doesn't exist", async () => {
    try {
      const accessToken = await registrateUser();
      await axios.post(
        authorizateAPI,
        JSON.stringify(testUserWithWrongNameWithAccessToken(accessToken)),
        conf
      );
    } catch ({ message }) {
      expect(message).toMatch("404");
    }
  });

  test("Should throw an error because of the wrong password", async () => {
    try {
      const accessToken = await registrateUser();
      await axios.post(
        authorizateAPI,
        JSON.stringify(testUserWithWrongPasswordWithAccessToken(accessToken)),
        conf
      );
    } catch ({ message }) {
      expect(message).toMatch("401");
    }
  });

  test("Should result in a successful authorization", async () => {
    const accessToken = await registrateUser();
    const result = await axios.post(
      authorizateAPI,
      JSON.stringify(testUserWithAccessToken(accessToken)),
      conf
    );
    expect(result.status).toBe(200);
  });

  test("Should throw an error due to unspecified access token", async () => {
    try {
      await registrateUser();
      await axios.post(authorizateAPI, JSON.stringify(testUser), conf);
    } catch ({ message }) {
      expect(message).toMatch("500");
    }
  });

  test("Should throw an error because the user is deleted", async () => {
    try {
      const accessToken = await registrateUser();
      await deleteUser();
      await axios.post(
        authorizateAPI,
        JSON.stringify(testUserWithAccessToken(accessToken)),
        conf
      );
    } catch ({ message }) {
      expect(message).toMatch("404");
    }
  });
});
