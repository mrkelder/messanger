import bcrypt from "bcrypt";

import RefreshToken from "src/models/RefreshToken";
import User, { UserDocument } from "src/models/User";

import {
  AuthController,
  AuthControllerInput,
  CredentialsBody
} from "./AuthController";

export class AuthorizationController extends AuthController {
  constructor(conf: AuthControllerInput) {
    super(conf);
  }

  public async run() {
    const bindedExec = this.exec.bind(this);
    await this.setUp(bindedExec);
  }

  protected async exec() {
    this.checkHttpMethod("POST");
    const { name, password } = this.getBody<CredentialsBody>();
    const { _id, password: dbPassword } = (await this.checkUserExistance(
      name
    )) as UserDocument;
    await this.checkPassword(password, dbPassword);
    await this.sendSuccessResponse(_id.toString());
  }

  private async checkUserExistance(name: string) {
    const foundUser = await User.findByName(name);
    if (!foundUser) this.throwUserNotFound();
    return foundUser;
  }

  private async checkPassword(userPassword: string, dbPassword: string) {
    const isPasswordCorrect = await bcrypt.compare(userPassword, dbPassword);
    if (!isPasswordCorrect) this.throwInvalidPassword();
  }

  protected async sendSuccessResponse(userId: string): Promise<void> {
    const { accessToken, refreshToken } = await this.createTokens(userId);
    const refreshTokenCookie = `refreshToken=${refreshToken}; httpOnly; max-age=31556952`;
    await RefreshToken.refreshOrInsert(userId, refreshToken);

    this.res.removeHeader("Set-Cookie");
    this.res
      .setHeader("Set-Cookie", refreshTokenCookie)
      .json({ accessToken, _id: userId });
  }
}
