import { useState, useCallback } from "react";

import { Close } from "@mui/icons-material";
import { Alert, IconButton, Snackbar, Stack, Typography } from "@mui/material";
import axios from "axios";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import AuthPageTemplate from "src/components/AuthPageTemplate";
import { setUserData } from "src/store/reducers/userReducer";
import { Credentials } from "src/types/auth";
import Cookie from "src/utils/Cookie";

const Home: NextPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
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

  const saveAccessTokenInCookies = (accessToken: string) => {
    Cookie.set("accessToken", accessToken);
  };

  const registrate = useCallback(
    async (credentials: Credentials) => {
      try {
        setIsSubmitDisabled(true);
        const { data } = await axios.post(
          process.env.NEXT_PUBLIC_HOST + "/api/auth/registrate",
          credentials
        );

        saveAccessTokenInCookies(data.accessToken);
        dispatch(setUserData({ userName: credentials.name, _id: data._id }));
        router.push("/m");
      } catch ({ response }) {
        setIsSubmitDisabled(false);
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
    },
    [dispatch, router]
  );

  const authorizate = useCallback(
    async (credentials: Credentials) => {
      try {
        setIsSubmitDisabled(true);
        const { data } = await axios.post(
          process.env.NEXT_PUBLIC_HOST + "/api/auth/authorizate",
          credentials
        );

        saveAccessTokenInCookies(data.accessToken);
        dispatch(setUserData({ userName: credentials.name, _id: data._id }));
        router.push("/m");
      } catch ({ response }) {
        setIsSubmitDisabled(false);
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
    },
    [dispatch, router]
  );

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
        isSubmitDisabled={isSubmitDisabled}
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

export const getServerSideProps: GetServerSideProps = async context => {
  const { accessToken } = context.req.cookies;

  if (accessToken) return { redirect: { destination: "/m", permanent: false } };

  return { props: {} };
};

export default Home;
