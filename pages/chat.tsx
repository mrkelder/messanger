import { useCallback, useEffect, useContext } from "react";

import { Send } from "@mui/icons-material";
import { IconButton, Stack, TextField } from "@mui/material";
import mongoose from "mongoose";
import { GetServerSideProps, NextPage } from "next";

import Header from "src/components/Header";
import { socketContext } from "src/components/SocketProvider";
import ChatModel from "src/models/Chat";
import Cookie from "src/utils/Cookie";
import JWT from "src/utils/JWT";

interface Props {
  chatId: string;
}

const Chat: NextPage<Props> = ({ chatId }) => {
  const socket = useContext(socketContext);

  const onSendClick = useCallback(() => {
    const token = Cookie.get("accessToken");
    socket?.emit("send_message", {
      token,
      message: `My id is ${token}`
    });
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("receive_message", data => {
        console.log(data);
      });
    }
  }, [socket]);

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
    else return { notFound: true }; // TODO: redirect to a page that proposes to create a chat
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
