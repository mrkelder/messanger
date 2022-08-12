import { NextApiRequest, NextApiResponse } from "next";

import { AuthorizationController } from "src/controllers/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const controller = new AuthorizationController({ req, res });
  await controller.run();
}
