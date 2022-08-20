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

  test("Should successfully find the chat", async () => {
    const userIdObject = new mongoose.Types.ObjectId(userCredantials._id);
    const peerIdObject = new mongoose.Types.ObjectId(peerCredantials._id);
    const members = [userIdObject, peerIdObject];
    const chat = new Chat({ members });
    await chat.save();

    const { data } = await axios.post(
      createChatAPI,
      { peerId: peerCredantials._id },
      returnConf(await getAccessToken())
    );

    expect(data.chatId).toBe(chat._id?.toString());
    await Chat.deleteOne({ members: { $all: members } });
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
