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
