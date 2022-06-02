import { useSelector } from "react-redux";

import { RootState } from "src/store";
import { Chat, Message } from "src/types/chat";

function useChat(chat: Chat) {
  const _id = useSelector<RootState>(store => store.user._id);
  const { members, lastMessage } = chat;

  function getUserName(): string {
    return members.find(i => i._id === _id)?.name as string;
  }

  function getPeerName(): string {
    return members.find(i => i._id !== _id)?.name as string;
  }

  function formatLastMessage(): Message | null {
    let result = lastMessage ?? null;

    if (lastMessage) {
      const authorName =
        _id === lastMessage.author ? getUserName() : getPeerName();
      result = { ...lastMessage, author: authorName };
    }

    return result;
  }

  return { getUserName, getPeerName, formatLastMessage };
}

export default useChat;
