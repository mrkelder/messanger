import { NextPage } from "next";
import Head from "next/head";

import AuthPageTemplate from "src/components/AuthPageTemplate";

const TITLE = "Registration";

const Registration: NextPage = () => {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
      </Head>
      <AuthPageTemplate
        title={TITLE}
        buttonText="Sing Up"
        linkText="Have the account already?"
        linkHref="/authorization"
      />
    </>
  );
};

export default Registration;
