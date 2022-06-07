import { FC, useEffect, useState } from "react";

import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "src/store";
import { initStoreFromLocalStorage } from "src/store/reducers/userReducer";

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
      // FIXME: create one class to handle this
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=*;";
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
