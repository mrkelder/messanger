import { FC } from "react";

import { Avatar, Stack, Typography } from "@mui/material";

interface Props {
  date: Date;
  authorName: string;
  text: string;
}

const Message: FC<Props> = ({ authorName, date, text }) => {
  const messageTime = Intl.DateTimeFormat("en-US", {
    timeStyle: "short"
  }).format(date);

  return (
    <Stack py={1} gap={1} direction="row">
      <Avatar sx={{ color: "white", bgcolor: "primary.dark" }}>
        {authorName.charAt(0).toUpperCase()}
      </Avatar>
      <Stack>
        <Typography fontWeight={600}>{authorName}</Typography>
        <Typography sx={{ wordBreak: "break-word" }}>{text}</Typography>
      </Stack>
      <Typography mr={0} ml="auto">
        {messageTime}
      </Typography>
    </Stack>
  );
};

Message.defaultProps = {
  date: new Date("0"),
  authorName: "User",
  text: "text"
};

export default Message;
