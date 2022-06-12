import MessageTime from "./index";

describe("Message time", () => {
  beforeEach(() => {
    MessageTime["currentDate"] = new Date(1654533034977);
  });

  test("Should return 19:30", () => {
    const messageTime = new MessageTime(
      new Date("Mon Jun 06 2022 19:30:00").toISOString()
    );
    expect(messageTime.returnMessageISODate()).toBe("19:30");
  });

  test("Should return 5 Jun", () => {
    const messageTime = new MessageTime(
      new Date("Mon Jun 05 2022 19:30:00").toISOString()
    );
    expect(messageTime.returnMessageISODate()).toBe("5 Jun");
  });

  test("Should return 5 Mar", () => {
    const messageTime = new MessageTime(
      new Date("Sat Mar 05 2022 19:30:00").toISOString()
    );
    expect(messageTime.returnMessageISODate()).toBe("5 Mar");
  });

  test("Should return 2021", () => {
    const messageTime = new MessageTime(
      new Date("Mon Jun 06 2021 19:30:00").toISOString()
    );
    expect(messageTime.returnMessageISODate()).toBe("2021");
  });

  test("Should throw an error", () => {
    try {
      new MessageTime(new Date("Mon Jun 06 2024 19:30:00").toISOString());
    } catch ({ message }) {
      expect(1).toBe("Your message is from the future");
    }
  });
});
