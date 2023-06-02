import { useContext, useEffect, useState } from "react";

import { Stack, Typography } from "@mui/material";
import { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";
import { useSelector } from "react-redux";

import { axiosContext } from "src/components/AxiosProvider";
import ChatLink from "src/components/ChatLink";
import Header from "src/components/Header";
import { socketContext } from "src/components/SocketProvider";
import { RootState } from "src/store";
import { Chat } from "src/types/chat";
import JWT from "src/utils/JWT";

interface Props {
  isAccessTokenValid: boolean;
}

const M: NextPage<Props> = ({ isAccessTokenValid }) => {
  const userId = useSelector<RootState>(store => store.user._id) as string;
  const socketInstance = useContext(socketContext);
  const axiosInstance = useContext(axiosContext);
  const [chats, setChats] = useState<Chat[]>([]);
  const [areChatsLoaded, setAreChatsLoaded] = useState(false);

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("add_chat", (newChat: Chat) => {
        if (!chats.find(i => i._id === newChat._id))
          setChats([newChat, ...chats]);
      });
    }
  }, [socketInstance, chats]);

  useEffect(() => {
    async function fetchChats() {
      try {
        const result = await axiosInstance.get(
          process.env.NEXT_PUBLIC_HOST + "/api/user/getChats",
          { withCredentials: true }
        );

        const chats = result.data as Chat[];
        setAreChatsLoaded(true);
        setChats(chats);
      } finally {
        setAreChatsLoaded(true);
      }
    }

    fetchChats();
  }, [axiosInstance]);

  return (
    <>
      <Header />

      {!areChatsLoaded ? (
        <>
          <Typography>Loading your chats...</Typography>
        </>
      ) : (
        <>
          {chats.length === 0 && <Typography>You have no chats</Typography>}

          <Stack style={{ maxHeight: "calc(100vh - 50px)", overflowY: "auto" }}>
            {chats.map(i => (
              <ChatLink key={i._id} chat={i} userId={userId} />
            ))}
          </Stack>
        </>
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async context => {
  class SSRHandler {
    public static accessToken = context.req.cookies.accessToken;
    private static returnConfig: GetServerSidePropsResult<Props>;

    public static returnTotalConfig(): GetServerSidePropsResult<Props> {
      // FIXME: rename checkAccessToken because returnTotalConfig lies otherwise
      SSRHandler.checkAccessToken();
      return SSRHandler.returnConfig;
    }

    private static checkAccessToken(): void {
      if (SSRHandler.accessToken) SSRHandler.verifyAccessToken();
      else SSRHandler.setRedirectConfig();
    }

    private static setRedirectConfig(): void {
      SSRHandler.returnConfig = {
        redirect: { destination: "/", permanent: false }
      };
    }

    private static verifyAccessToken(): void {
      try {
        JWT.verifyAccessToken(SSRHandler.accessToken as string);
        SSRHandler.setValidAccessTokenConfig();
      } catch {
        SSRHandler.setInvalidAccessTokenConfig();
      }
    }

    private static setValidAccessTokenConfig(): void {
      SSRHandler.returnConfig = { props: { isAccessTokenValid: true } };
    }

    private static setInvalidAccessTokenConfig(): void {
      SSRHandler.returnConfig = { props: { isAccessTokenValid: false } };
    }
  }
  if (!SSRHandler.accessToken)
    return { redirect: { destination: "/", permanent: false } };

  return SSRHandler.returnTotalConfig();
};

export default M;
