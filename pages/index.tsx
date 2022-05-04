import { useState, useCallback } from "react";

import type { NextPage } from "next";
import Head from "next/head";

import AuthPageTemplate from "src/components/AuthPageTemplate";
import authContext from "src/contexts/authContext";

const Home: NextPage = () => {
  const [isRegistration, setIsRegistration] = useState(true);
  const { Provider: AuthContext } = authContext;
  const title = isRegistration ? "Registration" : "Authorization";
  const buttonText = isRegistration ? "Sign Up" : "Sign In";
  const linkText = isRegistration
    ? "Have the account already?"
    : "Don't have an account yet?";

  const changePage = useCallback(() => {
    setIsRegistration(prev => !prev);
  }, []);

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
        />
      </AuthContext>
    </>
  );
};

export default Home;
