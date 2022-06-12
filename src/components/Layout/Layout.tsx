import { FC, useContext, useEffect, useRef, useState } from "react";

import { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import AxiosInstance from "src/contexts/axiosContext";
import { RootState } from "src/store";
import { initStoreFromLocalStorage } from "src/store/reducers/userReducer";
import Cookie from "src/utils/Cookie";

interface Props {
  children?: React.ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  const isAxiosInterceptorAssigned = useRef(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const axiosInstance = useContext(AxiosInstance);
  const userName = useSelector<RootState>(
    store => store.user.userName
  ) as string;
  const _id = useSelector<RootState>(store => store.user._id) as string;
  const [isStoreInitiated, setIsStoreInitiated] = useState(false);

  const userStoreDataIsInvalid = userName.length === 0 || _id.length === 0;
  const userIsOnTheRootPage = router.pathname === "/";

  useEffect(() => {
    async function responseErrorInterceptor(error: AxiosError) {
      if (!userIsOnTheRootPage) {
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
          } catch {
            Cookie.remove("accessToken");
            router.push("/");
          } finally {
            return Promise.reject(error);
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
  }, [router, userIsOnTheRootPage, axiosInstance]);

  useEffect(() => {
    if (!isStoreInitiated) {
      dispatch(initStoreFromLocalStorage());
      setIsStoreInitiated(true);
    }

    if (userStoreDataIsInvalid && !userIsOnTheRootPage && isStoreInitiated) {
      Cookie.remove("accessToken");
      router.push("/");
      return;
    }
  }, [
    dispatch,
    userStoreDataIsInvalid,
    userIsOnTheRootPage,
    router,
    isStoreInitiated
  ]);

  return <>{children}</>;
};

export default Layout;
