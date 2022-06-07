import { screen, render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { DELETE_CHAT_EVENT_NAME } from "src/components/CONSTANTS";
import { Chat } from "src/types/chat";

import ChatLink from "./index";

const user = { _id: "62971fbbd30a2af25d278kf2", name: "Texas" };
const peer = { _id: "1s971fbbd30cnaf25d278kgz", name: "Cali" };

const chatWithoutLastMessage: Chat = {
  _id: "62971fbbd30a2af25d278kf2",
  members: [user, peer],
  created_at: "2022-01-01T08:13:47.504+00:00",
  updated_at: "2022-06-01T08:13:47.504+00:00",
  countOfUnreadMessages: 0
};

const chatWithReadLastMessage: Chat = {
  ...chatWithoutLastMessage,
  lastMessage: {
    _id: "0jb11fbbdlkj2af25d278kf2",
    author: peer._id,
    text: "Hello there",
    read: true,
    created_at: "2022-06-01T08:13:47.504+00:00",
    updated_at: "2022-06-01T08:13:47.504+00:00",
    chatId: "62971fbbd30a2af25d278kf2"
  }
};

const chatWith3UnreadMessages: Chat = {
  ...chatWithoutLastMessage,
  lastMessage: {
    _id: "0jb11fbbdlkj2af25d278kf2",
    author: peer._id,
    text: "Hello there",
    read: false,
    created_at: "2022-06-01T08:13:47.504+00:00",
    updated_at: "2022-06-01T08:13:47.504+00:00",
    chatId: "62971fbbd30a2af25d278kf2"
  },
  countOfUnreadMessages: 3
};

const chatWith150UnreadMessages: Chat = {
  ...chatWith3UnreadMessages,
  countOfUnreadMessages: 150
};

describe("ChatLink", () => {
  test("Should render a variant with no messages", () => {
    render(<ChatLink chat={chatWithoutLastMessage} userId={user._id} />);

    expect(
      screen.getByText(peer.name.charAt(0).toUpperCase())
    ).toBeInTheDocument();
    expect(screen.getByText(peer.name)).toBeInTheDocument();
    expect(screen.queryByText(0)).toBeNull();
  });

  test("Should render a variant with the read message", () => {
    render(<ChatLink chat={chatWithReadLastMessage} userId={user._id} />);

    const textRegExp = new RegExp(
      chatWithReadLastMessage.lastMessage?.text as string,
      "i"
    );

    expect(
      screen.getByText(peer.name.charAt(0).toUpperCase())
    ).toBeInTheDocument();
    expect(screen.getByText(peer.name)).toBeInTheDocument();
    expect(screen.getByText(textRegExp)).toBeInTheDocument();
    expect(screen.queryByText(0)).toBeNull();
  });

  test("Should render a variant with an unread message", () => {
    render(<ChatLink chat={chatWith3UnreadMessages} userId={user._id} />);
    expect(screen.getByText(3)).toBeInTheDocument();
  });

  test("Should render a variant with unread 99 messages even thought ther're 150", () => {
    render(<ChatLink chat={chatWith150UnreadMessages} userId={user._id} />);

    expect(screen.getByText(99)).toBeInTheDocument();
  });

  // test("Should emit a custom event after the component is held for 1 second (mobile)", async () => {
  // FIXME: cover touch event emission
  //
  //   async function timoutDelay() {
  //     return new Promise(res => {
  //       setTimeout(() => {
  //         res(null);
  //       }, 1000);
  //     });
  //   }

  //   render(<ChatLink chat={chatWithoutLastMessage} userId={user._id} />);

  //   const mockCallback = jest.fn();
  //   const chatLink = screen.getByRole("button");

  //   addEventListener(DELETE_CHAT_EVENT_NAME, mockCallback);

  //   const touch = new Touch({ clientX: 0, clientY: 0 });

  //   const touchList = new TouchList();

  //   touchList[0] = touch;

  //   fireEvent.touchStart(chatLink, {  });

  //   // await timoutDelay();

  //   expect(mockCallback).toBeCalled();
  //   removeEventListener(DELETE_CHAT_EVENT_NAME, mockCallback);
  // });

  test("Should emit a custom event after right click (desktop)", () => {
    render(<ChatLink chat={chatWithoutLastMessage} userId={user._id} />);

    const mockCallback = jest.fn();
    const chatName = screen.getByText(peer.name);

    addEventListener(DELETE_CHAT_EVENT_NAME, mockCallback);
    fireEvent.contextMenu(chatName);
    removeEventListener(DELETE_CHAT_EVENT_NAME, mockCallback);
    expect(mockCallback).toBeCalled();
  });

  // TODO: check dates
});
