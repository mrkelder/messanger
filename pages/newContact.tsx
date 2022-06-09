import {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useState,
  useRef
} from "react";

import { Stack, TextField, Button, Typography, Avatar } from "@mui/material";
import axios from "axios";
import { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";
import { useRouter } from "next/router";

import Header from "src/components/Header";
import JWT from "src/utils/JWT";

interface Props {
  isAccessTokenValid: boolean;
}

interface ClientUser {
  _id: string;
  name: string;
}

const NewContact: NextPage<Props> = ({ isAccessTokenValid }) => {
  const router = useRouter();
  const debounceTimer = useRef<NodeJS.Timer | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [serachResults, setSerachResults] = useState<ClientUser[]>([]);
  const [isRequestLoading, setIsRequestLoading] =
    useState<boolean | null>(null);

  const requestWasSentOnce = isRequestLoading !== null;
  const requestIsValid = requestWasSentOnce && !isRequestLoading;
  const shouldDisplayResults = requestIsValid && serachResults.length > 0;
  const shouldDisplayNoResults = requestIsValid && serachResults.length === 0;

  const createChat = useCallback(
    (peerId: string) => async () => {
      try {
        const { data } = await axios.post(
          process.env.NEXT_PUBLIC_HOST + "/api/user/createChat",
          { peerId },
          { withCredentials: true }
        );

        router.push(`/chat?id=${data.chatId}`);
      } catch ({ message }) {
        // FIXME:
        // const { data } = await axios.put(
        //   process.env.NEXT_PUBLIC_HOST + "/api/auth/refreshAccess"
        // );

        const errorMessage = message as string;
        if (errorMessage.match("404")) setSerachResults([]);
        else {
          document.cookie =
            "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=*;";
          router.push("/");
        }
      }
    },
    [router]
  );

  const sendSearchRequest = useCallback(
    (searchInputValue: string) => async () => {
      if (searchInputValue.length === 0) {
        setIsRequestLoading(null);
        return;
      }

      try {
        // FIXME: refreshToken does NOT work in case you remove accessToken from cookies or it expires
        const { data } = await axios.get(
          process.env.NEXT_PUBLIC_HOST +
            `/api/user/getUsers?userName=${searchInputValue}`
        );

        setSerachResults(data);

        // FIXME: create one class to handle this
        // FIXME: add "domain" field e.g. domain=messenger.proga.site
      } catch ({ message }) {
        const errorMessage = message as string;
        if (errorMessage.match("404")) {
          setSerachResults([]);
        } else {
          document.cookie =
            "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=*;";
          router.push("/");
        }
      } finally {
        setIsRequestLoading(false);
      }
    },
    [router]
  );

  const changeHandler = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ target }) => {
      if (!isRequestLoading) setIsRequestLoading(true);

      if (debounceTimer.current) {
        clearInterval(debounceTimer.current);
        debounceTimer.current = null;
      }

      const { value } = target;

      setSearchValue(value);

      debounceTimer.current = setTimeout(sendSearchRequest(value), 1000);
    },
    [sendSearchRequest, isRequestLoading]
  );

  useEffect(() => {
    // FIXME: DO NOT SEND rereshAccessToken request multiple times!
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
      <Header variant="new-contact" />

      <Stack paddingY={1.5} paddingX={1}>
        <Stack direction="row" gap={1}>
          <TextField
            id="standard-search"
            label="Search field"
            type="search"
            variant="outlined"
            fullWidth
            onChange={changeHandler}
            value={searchValue}
          />
        </Stack>

        {shouldDisplayResults && (
          <Stack gap={1}>
            {serachResults.map(i => (
              <Button
                key={i._id}
                onClick={createChat(i._id)}
                sx={{ textTransform: "none", width: "100%" }}
              >
                <Stack
                  direction="row"
                  width="100%"
                  paddingX={0.25}
                  paddingY={0.5}
                  gap={1}
                  alignItems="center"
                  sx={{ cursor: "pointer" }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "primary.dark",
                      width: "45px",
                      height: "45px"
                    }}
                  >
                    {i.name.charAt(0).toUpperCase()}
                  </Avatar>

                  <Typography
                    fontWeight="bold"
                    textOverflow="ellipsis"
                    color="black"
                    noWrap
                  >
                    {i.name}
                  </Typography>
                </Stack>
              </Button>
            ))}
          </Stack>
        )}

        {shouldDisplayNoResults && <Typography>No results</Typography>}

        {isRequestLoading && <Typography>Loading...</Typography>}
      </Stack>
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

export default NewContact;
