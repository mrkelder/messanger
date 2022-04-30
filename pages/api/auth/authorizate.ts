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
  private foundUser: DatabaseUser | undefined;

  constructor(credentials: Credentials, res: NextApiResponse) {
    const { name, password } = credentials;
    this.name = name;
    this.password = password;
    this.response = res;
  }

  public async run() {
    if (this.areNameAndPasswordDefined()) await this.checkIfUserExists();
    else this.throwNameOrPasswordUndefinedError();
  }

  private areNameAndPasswordDefined(): boolean {
    return !!this.name && !!this.password;
  }

  private throwNameOrPasswordUndefinedError() {
    this.response.status(403).send("Either name or password was not provided");
  }

  private async checkIfUserExists() {
    await this.lookForUser();
    if (this.foundUser) await this.checkCredentials();
    else this.throwUserNotFoundError();
  }

  private async lookForUser() {
    this.foundUser = (await User.findByName(this.name))[0];
  }

  private throwUserNotFoundError() {
    this.response.status(404).send("User was not found");
  }

  private async checkCredentials() {
    if (await this.areCredentialsEqual()) this.sendSuccessResponse();
    else this.throwCredentialsUnequal();
  }

  public async areCredentialsEqual(): Promise<boolean> {
    return await bcrypt.compare(
      this.password,
      (this.foundUser as DatabaseUser).password
    );
  }

  public sendSuccessResponse() {
    this.response.status(200).json(this.foundUser);
  }

  public throwCredentialsUnequal() {
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
      const authorization = new Authorization(credentials, res);
      await mongoose.connect(process.env.MONGODB_HOST as string);
      await authorization.run();
    } catch (err) {
      res.status(500).send("Server could not handle the request");
    } finally {
      if (mongoose.connection.readyState === 1) await mongoose.disconnect();
    }
  } else res.status(405).send("This endpoint only accepts POST method");
}
