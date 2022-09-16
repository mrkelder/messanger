import { FC, useEffect, useState } from "react";

import { Stack } from "@mui/material";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "src/store";
import {
  clear,
  initStoreFromLocalStorage
} from "src/store/reducers/userReducer";
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
    if (!isStoreInitiated) {
      dispatch(initStoreFromLocalStorage());
      setIsStoreInitiated(true);
    }

    if (userStoreDataIsInvalid && !userIsOnTheRootPage && isStoreInitiated) {
      dispatch(clear());
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

  return <Stack height="100vh">{children}</Stack>;
};

export default Layout;
