import { FC, MouseEventHandler } from "react";

import { Avatar, Box, Button, Stack, Typography } from "@mui/material";

import { DatabaseMessage } from "src/types/db";

interface Props {
  formattedLastMessage: DatabaseMessage;
  countOfUnreadMessages: number;
  shouldDisplayMessageCount: boolean;
  peerName: string;
  messageTime: string;

  touchHoldEmitEvent: () => void;
  removeTouchTimer: () => void;
  navigateToChat: () => void;
  rightClickDeleteChat: MouseEventHandler<HTMLButtonElement>;
}

const View: FC<Props> = ({
  formattedLastMessage,
  countOfUnreadMessages,
  shouldDisplayMessageCount,
  peerName,
  messageTime,
  touchHoldEmitEvent,
  removeTouchTimer,
  navigateToChat,
  rightClickDeleteChat
}) => {
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
      fontWeight="regular"
    >
      {Math.min(countOfUnreadMessages, 99)}
    </Box>
  ) : null;

  return (
    <Button
      onTouchStart={touchHoldEmitEvent}
      onTouchEnd={removeTouchTimer}
      onClick={navigateToChat}
      onContextMenu={rightClickDeleteChat}
      sx={{ textTransform: "none", width: "100%" }}
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
            {messageTime}
          </Typography>
          {messageCountComponent}
        </Stack>
      </Stack>
    </Button>
  );
};

export default View;
