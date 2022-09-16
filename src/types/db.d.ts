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
  read: boolean;
  created_at: string;
  updated_at: string;
  chatId: string;
}

export interface DatabaseChat {
  _id?: string;
  members: string[];
  created_at: string;
  updated_at: string;
}
