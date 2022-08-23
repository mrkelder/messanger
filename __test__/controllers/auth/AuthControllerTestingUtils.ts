import bcrypt from "bcrypt";
import mongoose from "mongoose";

import RefreshToken from "src/models/RefreshToken";
import User, { UserDocument } from "src/models/User";
import JWT from "src/utils/JWT";

export interface StatusObject {
  status: number;
}

interface Credentials {
  name: string;
  password: string;
}

interface GetReq {
  method: "GET";
  cookies?: { [key: string]: any };
}

interface PostReq {
  method: "POST";
  body: { [key: string]: any };
  cookies?: { [key: string]: any };
}

interface PutReq {
  method: "PUT";
  cookies?: { [key: string]: any };
}

export class AuthControllerTestingUtils {
  public credentials: Credentials;
  public getReq: GetReq;
  public postReq: PostReq;
  public putReq: PutReq;

  public res = {
    removeHeader: () => this.res,
    setHeader: () => this.res,
    status: () => this.res,
    json: () => this.res,
    send: () => this.res
  } as any;

  constructor(name: Credentials["name"]) {
    this.credentials = {
      name: `test-${name}`,
      password: "some-test-password"
    };

    this.getReq = { method: "GET" };
    this.postReq = { method: "POST", body: this.credentials };
    this.putReq = { method: "PUT", cookies: {} };
  }

  public statusSetter(statusObject: StatusObject) {
    return (statusCode: number) => {
      statusObject.status = statusCode;
      return this.res;
    };
  }

  public resultDataSetter(statusObject: any) {
    return (data: any) => {
      statusObject.data = data;
      return this.res;
    };
  }

  public async execMongodbOperation<T>(func: () => Promise<T>): Promise<T> {
    await mongoose.connect(process.env.MONGODB_HOST as string);
    const result = await func();
    await mongoose.disconnect();
    return result;
  }

  public async createUser() {
    // TODO: make it more flexible
    await this.execMongodbOperation(async () => {
      const { name, password } = this.credentials;
      const newUser = new User({
        name,
        password: await bcrypt.hash(password, 10)
      });
      await newUser.save();
    });
  }

  public async createRefreshToken(userId: string) {
    return await this.execMongodbOperation<string>(async () => {
      const newToken = new RefreshToken({
        token: JWT.createRefreshToken(userId),
        userId
      });
      await newToken.save();

      return newToken.token;
    });
  }

  public async findUser(): Promise<UserDocument | void> {
    return await this.execMongodbOperation<UserDocument | void>(async () => {
      return await User.findByName(this.credentials.name);
    });
  }

  public async retrieveUserId() {
    return await this.execMongodbOperation<string>(async () => {
      const { name } = this.credentials;
      const user = (await User.findByName(name)) as UserDocument;

      return user.id;
    });
  }

  public async deleteUser() {
    await this.execMongodbOperation(async () => {
      const { name } = this.credentials;
      await User.deleteByName(name);
    });
  }

  public async deleteRefreshToken() {
    await this.execMongodbOperation(async () => {
      const { name } = this.credentials;
      const user = (await User.findByName(name)) as UserDocument;
      await RefreshToken.deleteByUserId(user.id);
    });
  }
}
