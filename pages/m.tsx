import { useEffect } from "react";

import axios from "axios";
import { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";
import { useRouter } from "next/router";

import Header from "src/components/Header";
import JWT from "src/utils/JWT";

interface Props {
  isAccessTokenValid: boolean;
}

const M: NextPage<Props> = ({ isAccessTokenValid }) => {
  const router = useRouter();

  useEffect(() => {
    async function handler() {
      try {
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
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async context => {
  class SSRHandler {
    private static accessToken = context.req.cookies.accessToken;
    private static returnConfig: GetServerSidePropsResult<Props>;

    public static returnTotalConfig(): GetServerSidePropsResult<Props> {
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
