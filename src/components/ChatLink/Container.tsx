import { FC, MouseEventHandler, useCallback, useRef } from "react";

import { useRouter } from "next/router";

import useChat from "src/hooks/useChat";
import { Chat } from "src/types/chat";
import { DatabaseMessage } from "src/types/db";
import MessageTime from "src/utils/MessageTime";

import { DELETE_CHAT_EVENT_NAME } from "../CONSTANTS";
import View from "./View";

interface Props {
  chat: Chat;
  userId: string;
}

const Container: FC<Props> = ({ chat, userId }) => {
  const { getPeerName, formatLastMessage } = useChat(userId);
  const router = useRouter();
  const touchDeleteChatTimer = useRef<NodeJS.Timeout | null>(null);

  const peerName = getPeerName(chat);
  const formattedLastMessage = formatLastMessage(chat);
  const shouldDisplayMessageCount = chat.lastMessage && !chat.lastMessage.read;
  // TODO: use moment js
  const messageTime = new MessageTime(chat.updated_at);

  const emitDeleteChatEvent = useCallback(() => {
    const customEvent = new Event(DELETE_CHAT_EVENT_NAME);
    dispatchEvent(customEvent);
  }, []);

  const navigateToChat = useCallback(() => {
    router.push(`/chat?id=${chat._id}`);
  }, [chat._id, router]);

  const rightClickDeleteChat: MouseEventHandler<HTMLButtonElement> =
    useCallback(
      event => {
        event.preventDefault();
        emitDeleteChatEvent();
        return false;
      },
      [emitDeleteChatEvent]
    );

  const touchHoldEmitEvent = useCallback(() => {
    touchDeleteChatTimer.current = setTimeout(() => {
      emitDeleteChatEvent();
    }, 1000);
  }, [emitDeleteChatEvent]);

  const removeTouchTimer = useCallback(() => {
    if (touchDeleteChatTimer.current) {
      clearTimeout(touchDeleteChatTimer.current);
      touchDeleteChatTimer.current = null;
    }
  }, []);

  return (
    <View
      formattedLastMessage={formattedLastMessage as DatabaseMessage}
      countOfUnreadMessages={chat.countOfUnreadMessages}
      shouldDisplayMessageCount={!!shouldDisplayMessageCount}
      peerName={peerName}
      messageTime={messageTime.returnMessageISODate()}
      touchHoldEmitEvent={touchHoldEmitEvent}
      removeTouchTimer={removeTouchTimer}
      navigateToChat={navigateToChat}
      rightClickDeleteChat={rightClickDeleteChat}
    />
  );
};

Container.defaultProps = {
  chat: {
    _id: "1",
    members: [
      { _id: "1", name: "user 1" },
      { _id: "2", name: "user 2" }
    ],
    countOfUnreadMessages: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
};

export default Container;
