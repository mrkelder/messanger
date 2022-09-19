import mongoose from "mongoose";
import { Server } from "socket.io";

import Chat from "src/models/Chat";
import JWT from "src/utils/JWT";

export class SocketServer {
  static createMiddlewares(io: Server) {
    io.use((socket, next) => {
      try {
        const { _id } = JWT.verifyAccessToken(socket.handshake.auth.token);
        socket.data.userId = _id;
      } catch (err) {
        socket.emit("refresh_token");
      } finally {
        next();
      }
    });
  }

  static createConnection(io: Server) {
    io.on("connection", async socket => {
      socket.on("create_chat", async data => {
        try {
          const { token, chat } = data;
          JWT.verifyAccessToken(token);
          const sockets = await io.fetchSockets();
          const userId = new mongoose.Types.ObjectId(socket.data.userId);
          const peerId = new mongoose.Types.ObjectId(
            chat.members.find((i: string) => i !== userId.toString())
          );
          const peerSockets = sockets.filter(
            i => i.data.userId === peerId.toString()
          );

          await mongoose.connect(process.env.MONGODB_HOST as string);

          const aggregatedChat = await Chat.aggregate([
            { $match: { members: { $in: [userId, peerId] } } },
            {
              $lookup: {
                from: "messages",
                localField: "_id",
                foreignField: "chatId",
                pipeline: [
                  {
                    $match: {
                      read: false,
                      author: { $ne: userId }
                    }
                  },
                  { $sort: { updated_at: -1 } }
                ],
                as: "messages"
              }
            },
            {
              $lookup: {
                from: "users",
                let: { members: "$members" },
                pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$members"] } } },
                  { $project: { password: 0, __v: 0 } }
                ],
                as: "members"
              }
            },
            {
              $addFields: {
                countOfUnreadMessages: { $size: "$messages" }
              }
            },
            {
              $addFields: { lastMessage: { $arrayElemAt: ["$messages", 0] } }
            },
            { $unset: ["messages"] },
            { $sort: { updated_at: -1 } }
          ]);

          if (peerSockets.length > 0)
            peerSockets.forEach(i => i.emit("add_chat", aggregatedChat[0]));
        } catch (err) {
          socket.emit("refresh_token");
        } finally {
          if (mongoose.connection.readyState === 1) await mongoose.disconnect();
        }
      });

      socket.on("join_chat", async data => {
        try {
          const { token, chatId } = data;
          const { _id } = JWT.verifyAccessToken(token);

          await mongoose.connect(process.env.MONGODB_HOST as string);
          const chat = await Chat.findById(chatId);
          if (chat?.members.includes(_id)) socket.join(chatId);
        } catch (err) {
          socket.emit("refresh_token");
        } finally {
          if (mongoose.connection.readyState === 1) await mongoose.disconnect();
        }
      });

      socket.on("send_message", async data => {
        try {
          const { message, token } = data;
          JWT.verifyAccessToken(token);

          socket.broadcast.emit("receive_message", message);

          await mongoose.connect(process.env.MONGODB_HOST as string);
        } catch (err) {
          socket.emit("refresh_token");
        } finally {
          if (mongoose.connection.readyState === 1) await mongoose.disconnect();
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
