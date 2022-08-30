import { Server } from "socket.io";

import JWT from "src/utils/JWT";

export class SocketServer {
  static createMiddlewares(io: Server) {
    io.use((socket, next) => {
      try {
        JWT.verifyAccessToken(socket.handshake.auth.token);
        next();
      } catch (err) {
        next(new Error((err as unknown as Error).message));
      }
    });
  }

  static createConnection(io: Server) {
    io.on("connection", async socket => {});
  }

  static removeListeners(io: Server) {
    io.removeAllListeners();
  }

  static shouldRestartSocketServer(io: Server) {
    return io && process.env.NODE_ENV === "development";
  }
}
