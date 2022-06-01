import axios from "axios";
import mongoose from "mongoose";

import Chat from "src/models/Chat";
import User from "src/models/User";
import { DatabaseUser } from "src/types/db";
import JWT from "src/utils/JWT";

const host = process.env.NEXT_PUBLIC_HOST + "/api/user";
const registrateAPI = host + "/getChats";
const conf = { headers: { "Content-Type": "text/plain" } };

const password = "test-password";
const userCredantials = { name: "test-user-1", password };
const peerCredantials = { name: "test-user-2", password };

async function getAccessToken() {
  await mongoose.connect(process.env.MONGODB_HOST as string);
  const dbUser = await User.find({ name: userCredantials.name });
  await mongoose.disconnect();
  return JWT.createAccessToken(dbUser[0]?._id);
}

describe("User", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_HOST as string);
    const user = new User(userCredantials);
    const peer = new User(peerCredantials);
    const chat = new Chat({ members: [user._id, peer._id] });
    await user.save();
    await peer.save();
    await chat.save();
  });

  afterAll(async () => {
    await User.deleteByName(userCredantials.name);
    await User.deleteByName(peerCredantials.name);
    await mongoose.disconnect();
  });

  test("Should successfully fetch chats", async () => {
    const { data } = await axios.get(registrateAPI, {
      withCredentials: true,
      headers: { Cookie: `accessToken=${await getAccessToken()}` }
    });

    expect(data).toBeDefined();
    expect(data).toHaveLength(1);
  });

  test("Should throw an error because accessToken is not passed", async () => {
    try {
      await axios.get(registrateAPI);
    } catch ({ message }) {
      expect(message).toMatch("403");
    }
  });
});
