import { NextApiRequest, NextApiResponse } from "next";

import { GetMessagesController } from "src/controllers/chat";
import JWT from "src/utils/JWT";
import RequestHelper from "src/utils/RequestHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { chatId, messagesOffset } = req.query;
    const requestHelper = new RequestHelper(req);
    if (!requestHelper.isGET()) {
      res.status(405).send("Invalid http method");
      return;
    }
    JWT.verifyAccessToken(req.cookies.accessToken as string);

    const controller = new GetMessagesController({
      chatId: chatId as string,
      messagesOffset: Number(messagesOffset)
    });

    res.json(await controller.run());
  } catch {
    res.status(500).send("Server error");
  }
}
