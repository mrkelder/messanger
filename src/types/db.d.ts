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
  author: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseChat {
  _id?: string;
  members: Omit<DatabaseUser, "password">[];
  lastMessage?: DatabaseMessage;
  created_at: string;
  updated_at: string;
}
