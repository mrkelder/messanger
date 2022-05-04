import { NextPage } from "next";
import Head from "next/head";

import AuthPageTemplate from "src/components/AuthPageTemplate";

const TITLE = "Authorization";

const Registration: NextPage = () => {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
      </Head>
      <AuthPageTemplate
        title={TITLE}
        buttonText="Sing In"
        linkText="Don't have an account yet?"
        linkHref="/registration"
      />
    </>
  );
};

export default Registration;
