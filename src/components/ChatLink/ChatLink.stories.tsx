import { ComponentStory, ComponentMeta } from "@storybook/react";

import { Chat } from "src/types/chat";

import ChatLink from "./index";

import "styles/globals.css";

const TEST_DATE = 1654533034977;

const user = { _id: "62971fbbd30a2af25d278kf2", name: "Texas" };
const peer = { _id: "1s971fbbd30cnaf25d278kgz", name: "Cali" };

const userId = user._id;

const testCurrentDayDate = new Date(TEST_DATE);
const testCurrentDay = testCurrentDayDate.toISOString();

const testPreviousDayDate = new Date(TEST_DATE);
testPreviousDayDate.setDate(testCurrentDayDate.getDate() - 1);
const testPreviousDay = testPreviousDayDate.toISOString();

const testPreviousMonthDate = new Date(TEST_DATE);
testPreviousMonthDate.setMonth(testCurrentDayDate.getMonth() - 1);
const testPreviousMonth = testPreviousMonthDate.toISOString();

const testPreviousYearDate = new Date(TEST_DATE);
testPreviousYearDate.setFullYear(testCurrentDayDate.getFullYear() - 1);
const testPreviousYear = testPreviousYearDate.toISOString();

const chat: Chat = {
  _id: "12341fbbd30cnaf25d278kgz",
  members: [user, peer],
  countOfUnreadMessages: 0,
  created_at: "2022-01-01T08:13:47.504+00:00",
  updated_at: "2022-01-01T08:13:47.504+00:00"
};

const chatWithReadMessages: Chat = {
  ...chat,
  lastMessage: {
    author: user._id,
    read: true,
    text: "Hello, how are you doing? I'd like to ask you if you're ready for the interview",
    chatId: chat._id as string,
    created_at: "2022-01-01T10:13:47.504+00:00",
    updated_at: "2022-01-01T10:13:25.504+00:00"
  },
  countOfUnreadMessages: 3
};

const chatWithUnreadMessages: Chat = {
  ...chatWithReadMessages,
  lastMessage: {
    author: user._id,
    read: false,
    text: "Hello, how are you doing? I'd like to ask you if you're ready for the interview",
    chatId: chat._id as string,
    created_at: "2022-01-01T10:13:47.504+00:00",
    updated_at: "2022-01-01T10:13:25.504+00:00"
  }
};

const chatWith150UnreadMessages: Chat = {
  ...chatWithReadMessages,
  lastMessage: {
    author: user._id,
    read: false,
    text: "Hello, how are you doing? I'd like to ask you if you're ready for the interview",
    chatId: chat._id as string,
    created_at: "2022-01-01T10:13:47.504+00:00",
    updated_at: "2022-01-01T10:13:25.504+00:00"
  },
  countOfUnreadMessages: 150
};

const chatFromCurrentDay: Chat = {
  ...chatWithReadMessages,
  lastMessage: {
    ...chatWithReadMessages.lastMessage,
    created_at: testCurrentDay,
    updated_at: testCurrentDay
  } as Chat["lastMessage"],
  updated_at: testCurrentDay
};

const chatFromPreviousDay: Chat = {
  ...chatWithReadMessages,
  lastMessage: {
    ...chatWithReadMessages.lastMessage,
    created_at: testPreviousDay,
    updated_at: testPreviousDay
  } as Chat["lastMessage"],
  updated_at: testPreviousDay
};

const chatFromPreviousMonth: Chat = {
  ...chatWithReadMessages,
  lastMessage: {
    ...chatWithReadMessages.lastMessage,
    created_at: testPreviousMonth,
    updated_at: testPreviousMonth
  } as Chat["lastMessage"],
  updated_at: testPreviousMonth
};

const chatFromPreviousYear: Chat = {
  ...chatWithReadMessages,
  lastMessage: {
    ...chatWithReadMessages.lastMessage,
    created_at: testPreviousYear,
    updated_at: testPreviousYear
  } as Chat["lastMessage"],
  updated_at: testPreviousYear
};

const argTypes = {
  chat: {
    control: {
      type: null
    }
  },
  userId: {
    control: {
      type: null
    }
  }
};

export default {
  title: "ChatLink",
  component: ChatLink,
  parameters: {
    layout: "fullscreen",
    chromatic: {
      viewports: [320, 768, 1024]
    }
  },
  decorators: [
    Story => (
      <div style={{ height: "100vh" }}>
        <Story />
      </div>
    )
  ],
  argTypes
} as ComponentMeta<typeof ChatLink>;

const Template: ComponentStory<typeof ChatLink> = args => (
  <ChatLink {...args} />
);

export const EmptyChat = Template.bind({});
EmptyChat.args = {
  chat,
  userId
};

export const ReadChat = Template.bind({});
ReadChat.args = {
  chat: chatWithReadMessages,
  userId
};

export const UnreadChat = Template.bind({});
UnreadChat.args = {
  chat: chatWithUnreadMessages,
  userId
};

export const UnreadChatWith150Messages = Template.bind({});
UnreadChatWith150Messages.args = {
  chat: chatWith150UnreadMessages,
  userId
};

const tempDateNow = Date.now.bind({});
Date.now = () => TEST_DATE;

export const ChatFromCurrentDay = Template.bind({});
ChatFromCurrentDay.args = {
  chat: chatFromCurrentDay,
  userId
};

export const ChatFromPreviousDay = Template.bind({});
ChatFromPreviousDay.args = {
  chat: chatFromPreviousDay,
  userId
};

export const ChatFromPreviousMonth = Template.bind({});
ChatFromPreviousMonth.args = {
  chat: chatFromPreviousMonth,
  userId
};

export const ChatFromPreviousYear = Template.bind({});
ChatFromPreviousYear.args = {
  chat: chatFromPreviousYear,
  userId
};

Date.now = tempDateNow;
