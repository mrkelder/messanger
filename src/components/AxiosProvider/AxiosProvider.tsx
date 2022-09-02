import React, { FC, createContext, useEffect, useRef } from "react";

import axios, { AxiosError, AxiosInstance } from "axios";
import router from "next/router";
import { useDispatch } from "react-redux";

import useIsRootPage from "src/hooks/useIsRootPage";
import { clear } from "src/store/reducers/userReducer";
import Cookie from "src/utils/Cookie";

interface Props {
  children: React.ReactNode;
}

export const axiosContext = createContext<AxiosInstance>(axios.create());

const AxiosProvider: FC<Props> = ({ children }) => {
  const isAxiosInterceptorAssigned = useRef(false);
  const dispatch = useDispatch();
  const { isRootPage } = useIsRootPage();
  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_HOST,
    timeout: 100000,
    params: {}
  });

  useEffect(() => {
    async function responseErrorInterceptor(error: AxiosError) {
      if (!isRootPage) {
        const { message, config } = error;

        const isRefreshTokenUrl = !!config.url?.match(
          "/api/auth/refreshAccess"
        );
        const isForbiddenTokenStatusCode =
          message.match("401") || message.match("403");

        if (isForbiddenTokenStatusCode && !isRefreshTokenUrl) {
          try {
            const { data } = await axiosInstance.put(
              process.env.NEXT_PUBLIC_HOST + "/api/auth/refreshAccess"
            );

            Cookie.set("accessToken", data.accessToken);
            return await axiosInstance(config);
          } catch ({ message }) {
            const errorMessage = message as string;
            if (errorMessage.match("401") || errorMessage.match("403")) {
              dispatch(clear());
              Cookie.remove("accessToken");
              router.push("/");
              return Promise.reject(error);
            }
          }
        }
      }

      return Promise.reject(error);
    }

    if (!isAxiosInterceptorAssigned.current) {
      axiosInstance.interceptors.response.use(async function (repsonse) {
        return repsonse;
      }, responseErrorInterceptor);

      isAxiosInterceptorAssigned.current = true;
    }
  }, [axiosInstance, dispatch, isRootPage]);

  return (
    <axiosContext.Provider value={{} as any}>{children}</axiosContext.Provider>
  );
};

export default AxiosProvider;
