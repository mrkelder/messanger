import {
  FormEventHandler,
  ChangeEventHandler,
  useCallback,
  useEffect,
  useState,
  useRef
} from "react";

import { Stack, TextField, Button } from "@mui/material";
import axios from "axios";
import { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";
import { useRouter } from "next/router";

import Header from "src/components/Header";
import JWT from "src/utils/JWT";

interface Props {
  isAccessTokenValid: boolean;
}

const NewContact: NextPage<Props> = ({ isAccessTokenValid }) => {
  const router = useRouter();
  const debounceTimer = useRef<NodeJS.Timer | null>(null);
  const [shouldShowResults, setShouldShowResults] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [serachResults, setSerachResults] = useState<
    Array<{
      _id: string;
      name: string;
    }>
  >([]);

  const sendSearchRequest = useCallback(
    (searchInputValue: string) => async () => {
      console.log(searchInputValue);
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
        if (errorMessage.match("401") || errorMessage.match("401")) {
          document.cookie =
            "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=*;";
          router.push("/");
        }
      }
    },
    [router]
  );

  const changeHandler = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ target }) => {
      if (debounceTimer.current) {
        clearInterval(debounceTimer.current);
        debounceTimer.current = null;
      }

      const { value } = target;

      setSearchValue(value);

      debounceTimer.current = setTimeout(sendSearchRequest(value), 1000);
    },
    [sendSearchRequest]
  );

  useEffect(() => {
    async function handler() {
      try {
        // FIXME: refreshToken does NOT work in case you remove accessToken from cookies or it expires
        const { data } = await axios.put(
          process.env.NEXT_PUBLIC_HOST + "/api/auth/refreshAccess"
        );

        console.log(data, " data");

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

        <Stack>
          {serachResults.map(i => (
            <p key={i._id}>{i.name}</p>
          ))}
        </Stack>
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
