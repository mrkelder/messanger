import { FC, useEffect, useState } from "react";

import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "src/store";
import { initStoreFromLocalStorage } from "src/store/reducers/userReducer";
import Cookie from "src/utils/Cookie";

interface Props {
  children?: React.ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const userName = useSelector<RootState>(
    store => store.user.userName
  ) as string;
  const _id = useSelector<RootState>(store => store.user._id) as string;
  const [isStoreInitiated, setIsStoreInitiated] = useState(false);

  const userStoreDataIsInvalid = userName.length === 0 || _id.length === 0;
  const userIsOnTheRootPage = router.pathname === "/";

  useEffect(() => {
    const isRefreshAccessPath = router.pathname === "/api/auth/refreshAccess";

    const responseErrorInterceptor = async (error: AxiosError) => {
      if (!userIsOnTheRootPage && !isRefreshAccessPath) {
        const { message } = error;
        try {
          if (message.match("401") || message.match("403")) {
            const { data } = await axios.put(
              process.env.NEXT_PUBLIC_HOST + "/api/auth/refreshAccess"
            );

            Cookie.set("accessToken", data.accessToken);
          }
        } catch {
          Cookie.remove("accessToken");
          router.push("/");
        } finally {
          return Promise.reject(error);
        }
      }
    };

    const interceptor = axios.interceptors.response.use(repsonse => {
      return repsonse;
    }, responseErrorInterceptor);

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [router, userIsOnTheRootPage]);

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
