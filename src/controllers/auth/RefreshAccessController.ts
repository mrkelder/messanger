import RefreshToken from "src/models/RefreshToken";
import JWT from "src/utils/JWT";

import { AuthController, AuthControllerInput } from "./AuthController";

export class RefreshAccessController extends AuthController {
  constructor(conf: AuthControllerInput) {
    super(conf);
  }

  public async run() {
    const bindedExec = this.exec.bind(this);
    await this.setUp(bindedExec);
  }

  public async exec() {
    const refreshAccessCookie = this.req.cookies.refreshToken as string;
    this.checkHttpMethod("PUT");
    this.checkRefreshTokenValidity(refreshAccessCookie);
    const { userId } = await this.checkRefreshTokenExistance(
      refreshAccessCookie
    );
    await this.sendSuccessResponse(userId);
  }

  private async checkRefreshTokenExistance(token: string) {
    const databaseRefreshToken = (
      await RefreshToken.find({
        token: token
      })
    )[0];

    if (!databaseRefreshToken) this.throwRefreshTokenInvalid();

    return databaseRefreshToken;
  }

  private checkRefreshTokenValidity(token: string) {
    JWT.verifyRefreshToken(token);
  }

  protected async sendSuccessResponse(userId: string) {
    const { accessToken, refreshToken } = await this.createTokens(userId);

    await RefreshToken.refreshOrInsert(userId, refreshToken);

    this.res.removeHeader("Set-Cookie");

    this.res
      .setHeader(
        "Set-Cookie",
        `refreshToken=${refreshToken}; httpOnly; max-age=31556952`
      )
      .json({ accessToken });
  }
}
