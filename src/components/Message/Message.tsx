import { FC } from "react";

import { Avatar, Stack, Typography } from "@mui/material";

interface Props {
  dateString: string;
  authorName: string;
  text: string;
}

const Message: FC<Props> = ({ authorName, dateString, text }) => {
  const date = Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(
    new Date(dateString)
  );

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
        {date}
      </Typography>
    </Stack>
  );
};

Message.defaultProps = {
  dateString: new Date("0").toISOString(),
  authorName: "User",
  text: "text"
};

export default Message;
