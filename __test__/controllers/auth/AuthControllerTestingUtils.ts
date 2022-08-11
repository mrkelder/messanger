import bcrypt from "bcrypt";
import mongoose from "mongoose";

import RefreshToken from "src/models/RefreshToken";
import User, { UserDocument } from "src/models/User";
import JWT from "src/utils/JWT";

export interface StatusObject {
  status: number;
}

export class AuthControllerTestingUtils {
  public static credentials = {
    name: "test-user-name",
    password: "some-test-password"
  };

  public static postReq = {
    method: "POST",
    body: AuthControllerTestingUtils.credentials
  } as any;

  public static putReq = {
    method: "PUT",
    cookies: {}
  } as any;

  public static res = {
    removeHeader: () => AuthControllerTestingUtils.res,
    setHeader: () => AuthControllerTestingUtils.res,
    status: () => AuthControllerTestingUtils.res,
    json: () => AuthControllerTestingUtils.res,
    send: () => AuthControllerTestingUtils.res
  } as any;

  public static statusSetter(statusObject: StatusObject) {
    return (statusCode: number) => {
      statusObject.status = statusCode;
      return AuthControllerTestingUtils.res;
    };
  }

  public static async execMongodbOperation<T>(
    func: () => Promise<T>
  ): Promise<T> {
    await mongoose.connect(process.env.MONGODB_HOST as string);
    const result = await func();
    await mongoose.disconnect();
    return result;
  }

  public static async createUser() {
    await AuthControllerTestingUtils.execMongodbOperation(async () => {
      const { name, password } = AuthControllerTestingUtils.credentials;
      const newUser = new User({
        name,
        password: await bcrypt.hash(password, 10)
      });
      await newUser.save();
    });
  }

  public static async createRefreshToken(userId: string) {
    return await AuthControllerTestingUtils.execMongodbOperation<string>(
      async () => {
        const newToken = new RefreshToken({
          token: JWT.createRefreshToken(userId),
          userId
        });
        await newToken.save();

        return newToken.token;
      }
    );
  }

  public static async findUser(name: string): Promise<UserDocument | void> {
    return await AuthControllerTestingUtils.execMongodbOperation<UserDocument | void>(
      async () => {
        return await User.findByName(name);
      }
    );
  }

  public static async retrieveUserId() {
    return await AuthControllerTestingUtils.execMongodbOperation<string>(
      async () => {
        const { name } = AuthControllerTestingUtils.credentials;
        const user = (await User.findByName(name)) as UserDocument;

        return user.id;
      }
    );
  }

  public static async deleteUser() {
    await AuthControllerTestingUtils.execMongodbOperation(async () => {
      const { name } = AuthControllerTestingUtils.credentials;
      await User.deleteByName(name);
    });
  }

  public static async deleteRefreshToken() {
    await AuthControllerTestingUtils.execMongodbOperation(async () => {
      const { name } = AuthControllerTestingUtils.credentials;
      const user = (await User.findByName(name)) as UserDocument;
      await RefreshToken.deleteByUserId(user.id);
    });
  }
}
