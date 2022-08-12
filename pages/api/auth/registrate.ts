import { NextApiRequest, NextApiResponse } from "next";

import { RegistrationController } from "src/controllers/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const controller = new RegistrationController({ req, res });
  await controller.run();
}
