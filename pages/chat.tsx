import { useCallback } from "react";

import { Send } from "@mui/icons-material";
import { IconButton, Stack, TextField } from "@mui/material";
import { NextPage } from "next";

import Header from "src/components/Header";

const Chat: NextPage = () => {
  const onSendClick = useCallback(() => {}, []);

  return (
    <>
      <Header variant="chat" />
      <Stack flex={1} overflow="auto">
        {new Array(100).fill(null).map((i, index) => (
          <p key={`lol_${index}`}>{index}</p>
        ))}
      </Stack>
      <Stack direction="row" gap={2} px={4}>
        <TextField fullWidth />
        <IconButton
          onClick={onSendClick}
          color="primary"
          style={{ width: "50px", height: "50px" }}
        >
          <Send />
        </IconButton>
      </Stack>
    </>
  );
};

export default Chat;
