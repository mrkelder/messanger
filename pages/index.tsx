import { useState, useCallback } from "react";

import { Close } from "@mui/icons-material";
import { Alert, IconButton, Snackbar, Stack, Typography } from "@mui/material";
import axios from "axios";
import type { NextPage } from "next";
import Head from "next/head";

import AuthPageTemplate from "src/components/AuthPageTemplate";
import authContext from "src/contexts/authContext";
import { Credentials } from "src/types/auth";

const Home: NextPage = () => {
  const [isRegistration, setIsRegistration] = useState(true);
  const [isAlertOpened, setIsAlertOpened] = useState(true);
  const [errorMessage, setErrorMessage] = useState("Error message");
  const { Provider: AuthContext } = authContext;
  const title = isRegistration ? "Registration" : "Authorization";
  const buttonText = isRegistration ? "Sign Up" : "Sign In";
  const linkText = isRegistration
    ? "Have the account already?"
    : "Don't have an account yet?";

  const handleAlertClose = () => {
    setIsAlertOpened(false);
  };

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
            <Typography>{errorMessage}</Typography>
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

export default Home;
