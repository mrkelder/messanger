import { DatabaseMessage, DatabaseChat } from "./db";

export type Chat = Omit<DatabaseChat, "members"> & {
  members: Array<{ _id: string; name: string }>;
  countOfUnreadMessages: number;
};
