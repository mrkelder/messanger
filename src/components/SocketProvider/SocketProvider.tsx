import {
  createContext,
  FC,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState
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

  const setUpSocket = useCallback(
    (socket: Socket) => {
      setSocket(socket);

      socket.on("refresh_token", async () => {
        const { data } = await axiosInstance.put(
          process.env.NEXT_PUBLIC_HOST + "/api/auth/refreshAccess"
        );

        Cookie.set("accessToken", data.accessToken);
      });

      socket.emit("join_chats", { token: Cookie.get("accessToken") });
    },
    [axiosInstance]
  );

  useEffect(() => {
    async function connectSocket() {
      closeSocket();
      await axiosInstance.get("/api/socket");
      const innerSocket = io({
        auth: {
          token: Cookie.get("accessToken")
        }
      });

      setUpSocket(innerSocket);
    }

    if (pathname !== "/" && !socket) connectSocket();
    else if (pathname === "/") closeSocket();
  }, [axiosInstance, closeSocket, socket, setUpSocket, pathname]);

  return (
    <socketContext.Provider value={socket}>{children}</socketContext.Provider>
  );
};

export default memo(SocketProvider);
