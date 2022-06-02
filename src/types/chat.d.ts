import { DatabaseMessage, DatabaseChat } from "./db";

export type Message = Omit<DatabaseMessage, "author"> & {
  author: string;
};

export type Chat = Omit<DatabaseChat, "members" | "lastMessage"> & {
  peerName: string;
  lastMessage?: Message;
};
