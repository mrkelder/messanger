import bcrypt from "bcrypt";

import User from "src/models/User";

import {
  AuthController,
  AuthControllerInput,
  CredentialsBody
} from "./AuthController";

export class RegistrationController extends AuthController {
  constructor(conf: AuthControllerInput) {
    super(conf);
  }

  public async run() {
    await this.setUp(this.exec);
  }

  public async exec() {
    this.checkHttpMethod("POST");
    const { name, password } = this.getBody<CredentialsBody>();
    const newUser = await this.createUser(name, password);
    await this.sendSuccessResponse(newUser._id?.toString());
  }

  private async createUser(name: string, password: string) {
    await this.checkUserExistance(name);

    const encryptedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      password: encryptedPassword
    });

    await newUser.save();
    return newUser;
  }

  private async checkUserExistance(name: string) {
    const foundUser = await User.findByName(name);
    if (foundUser) this.throwUserExists();
  }

  protected async sendSuccessResponse(userId: string): Promise<void> {
    const { accessToken, refreshToken } = await this.createTokens(userId);
    const refreshTokenCookie = `refreshToken=${refreshToken}; httpOnly; max-age=31556952`;

    this.res.removeHeader("Set-Cookie");
    this.res
      .setHeader("Set-Cookie", refreshTokenCookie)
      .json({ accessToken, _id: userId });
  }
}
