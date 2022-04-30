import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

import User from "src/models/User";
import { Credentials } from "src/types/auth";
import { DatabaseUser } from "src/types/db";
import RequestHelper from "src/utils/RequestHelper";

class Authorization {
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
    if (this.foundUsers.length > 0) await this.userExists();
    else this.userDoesNotExist();
  }

  private async lookForUsers() {
    this.foundUsers = await User.findByName(this.name);
  }

  private userDoesNotExist() {
    this.response.status(404).send("User was not found");
  }

  private async userExists() {
    if (await this.areCredentialsEqual()) this.credentialsAreEqual();
    else this.credentialsAreNotEqual();
  }

  public async areCredentialsEqual(): Promise<boolean> {
    return await bcrypt.compare(this.password, this.foundUsers[0].password);
  }

  public credentialsAreEqual() {
    this.response.status(200).json(this.foundUsers[0]);
  }

  public credentialsAreNotEqual() {
    this.response.status(403).send("Password is not correct");
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
      await mongoose.connect(process.env.MONGODB_HOST as string);
      const authorization = new Authorization(credentials, res);
      await authorization.run();
    } catch (err) {
      res.status(500).send("Server could not handle the request");
    } finally {
      if (mongoose.connection.readyState === 1) await mongoose.disconnect();
    }
  } else res.status(405).send("This endpoint only accepts POST method");
}
