import { NextApiRequest, NextApiResponse } from "next";

import { RefreshAccessController } from "src/controllers/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const controller = new RefreshAccessController({ req, res });
  await controller.run();
}
