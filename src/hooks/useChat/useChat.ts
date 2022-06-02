import { Chat, Message } from "src/types/chat";

function useChat(_id: string) {
  function getUserName(chat: Chat): string {
    return chat.members.find(i => i._id === _id)?.name as string;
  }

  function getPeerName(chat: Chat): string {
    return chat.members.find(i => i._id !== _id)?.name as string;
  }

  function formatLastMessage(chat: Chat): Message | null {
    const { lastMessage } = chat;

    let result = lastMessage ?? null;

    if (lastMessage) {
      const authorName =
        _id === lastMessage.author ? getUserName(chat) : getPeerName(chat);
      result = { ...lastMessage, author: authorName };
    }

    return result;
  }

  return { getUserName, getPeerName, formatLastMessage };
}

export default useChat;
