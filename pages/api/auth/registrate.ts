import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

import User from "src/models/User";
import { Credentials } from "src/types/auth";
import { DatabaseUser } from "src/types/db";
import RequestHelper from "src/utils/RequestHelper";

class Registration {
  private name: string;
  private password: string;
  private response: NextApiResponse;
  private foundUsers: DatabaseUser[] = [];

  constructor(credentials: Credentials, res: NextApiResponse) {
    const { name, password } = credentials;
    this.name = name;
    this.password = password;
    this.response = res;
  }

  public async run() {
    if (this.areNameAndPasswordDefined()) await this.nameAndPasswordDefined();
    else this.nameOrPasswordUndefined();
  }

  private areNameAndPasswordDefined(): boolean {
    return !!this.name && !!this.password;
  }

  private nameOrPasswordUndefined() {
    this.response.status(403).send("Either name or password was not provided");
  }

  private async nameAndPasswordDefined() {
    await this.lookForUsers();
    if (this.foundUsers.length > 0) this.throwUserExistsError();
    else await this.createUserAndRespondSuccessfully();
  }

  private async lookForUsers() {
    this.foundUsers = await User.findByName(this.name);
  }

  private throwUserExistsError() {
    this.response.status(409).send("The user already exists");
  }

  private async createUserAndRespondSuccessfully() {
    const encryptedPassword = await bcrypt.hash(this.password, 10);
    const newUser = new User({ name: this.name, password: encryptedPassword });
    await newUser.save();
    this.response.status(200).send("Success");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const requestHelper = new RequestHelper(req);

  if (requestHelper.isPOST()) {
    try {
      const credentials = requestHelper.getBody();
      const registration = new Registration(credentials, res);
      await mongoose.connect(process.env.MONGODB_HOST as string);
      await registration.run();
    } catch (err) {
      res.status(500).send("Server could not handle the request");
    } finally {
      if (mongoose.connection.readyState === 1) await mongoose.disconnect();
    }
  } else res.status(405).send("This endpoint only accepts POST method");
}
