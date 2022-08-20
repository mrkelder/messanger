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
