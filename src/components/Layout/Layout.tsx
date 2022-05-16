import { FC, useEffect } from "react";

import { useDispatch } from "react-redux";

import { initStoreFromLocalStorage } from "src/store/reducers/userReducer";

interface Props {
  children?: React.ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initStoreFromLocalStorage());
  }, [dispatch]);

  return <>{children}</>;
};

export default Layout;
