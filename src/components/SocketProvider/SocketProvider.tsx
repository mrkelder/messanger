import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useState,
  memo
} from "react";

import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";

import { axiosContext } from "src/components/AxiosProvider";
import Cookie from "src/utils/Cookie";

type SocketState = Socket | null;

interface Props {
  children: React.ReactNode;
}

export const socketContext = createContext<SocketState>(null);

const SocketProvider: FC<Props> = ({ children }) => {
  const [socket, setSocket] = useState<SocketState>(null);

  const { pathname } = useRouter();
  const axiosInstance = useContext(axiosContext);

  const closeSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [socket]);

  useEffect(() => {
    async function connectSocket() {
      closeSocket();
      await axiosInstance.get("/api/socket");
      const innerSocket = io({
        auth: {
          token: Cookie.get("accessToken")
        }
      });

      innerSocket.on("connect_error", () => {
        console.log("Should update the accessToken");
      });

      setSocket(innerSocket);
    }

    if (pathname !== "/" && !socket) connectSocket();
    else if (pathname === "/") closeSocket();

    return () => {
      closeSocket();
    };
  }, [axiosInstance, pathname, closeSocket, socket]);

  return (
    <socketContext.Provider value={socket}>{children}</socketContext.Provider>
  );
};

export default memo(SocketProvider);
