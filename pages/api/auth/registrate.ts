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

      if (lookUpUsers.length === 0) {
        const encryptedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, password: encryptedPassword });
        await newUser.save();
        res.status(200).send("Success");
      } else res.status(409).send("The user already exists");
    } catch (err) {
      res.status(500).send("Server could not handle the request");
    } finally {
      if (mongoose.connection.readyState === 1) await mongoose.disconnect();
    }
  } else res.status(405).send("This endpoint only accepts POST method");
}
