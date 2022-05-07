import { useState, useCallback } from "react";

import { Close } from "@mui/icons-material";
import { Alert, IconButton, Snackbar, Stack, Typography } from "@mui/material";
import axios from "axios";
import type { NextPage } from "next";
import Head from "next/head";

import AuthPageTemplate from "src/components/AuthPageTemplate";
import { Credentials } from "src/types/auth";

const Home: NextPage = () => {
  const [isRegistration, setIsRegistration] = useState(true);
  const [isAlertOpened, setIsAlertOpened] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Error message");
  const title = isRegistration ? "Registration" : "Authorization";
  const buttonText = isRegistration ? "Sign Up" : "Sign In";
  const linkText = isRegistration
    ? "Have the account already?"
    : "Don't have an account yet?";

  const handleAlertClose = useCallback(() => {
    setIsAlertOpened(false);
  }, []);

  const setAndOpenErrorAlert = (message: string) => {
    setErrorMessage(message);
    setIsAlertOpened(true);
  };

  const registrate = useCallback(async (credentials: Credentials) => {
    try {
      const result = await axios.post(
        process.env.NEXT_PUBLIC_HOST + "/api/auth/registrate",
        credentials
      );

      alert("Congrats");
    } catch ({ response }) {
      const { status } = response as { status: number };
      switch (status) {
        case 409:
          setAndOpenErrorAlert("Such user already exists, try another name");
          break;
        case 500:
          setAndOpenErrorAlert(
            "Server error occured, try to send data once again"
          );
          break;
        default:
          setAndOpenErrorAlert(
            "Some problem occured, try to send data once again"
          );
          break;
      }
    }
  }, []);

  const authorizate = useCallback(async (credentials: Credentials) => {
    try {
      const result = await axios.post(
        process.env.NEXT_PUBLIC_HOST + "/api/auth/authorizate",
        credentials
      );

      alert("Congrats");
    } catch ({ response }) {
      const { status } = response as { status: number };
      switch (status) {
        case 401:
          setAndOpenErrorAlert("Password is not correct");
          break;
        case 404:
          setAndOpenErrorAlert("Such user doesn't exist");
          break;
        case 500:
          setAndOpenErrorAlert(
            "Server error occured, try to send data once again"
          );
          break;
        default:
          setAndOpenErrorAlert(
            "Some problem occured, try to send data once again"
          );
          break;
      }
    }
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

      <AuthPageTemplate
        title={title}
        buttonText={buttonText}
        linkText={linkText}
        callback={callback}
        changePage={changePage}
      />

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
