import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

import User from "src/models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method?.toLocaleLowerCase() === "post") {
    try {
      const { name, password } = JSON.parse(req.body);

      if (!name || !password) {
        res.status(403).send("Either name or password was not provided");
        return;
      }

      await mongoose.connect(process.env.MONGODB_HOST as string);

      const lookUpUsers = await User.findByName(name);

      if (lookUpUsers.length > 0) {
        const [lookUpUser] = lookUpUsers;
        const isPasswordEqual = await bcrypt.compare(
          password,
          lookUpUser.password
        );

        if (isPasswordEqual) res.status(200).json(lookUpUser);
        else res.status(403).send("Password is not correct");
      } else res.status(404).send("User was not found");
    } catch (err) {
      res.status(500).send("Server could not handle the request");
    } finally {
      if (mongoose.connection.readyState === 1) await mongoose.disconnect();
    }
  } else res.status(405).send("This endpoint only accepts POST method");
}
