import { useEffect, useState } from "react";

import { Stack, Typography } from "@mui/material";
import axios from "axios";
import { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import Header from "src/components/Header";
import useChat from "src/hooks/useChat";
import { RootState } from "src/store";
import { Chat } from "src/types/chat";
import JWT from "src/utils/JWT";

interface Props {
  isAccessTokenValid: boolean;
}

const M: NextPage<Props> = ({ isAccessTokenValid }) => {
  const router = useRouter();
  const userName = useSelector<RootState>(
    store => store.user.userName
  ) as string;
  const _id = useSelector<RootState>(store => store.user._id) as string;
  const { getPeerName } = useChat(_id);
  const [chats, setChats] = useState<Chat[]>([]);
  const [areChatsLoaded, setAreChatsLoaded] = useState(false);
  const [isRequestFailed, setIsRequestFailed] = useState(true);

  useEffect(() => {
    async function fetchChats() {
      const result = await axios.get(
        process.env.NEXT_PUBLIC_HOST + "/api/user/getChats",
        { withCredentials: true }
      );

      if (result.status === 200) {
        const chats = result.data as Chat[];

        setAreChatsLoaded(true);
        setChats(chats);
      } else setIsRequestFailed(true);
    }

    if (isAccessTokenValid) fetchChats();
  }, [isAccessTokenValid]);

  useEffect(() => {
    async function handler() {
      try {
        // FIXME: refreshToken does NOT work in case you remove accessToken from cookies or it expires
        const { data } = await axios.put(
          process.env.NEXT_PUBLIC_HOST + "/api/auth/refreshAccess"
        );
        // FIXME: create one class to handle this
        // FIXME: add "domain" field e.g. domain=messenger.proga.site
        document.cookie =
          "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=*;";
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

      {isRequestFailed && (
        <Typography>Chats failed to load. Please, reload the page</Typography>
      )}

      {!areChatsLoaded ? (
        <>
          <Typography>Loading your chats...</Typography>
        </>
      ) : (
        <>
          {chats.length === 0 && <Typography>You have no chats</Typography>}

          <Stack>
            {chats.map(i => (
              <p key={i._id}>{getPeerName(i)}</p>
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
