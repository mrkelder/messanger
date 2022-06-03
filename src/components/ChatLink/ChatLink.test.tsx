import { screen, render, fireEvent } from "@testing-library/react";

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
    updated_at: "2022-06-01T08:13:47.504+00:00"
  }
};

const chatWithUnreadLastMessage: Chat = {
  ...chatWithoutLastMessage,
  lastMessage: {
    _id: "0jb11fbbdlkj2af25d278kf2",
    author: peer._id,
    text: "Hello there",
    read: false,
    created_at: "2022-06-01T08:13:47.504+00:00",
    updated_at: "2022-06-01T08:13:47.504+00:00"
  },
  countOfUnreadMessages: 3
};

describe("ChatLink", () => {
  test("Should render a variant with no messages", () => {
    render(<ChatLink chat={chatWithoutLastMessage} userId={user._id} />);

    expect(screen.getByText(peer.name)).toBeInTheDocument();
    expect(screen.queryByText(0)).toBeNull();
  });

  test("Should render a variant with the read message", () => {
    render(<ChatLink chat={chatWithReadLastMessage} userId={user._id} />);

    expect(screen.getByText(peer.name)).toBeInTheDocument();
    expect(screen.getByText(3)).toBeInTheDocument();
  });

  test("Should render a variant with an unread message", () => {
    render(<ChatLink chat={chatWithUnreadLastMessage} userId={user._id} />);
  });

  test("Should emit a custom event after the component is held for 2 seconds (mobile)", () => {
    render(<ChatLink chat={chatWithoutLastMessage} userId={user._id} />);

    const mockCallback = jest.fn();
    const chatName = screen.getByText(peer.name);

    fireEvent.touchStart(chatName);
    addEventListener(DELETE_CHAT_EVENT_NAME, mockCallback);

    setTimeout(() => {
      removeEventListener(DELETE_CHAT_EVENT_NAME, mockCallback);
      expect(mockCallback).toBeCalled();
    }, 2000);
  });

  test("Should emit a custom event after right click (desktop)", () => {
    render(<ChatLink chat={chatWithoutLastMessage} />);

    const mockCallback = jest.fn();
    const chatName = screen.getByText(peer.name);

    addEventListener(DELETE_CHAT_EVENT_NAME, mockCallback);
    fireEvent.click(chatName);
    removeEventListener(DELETE_CHAT_EVENT_NAME, mockCallback);

    expect(mockCallback).toBeCalled();
  });
});
