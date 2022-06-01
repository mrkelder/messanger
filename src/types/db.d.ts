export interface DatabaseUser {
  _id?: string;
  name: string;
  password: string;
}

export interface DatabseRefreshToken {
  _id?: string;
  token: string;
  userId: string;
}

export interface DatabaseMessage {
  _id?: string;
  author: Omit<DatabaseUser, "password">;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseChat {
  _id?: string;
  members: Omit<DatabaseUser, "password">[];
  lastMessage: DatabaseMessage;
  createdAt: string;
  updatedAt: string;
}
