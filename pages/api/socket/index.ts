import { Server as NetServer } from "http";

import { NextApiRequest } from "next";
import { Server } from "socket.io";

import { NextApiResponseServerIO, SocketServer } from "src/controllers/socket";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function hanlder(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  const ioServer = res.socket.server.io;

  if (!ioServer) {
    const httpServer = res.socket.server;
    const io = new Server(httpServer as unknown as NetServer);
    SocketServer.createMiddlewares(io);
    SocketServer.createConnection(io);
    res.socket.server.io = io;
  } else if (SocketServer.shouldRestartSocketServer(ioServer)) {
    SocketServer.removeListeners(ioServer);
    SocketServer.createConnection(ioServer);
  }

  res.end();
}
