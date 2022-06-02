import { Chat } from "src/types/chat";

import useChat from "./index";

const user = { _id: "629704b66a3c6adcb11d7202", name: "DemoMain" };
const peer = { _id: "62971e676a3c6adcb11d722f", name: "MR.Paladin" };

const chatData: Chat = {
  _id: "cnd304b62d3c6zdcv11dh2f2",
  members: [user, peer],
  lastMessage: {
    _id: "6jhyt1b66a3c6adclkju7102",
    author: "629704b66a3c6adcb11d7202",
    text: "Text",
    createdAt: "2022-06-01T08:13:47.504Z",
    updatedAt: "2022-06-01T08:13:47.504Z"
  },
  createdAt: "2022-06-01T08:13:47.504Z",
  updatedAt: "2022-06-01T08:13:47.504Z"
};

describe("useChat", () => {
  test("Should return user's name", () => {
    const { getUserName } = useChat(chatData, user._id);
    expect(getUserName()).toBe(user.name);
  });

  test("Should return peer's name", () => {
    const { getPeerName } = useChat(chatData, user._id);
    expect(getPeerName()).toBe(peer.name);
  });

  test("Should return a valid lastMessage field", () => {
    const { formatLastMessage } = useChat(chatData, user._id);
    expect(formatLastMessage()).toEqual({
      ...chatData.lastMessage,
      author: user.name
    });
  });

  test("Should return null because of no last message object", () => {
    const { lastMessage, ...chatDataWithoutLastMessage } = chatData;
    const { formatLastMessage } = useChat(chatDataWithoutLastMessage, user._id);
    expect(formatLastMessage()).toBeNull();
  });
});
