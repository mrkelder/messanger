import { DatabaseMessage, DatabaseChat } from "./db";

export type Message = Omit<DatabaseMessage, "author"> & {
  author: string;
};

export type Chat = Omit<DatabaseChat, "members" | "lastMessage"> & {
  members: Array<{ _id: string; name: string }>;
  lastMessage?: Message;
};
