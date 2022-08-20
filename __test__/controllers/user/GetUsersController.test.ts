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
