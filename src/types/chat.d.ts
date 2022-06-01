export interface Message {
  _id?: string;
  author: string;
  text: string;
  createdAt: number;
}

export interface Chat {
  _id?: string;
  name: string;
  lastMessage: Message;
  updatedAt: number;
}
