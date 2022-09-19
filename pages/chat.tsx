import { useCallback, useEffect } from "react";

import { Send } from "@mui/icons-material";
import { IconButton, Stack, TextField } from "@mui/material";
import mongoose from "mongoose";
import { GetServerSideProps, NextPage } from "next";

import Header from "src/components/Header";
import ChatModel from "src/models/Chat";
import JWT from "src/utils/JWT";

interface Props {
  chatId: string;
}

const Chat: NextPage<Props> = ({ chatId }) => {
  const onSendClick = useCallback(() => {}, []);

  useEffect(() => {}, []);

  return (
    <>
      <Header variant="chat" />
      <Stack flex={1} overflow="auto" px={2}>
        {new Array(100).fill(null).map((i, index) => (
          <p key={`lol_${index}`}>{index}</p>
        ))}
      </Stack>
      <Stack direction="row" gap={2} px={2}>
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

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  try {
    const { id } = context.query;
    const { accessToken } = context.req.cookies;
    JWT.verifyAccessToken(accessToken as string);

    await mongoose.connect(process.env.MONGODB_HOST as string);

    const chat = await ChatModel.findById(id);

    if (chat)
      return {
        props: {
          chatId: chat.id
        }
      };
    else throw new Error("Chat doesn't exist"); // TODO: redirect to a page that proposes to create a chat
  } catch (e) {
    return {
      redirect: {
        destination: "/m",
        permanent: false
      }
    };
  } finally {
    if (mongoose.connection.readyState === 1) await mongoose.disconnect();
  }
};

export default Chat;
