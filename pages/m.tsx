import { useCallback, useEffect, useState } from "react";

import { Close } from "@mui/icons-material";
import { Alert, Snackbar, Stack, Typography, IconButton } from "@mui/material";
import axios from "axios";
import { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import ChatLink from "src/components/ChatLink";
import Header from "src/components/Header";
import { RootState } from "src/store";
import { Chat } from "src/types/chat";
import Cookie from "src/utils/Cookie";
import JWT from "src/utils/JWT";

interface Props {
  isAccessTokenValid: boolean;
}

const M: NextPage<Props> = ({ isAccessTokenValid }) => {
  const router = useRouter();
  const userId = useSelector<RootState>(store => store.user._id) as string;
  const [chats, setChats] = useState<Chat[]>([]);
  const [areChatsLoaded, setAreChatsLoaded] = useState(false);
  const [isAlertOpened, setIsAlertOpened] = useState(false);

  const handleAlertClose = useCallback(() => {
    setIsAlertOpened(false);
  }, []);

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
      } else setIsAlertOpened(true);
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

        Cookie.set("accessToken", data.accessToken);
      } catch {
        Cookie.remove("accessToken");
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

          <Stack style={{ maxHeight: "calc(100vh - 50px)", overflowY: "auto" }}>
            {chats.map(i => (
              <ChatLink key={i._id} chat={i} userId={userId} />
            ))}
          </Stack>
        </>
      )}

      {/* TODO: extract this components to its own file */}
      <Snackbar
        open={isAlertOpened}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          <Stack
            alignItems="center"
            justifyContent="space-between"
            direction="row"
            sx={{ width: "inherit" }}
          >
            <Typography>
              Chats failed to load. Please, reload the page
            </Typography>
            <IconButton
              sx={{ padding: "0", marginLeft: "3px" }}
              onClick={handleAlertClose}
            >
              <Close />
            </IconButton>
          </Stack>
        </Alert>
      </Snackbar>
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
