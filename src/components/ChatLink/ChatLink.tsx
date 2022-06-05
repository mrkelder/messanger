import { FC } from "react";

import { Avatar, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";

import useChat from "src/hooks/useChat";
import { Chat } from "src/types/chat";

interface Props {
  chat: Chat;
  userId: string;
}

const ChatLink: FC<Props> = ({ chat, userId }) => {
  const { getPeerName, formatLastMessage } = useChat(userId);
  const router = useRouter();

  const peerName = getPeerName(chat);
  const formattedLastMessage = formatLastMessage(chat);
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

  function navigateToChat() {
    router.push(`/chat?id=${chat._id}`);
  }

  const lastMessageComponent = formattedLastMessage ? (
    <Typography textOverflow="ellipsis" noWrap>
      {formattedLastMessage.author}: {formattedLastMessage.text}
    </Typography>
  ) : null;

  return (
    <Stack direction="row" onClick={navigateToChat}>
      <Avatar sx={{ bgcolor: "primary.dark", width: "45px", height: "45px" }}>
        {peerName.charAt(0).toUpperCase()}
      </Avatar>

      <Stack marginLeft={1} alignItems="space-between" width="65%">
        <Typography fontWeight="bold" textOverflow="ellipsis" noWrap>
          {peerName}
        </Typography>
        {lastMessageComponent}
      </Stack>

      <Typography fontSize="14px" marginLeft="auto" color="grey.600">
        {returnDate()}
      </Typography>
    </Stack>
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
