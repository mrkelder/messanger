import { FC, useRef } from "react";

import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";

import useChat from "src/hooks/useChat";
import { Chat } from "src/types/chat";

import { DELETE_CHAT_EVENT_NAME } from "../CONSTANTS";
interface Props {
  chat: Chat;
  userId: string;
}

const ChatLink: FC<Props> = ({ chat, userId }) => {
  const { getPeerName, formatLastMessage } = useChat(userId);
  const router = useRouter();
  const touchDeleteChatTimer = useRef<NodeJS.Timeout | null>(null);

  const peerName = getPeerName(chat);
  const formattedLastMessage = formatLastMessage(chat);
  const shouldDisplayMessageCount = chat.lastMessage && !chat.lastMessage.read;
  // TODO: use moment js
  const currentDate = new Date();
  const updateDate = new Date(chat.updated_at);

  // TODO: extract this logic to its own utility

  function returnMonthName(monthIndex: number): string {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    return monthNames[monthIndex];
  }

  function returnDate(): string {
    const yearsAreEqual =
      currentDate.getFullYear() === updateDate.getFullYear();
    const monthsAreEqual = currentDate.getMonth() === updateDate.getMonth();
    const daysAreEqual = currentDate.getDate() === updateDate.getDate();
    const messageIsMoreThanOneYearsOld =
      currentDate.getFullYear() > updateDate.getFullYear();

    const shouldReturnMessageTime =
      yearsAreEqual && monthsAreEqual && daysAreEqual;

    const shouldReturnMessageDate =
      !shouldReturnMessageTime && !messageIsMoreThanOneYearsOld;

    const shouldReturnMessageYear = messageIsMoreThanOneYearsOld;

    // TODO: print the month like "Apr" - april

    if (shouldReturnMessageTime)
      return `${updateDate.getHours()}:${updateDate.getMinutes()}`;
    else if (shouldReturnMessageDate)
      return `${updateDate.getDate()} ${returnMonthName(
        updateDate.getMonth()
      )}`;
    else if (shouldReturnMessageYear) return String(updateDate.getFullYear());
    else return "Err";
  }

  function emitDeleteChatEvent() {
    // FIXME: useCallback
    const customEvent = new Event(DELETE_CHAT_EVENT_NAME);
    dispatchEvent(customEvent);
  }

  function navigateToChat() {
    // FIXME: useCallback
    router.push(`/chat?id=${chat._id}`);
  }

  function rightClickDeleteChat(event) {
    // FIXME: useCallback
    event.preventDefault();
    emitDeleteChatEvent();
    return false;
  }

  function touchHoldEmitEvent(event) {
    // FIXME: useCallback
    touchDeleteChatTimer.current = setTimeout(() => {
      emitDeleteChatEvent();
    }, 1000);
  }

  function removeTouchTimer() {
    if (touchDeleteChatTimer.current) {
      clearTimeout(touchDeleteChatTimer.current);
      touchDeleteChatTimer.current = null;
    }
  }

  const lastMessageComponent = formattedLastMessage ? (
    <Typography
      color="black"
      textOverflow="ellipsis"
      noWrap
      width="100%"
      align="left"
    >
      {formattedLastMessage.author}: {formattedLastMessage.text}
    </Typography>
  ) : null;

  const messageCountComponent = shouldDisplayMessageCount ? (
    <Box
      bgcolor="success.light"
      width="20px"
      height="20px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      borderRadius="50%"
      color="white"
      fontSize="12px"
    >
      {/* FIXME: here should be only countOfUnreadMessage, fix your API and get back */}
      {Math.min(chat.countOfUnreadMessages ?? 1, 99)}
    </Box>
  ) : null;

  return (
    <Button
      onTouchStart={touchHoldEmitEvent}
      onTouchEnd={removeTouchTimer}
      onClick={navigateToChat}
      onContextMenu={rightClickDeleteChat}
      sx={{ textTransform: "none" }}
    >
      <Stack
        direction="row"
        width="100%"
        paddingX={0.25}
        paddingY={0.5}
        sx={{ cursor: "pointer" }}
      >
        <Avatar sx={{ bgcolor: "primary.dark", width: "45px", height: "45px" }}>
          {peerName.charAt(0).toUpperCase()}
        </Avatar>

        <Stack
          marginLeft={1}
          alignItems="start"
          justifyContent="space-between"
          color="black"
          sx={{ width: "65%" }}
        >
          <Typography fontWeight="bold" textOverflow="ellipsis" noWrap>
            {peerName}
          </Typography>
          {lastMessageComponent}
        </Stack>

        <Stack
          marginLeft="auto"
          alignItems="end"
          justifyContent="space-between"
          sx={{ width: "max-content" }}
        >
          <Typography fontSize="14px" color="grey.600">
            {returnDate()}
          </Typography>
          {messageCountComponent}
        </Stack>
      </Stack>
    </Button>
  );
};

ChatLink.defaultProps = {
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

export default ChatLink;
