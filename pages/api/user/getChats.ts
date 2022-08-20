import { NextApiRequest, NextApiResponse } from "next";

import { GetChatsController } from "src/controllers/user";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const controller = new GetChatsController({ req, res });
  await controller.run();
}
