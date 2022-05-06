import { useState, useCallback } from "react";

import axios from "axios";
import type { NextPage } from "next";
import Head from "next/head";

import AuthPageTemplate from "src/components/AuthPageTemplate";
import authContext from "src/contexts/authContext";
import { Credentials } from "src/types/auth";

const Home: NextPage = () => {
  const [isRegistration, setIsRegistration] = useState(true);
  const { Provider: AuthContext } = authContext;
  const title = isRegistration ? "Registration" : "Authorization";
  const buttonText = isRegistration ? "Sign Up" : "Sign In";
  const linkText = isRegistration
    ? "Have the account already?"
    : "Don't have an account yet?";

  const registrate = useCallback(async (credentials: Credentials) => {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_HOST + "/api/auth/registrate",
      credentials
    );

    console.log(result);
  }, []);

  const authorizate = useCallback(async (credentials: Credentials) => {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_HOST + "/api/auth/authorizate",
      credentials
    );

    console.log(result);
  }, []);

  const changePage = useCallback(() => {
    setIsRegistration(prev => !prev);
  }, []);

  const callback = isRegistration ? registrate : authorizate;

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <AuthContext value={{ changePage }}>
        <AuthPageTemplate
          title={title}
          buttonText={buttonText}
          linkText={linkText}
          callback={callback}
        />
      </AuthContext>
    </>
  );
};

export default Home;
