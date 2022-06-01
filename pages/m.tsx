import { useEffect, useState } from "react";

import { Stack, Typography } from "@mui/material";
import axios from "axios";
import { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";
import { useRouter } from "next/router";

import Header from "src/components/Header";
import { Chat } from "src/types/chat";
import JWT from "src/utils/JWT";

interface Props {
  isAccessTokenValid: boolean;
}

const M: NextPage<Props> = ({ isAccessTokenValid }) => {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [areChatsLoaded, setAreChatsLoaded] = useState(false);

  useEffect(() => {
    async function fetchChats() {
      // TODO: fetching stuff
      const chat: Chat = {
        _id: "624182e7f85bf6faab957ff4",
        peerName: "User 2",
        lastMessage: {
          author: "User 1",
          text: "What's up?",
          createdAt: "2022-06-01T08:13:47.504+00:00",
          updatedAt: "2022-06-01T08:13:47.504+00:00"
        },
        createdAt: "2022-05-01T08:13:47.504+00:00",
        updatedAt: "2022-06-01T08:13:47.504+00:00"
      };

      setTimeout(() => {
        const data: Chat[] = new Array(5)
          .fill(null)
          .map((_, index) => ({ ...chat, name: chat.peerName + (index + 1) }));
        setAreChatsLoaded(true);
        setChats(data);
      }, 3000);
    }

    if (isAccessTokenValid) fetchChats();
  }, [isAccessTokenValid]);

  useEffect(() => {
    async function handler() {
      try {
        // FIXME: refreshToken does NOT work
        const { data } = await axios.put(
          process.env.NEXT_PUBLIC_HOST + "/api/auth/refreshAccess"
        );
        // FIXME: add "domain" field e.g. domain=messenger.proga.site
        document.cookie = `accessToken=${data.accessToken}; path=*; max-age=60*60*24*30`;
      } catch {
        document.cookie =
          "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=*;";
        router.push("/");
      }
    }
    if (!isAccessTokenValid) handler();
  }, [isAccessTokenValid, router]);

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

          <Stack>
            {chats.map(i => (
              <p key={i.peerName}>{i.peerName}</p>
            ))}
          </Stack>
        </>
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async context => {
  class SSRHandler {
    private static accessToken = context.req.cookies.accessToken;
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
        JWT.verifyAccessToken(SSRHandler.accessToken);
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
  return SSRHandler.returnTotalConfig();
};

export default M;
