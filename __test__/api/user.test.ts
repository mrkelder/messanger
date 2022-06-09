import axios from "axios";
import mongoose from "mongoose";

import Chat from "src/models/Chat";
import User from "src/models/User";
import JWT from "src/utils/JWT";

const host = process.env.NEXT_PUBLIC_HOST + "/api/user";
const getChatsAPI = host + "/getChats";
const getUsersAPI = host + "/getUsers";
const createChatAPI = host + "/createChat";

const password = "test-password";
const userCredantials = {
  name: "test-user-1",
  password,
  _id: new mongoose.Types.ObjectId()
};
const peerCredantials = {
  name: "test-user-2",
  password,
  _id: new mongoose.Types.ObjectId()
};

const returnConf = (accessToken: string) => ({
  withCredentials: true,
  headers: { Cookie: `accessToken=${accessToken}` }
});

const returnBadConf = (accessToken: string) => ({
  withCredentials: true,
  headers: {
    Cookie: `accessToken=${accessToken.replace(/\w/gi, "x")}`
  }
});

async function getAccessToken() {
  const dbUser = await User.find({ name: userCredantials.name });
  return JWT.createAccessToken(dbUser[0]?._id);
}

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_HOST as string);
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) await mongoose.disconnect();
});

describe("Chat list", () => {
  beforeAll(async () => {
    const user = new User(userCredantials);
    const peer = new User(peerCredantials);
    const chat = new Chat({ members: [user._id, peer._id] });
    await user.save();
    await peer.save();
    await chat.save();
  });

  afterAll(async () => {
    const user = await User.findByName(userCredantials.name);
    await Chat.deleteOne({ members: { $in: user?._id } });
    await User.deleteByName(userCredantials.name);
    await User.deleteByName(peerCredantials.name);
  });

  test("Should successfully fetch chats", async () => {
    const { data } = await axios.get(
      getChatsAPI,
      returnConf(await getAccessToken())
    );

    expect(data).toBeDefined();
    expect(data).toHaveLength(1);
  });

  test("Should throw an error because accessToken is not passed", async () => {
    try {
      await axios.get(getChatsAPI);
    } catch ({ message }) {
      expect(message).toMatch("401");
    }
  });

  test("Should throw an error because accessToken is invalid", async () => {
    try {
      await axios.get(getChatsAPI, returnBadConf(await getAccessToken()));
    } catch ({ message }) {
      expect(message).toMatch("403");
    }
  });

  test("Should throw an error because of invalid http method", async () => {
    try {
      await axios.put(getChatsAPI, returnConf(await getAccessToken()));
    } catch ({ message }) {
      expect(message).toMatch("405");
    }
  });
});

describe("Get users", () => {
  beforeAll(async () => {
    const user = new User(userCredantials);
    const peer = new User(peerCredantials);

    await user.save();
    await peer.save();
  });

  afterAll(async () => {
    await User.deleteByName(userCredantials.name);
    await User.deleteByName(peerCredantials.name);
  });

  test("Should return 1 user", async () => {
    const { data } = await axios.get(
      getUsersAPI + `?userName=${peerCredantials.name}`,
      returnConf(await getAccessToken())
    );

    expect(data[0].name).toBe(peerCredantials.name);
  });

  test("Should throw no results error", async () => {
    try {
      await axios.get(
        getUsersAPI + "?userName=test-user-that-does-not-exist",
        returnConf(await getAccessToken())
      );
    } catch ({ message }) {
      expect(message).toMatch("404");
    }
  });

  test("Should throw an error because userName equals to user's name", async () => {
    try {
      await axios.get(
        getUsersAPI + `?userName=${userCredantials.name}`,
        returnConf(await getAccessToken())
      );
    } catch ({ message }) {
      expect(message).toMatch("404");
    }
  });

  test("Should throw an error because of an unspecified userName", async () => {
    try {
      await axios.get(
        getUsersAPI + `?userName=`,
        returnConf(await getAccessToken())
      );
    } catch ({ message }) {
      expect(message).toMatch("500");
    }
  });

  test("Should throw an error because of the multiple userName queries", async () => {
    try {
      await axios.get(
        getUsersAPI +
          `?userName=${userCredantials.name}&userName=${userCredantials.name}`,
        returnConf(await getAccessToken())
      );
    } catch ({ message }) {
      expect(message).toMatch("500");
    }
  });

  test("Should throw an error because accessToken is not passed", async () => {
    try {
      await axios.get(getUsersAPI + `?userName=test-user-that-does-not-exist`);
    } catch ({ message }) {
      expect(message).toMatch("401");
    }
  });

  test("Should throw an error because accessToken is invalid", async () => {
    try {
      await axios.get(
        getUsersAPI + `?userName=test-user-that-does-not-exist`,
        returnBadConf(await getAccessToken())
      );
    } catch ({ message }) {
      expect(message).toMatch("403");
    }
  });

  test("Should throw an error because of invalid http method", async () => {
    try {
      await axios.post(
        getUsersAPI + `?userName=${userCredantials.name}`,
        returnConf(await getAccessToken())
      );
    } catch ({ message }) {
      expect(message).toMatch("405");
    }
  });
});

describe("Create chat", () => {
  beforeAll(async () => {
    const user = new User(userCredantials);
    const peer = new User(peerCredantials);
    await user.save();
    await peer.save();
  });

  afterAll(async () => {
    await User.deleteByName(userCredantials.name);
    await User.deleteByName(peerCredantials.name);
  });

  test("Should successfully create a chat", async () => {
    const { data } = await axios.post(
      createChatAPI,
      { peerId: peerCredantials._id },
      returnConf(await getAccessToken())
    );

    const { chatId } = data;

    expect(chatId).toBeDefined();
    await Chat.deleteOne({ _id: new mongoose.Types.ObjectId(chatId) });
  });

  test("Should throw an error because accessToken is not passed", async () => {
    try {
      await axios.post(createChatAPI, { peerId: peerCredantials._id });
    } catch ({ message }) {
      expect(message).toMatch("401");
    }
  });

  test("Should throw an error because accessToken is invalid", async () => {
    try {
      await axios.post(
        createChatAPI,
        { peerId: peerCredantials._id },
        returnBadConf(await getAccessToken())
      );
    } catch ({ message }) {
      expect(message).toMatch("403");
    }
  });

  test("Should throw an error because of an unspecified userName", async () => {
    try {
      await axios.post(
        createChatAPI,
        { peerId: null },
        returnConf(await getAccessToken())
      );
    } catch ({ message }) {
      expect(message).toMatch("500");
    }
  });

  test("Should throw an error because of the multiple peerId queries", async () => {
    try {
      await axios.post(
        createChatAPI,
        { peerId: [peerCredantials._id, peerCredantials._id] },
        returnConf(await getAccessToken())
      );
    } catch ({ message }) {
      expect(message).toMatch("500");
    }
  });

  test("Should throw an error because of invalid http method", async () => {
    try {
      await axios.get(
        createChatAPI + `?peerId=${peerCredantials._id}`,
        returnConf(await getAccessToken())
      );
    } catch ({ message }) {
      expect(message).toMatch("405");
    }
  });
});
