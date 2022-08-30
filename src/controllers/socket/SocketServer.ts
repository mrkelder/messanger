import { Server } from "socket.io";

export class SocketServer {
  static createConnection(io: Server) {
    io.on("connection", async () => {});
  }

  static removeListeners(io: Server) {
    io.removeAllListeners();
  }

  static shouldRestartSocketServer(io: Server) {
    return io && process.env.NODE_ENV === "development";
  }
}
