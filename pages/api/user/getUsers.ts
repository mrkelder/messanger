import { NextApiRequest, NextApiResponse } from "next";

import { GetUsersController } from "src/controllers/user";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const controller = new GetUsersController({ req, res });
  await controller.run();
}
