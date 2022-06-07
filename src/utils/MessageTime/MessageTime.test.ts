import MessageTime from "./index";

describe("Message time", () => {
  beforeEach(() => {
    Date.now = () => 1654533034977;
  });

  test("Should return 19:30", () => {
    const messageTime = new MessageTime(new Date("Mon Jun 06 2022 19:30:00"));
    expect(messageTime.returnMessageDate()).toBe("19:30");
  });

  test("Should return 6 Jun", () => {
    const messageTime = new MessageTime(new Date("Mon Jun 08 2022 19:30:00"));
    expect(messageTime.returnMessageDate()).toBe("6 Jun");
  });

  test("Should return 2022", () => {
    const messageTime = new MessageTime(new Date("Mon Jun 06 2023 19:30:00"));
    expect(messageTime.returnMessageDate()).toBe("2022");
  });

  test("Should throw an error", () => {
    try {
    } catch {}
  });
});
