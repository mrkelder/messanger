import { NextApiRequest, NextApiResponse } from "next";

import { CreateChatController } from "src/controllers/user";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const controller = new CreateChatController({ req, res });
  await controller.run();
}
