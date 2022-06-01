import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

import Chat from "src/models/Chat";
import JWT from "src/utils/JWT";
import RequestHelper from "src/utils/RequestHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const requestHelper = new RequestHelper(req);

  if (requestHelper.isGET()) {
    const { accessToken } = req.cookies;

    if (accessToken) {
      try {
        const data = JWT.verifyAccessToken(accessToken);
        try {
          await mongoose.connect(process.env.MONGODB_HOST as string);
          const _id = new mongoose.Types.ObjectId(data._id);
          const chats = await Chat.find({ members: { $in: _id } });
          res.json(chats);
        } catch (e) {
          res.status(503).send("Database is not available at the moment");
        } finally {
          if (mongoose.connection.readyState === 1) await mongoose.disconnect();
        }
      } catch (err) {
        res.status(403).send("Access token is expired");
      }
    } else {
      res.status(401).send("Access token is not specified");
    }
  } else {
    res.status(405).send("This endpoint only accepts GET method");
  }
}
