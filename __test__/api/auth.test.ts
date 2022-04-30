import axios from "axios";
import mongoose from "mongoose";

import User from "src/models/User";

const host = process.env.NEXT_PUBLIC_HOST;
const registrateAPI = host + "/api/auth/registrate";
const authorizateAPI = host + "/api/auth/authorizate";
const conf = { headers: { "Content-Type": "text/plain" } };

const testUser = {
  name: "test-user-name-that-mustn't-be-copied",
  password: "some-password"
};

const testUserBody = JSON.stringify(testUser);
const testUserWithoutNameBody = JSON.stringify({ password: testUser.password });
const testUserWithoutPasswordBody = JSON.stringify({ name: testUser.name });

const testUserWithWrongNameBody = JSON.stringify({
  password: testUser.password,
  name: "some-other-user"
});
const testUserWithWrongPasswordBody = JSON.stringify({
  name: testUser.name,
  password: "some-other-password"
});

jest.setTimeout(15 * 1000);

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/messenger");
  await User.deleteByName(testUser.name);
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
      await axios.post(registrateAPI, testUserWithoutNameBody, conf);
    } catch ({ message }) {
      expect(message).toMatch("403");
    }
  });

  test("Should throw an error because of an unspecified password", async () => {
    try {
      await axios.post(registrateAPI, testUserWithoutPasswordBody, conf);
    } catch ({ message }) {
      expect(message).toMatch("403");
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
    const result = await axios.post(registrateAPI, testUserBody, conf);
    expect(result.status).toBe(200);
  });

  test("Should throw an error because of other the user having the same name", async () => {
    try {
      await axios.post(registrateAPI, testUserBody, conf);
    } catch ({ message }) {
      expect(message).toMatch("409");
    }
  });
});

describe("Authorization", () => {
  test("Should throw an error because of the wrong http method", async () => {
    try {
      await axios.get(authorizateAPI);
    } catch ({ message }) {
      expect(message).toMatch("405");
    }
  });

  test("Should throw an error because of an unspecified name", async () => {
    try {
      await axios.post(authorizateAPI, testUserWithoutNameBody, conf);
    } catch ({ message }) {
      expect(message).toMatch("403");
    }
  });

  test("Should throw an error because of an unspecified password", async () => {
    try {
      await axios.post(authorizateAPI, testUserWithoutPasswordBody, conf);
    } catch ({ message }) {
      expect(message).toMatch("403");
    }
  });

  test("Should throw an error because such user doesn't exist", async () => {
    try {
      await axios.post(authorizateAPI, testUserWithWrongNameBody, conf);
    } catch ({ message }) {
      expect(message).toMatch("404");
    }
  });

  test("Should throw an error because of the wrong password", async () => {
    try {
      await axios.post(authorizateAPI, testUserWithWrongPasswordBody, conf);
    } catch ({ message }) {
      expect(message).toMatch("403");
    }
  });

  test("Should result in a successful authorization", async () => {
    const result = await axios.post(authorizateAPI, testUserBody, conf);
    expect(result.status).toBe(200);
  });

  test("Should throw an error because the user is deleted", async () => {
    try {
      await User.deleteByName(testUser.name);
      await axios.post(authorizateAPI, testUserBody, conf);
    } catch ({ message }) {
      expect(message).toMatch("404");
    }
  });
});
