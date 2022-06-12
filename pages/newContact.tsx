import {
  ChangeEventHandler,
  useCallback,
  useState,
  useRef,
  useContext
} from "react";

import { Stack, TextField, Button, Typography, Avatar } from "@mui/material";
import { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";
import { useRouter } from "next/router";

import Header from "src/components/Header";
import AxiosContext from "src/contexts/axiosContext";
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
  const axiosInstance = useContext(AxiosContext);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<ClientUser[]>([]);
  const [isRequestLoading, setIsRequestLoading] =
    useState<boolean | null>(null);

  const requestWasSentOnce = isRequestLoading !== null;
  const requestIsValid = requestWasSentOnce && !isRequestLoading;
  const shouldDisplayResults = requestIsValid && searchResults.length > 0;
  const shouldDisplayNoResults = requestIsValid && searchResults.length === 0;

  const createChat = useCallback(
    (peerId: string) => async () => {
      const { data } = await axiosInstance.post(
        process.env.NEXT_PUBLIC_HOST + "/api/user/createChat",
        { peerId },
        { withCredentials: true }
      );

      router.push(`/chat?id=${data.chatId}`);
    },
    [router, axiosInstance]
  );

  const sendSearchRequest = useCallback(
    (searchInputValue: string) => async () => {
      if (searchInputValue.length === 0) {
        setIsRequestLoading(null);
        return;
      }

      try {
        const { data } = await axiosInstance.get(
          process.env.NEXT_PUBLIC_HOST +
            `/api/user/getUsers?userName=${searchInputValue}`
        );

        setSearchResults(data);
      } catch ({ message }) {
        setSearchResults([]);
      } finally {
        setIsRequestLoading(false);
      }
    },
    [axiosInstance]
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

  return (
    <>
      <Header variant="new-contact" />

      <Stack paddingY={1.5} paddingX={1}>
        <Stack direction="row" gap={1}>
          <TextField
            label="User name"
            type="search"
            variant="outlined"
            fullWidth
            onChange={changeHandler}
            value={searchValue}
          />
        </Stack>

        {shouldDisplayResults && (
          <Stack gap={1}>
            {searchResults.map(i => (
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

  if (!SSRHandler.accessToken)
    return { redirect: { destination: "/", permanent: false } };

  return SSRHandler.returnTotalConfig();
};

export default NewContact;
