import { Server } from "socket.io";

import JWT from "src/utils/JWT";

export class SocketServer {
  static createMiddlewares(io: Server) {
    io.use((socket, next) => {
      try {
        JWT.verifyAccessToken(socket.handshake.auth.token);
      } catch (err) {
        socket.emit("refresh_token");
      } finally {
        next();
      }
    });
  }

  static createConnection(io: Server) {
    io.on("connection", async socket => {
      socket.on("lol", data => {
        try {
          JWT.verifyAccessToken(data.token);
          console.log("lol", data.token);
        } catch (err) {
          socket.emit("refresh_token");
        }
      });
    });
  }

  static removeListeners(io: Server) {
    io.removeAllListeners();
  }

  static shouldRestartSocketServer(io: Server) {
    return io && process.env.NODE_ENV === "development";
  }
}
