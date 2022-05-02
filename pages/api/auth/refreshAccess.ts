import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

import RefreshToken from "src/models/RefreshToken";
import JWT from "src/utils/JWT";
import RequestHelper from "src/utils/RequestHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  class RefreshAccess {
    private static requestHelper = new RequestHelper(req);
    private static oldRefreshToken: string | undefined =
      req.cookies.refreshToken;

    public static async run() {
      await RefreshAccess.checkIfPutMethod();
    }

    private static async checkIfPutMethod() {
      if (RefreshAccess.requestHelper.isPUT())
        await RefreshAccess.connectToDbAndTryToRefresh();
      else RefreshAccess.throwWrongMethodError();
    }

    private static throwWrongMethodError() {
      res.status(405).send("This endpoint only accepts PUT method");
    }

    private static async connectToDbAndTryToRefresh() {
      try {
        await mongoose.connect(process.env.MONGODB_HOST as string);
        await RefreshAccess.checkRefreshTokenValue();
      } catch {
        RefreshAccess.throwServerError();
      } finally {
        if (mongoose.connection.readyState === 1) await mongoose.disconnect();
      }
    }

    private static throwServerError() {
      res.status(500).send("Server could not handle the request");
    }

    private static async checkRefreshTokenValue() {
      if (RefreshAccess.oldRefreshToken)
        await RefreshAccess.checkRefreshToken();
      else RefreshAccess.throwRefreshTokenError();
    }

    private static async checkRefreshToken() {
      const databaseRefreshToken =
        await RefreshAccess.returnDatabaseRefreshToken();
      if (databaseRefreshToken)
        await RefreshAccess.sendSuccessResponse(databaseRefreshToken.userId);
      else RefreshAccess.throwRefreshTokenError();
    }

    private static throwRefreshTokenError() {
      res.status(401).send("Refresh token invalid");
    }

    private static async returnDatabaseRefreshToken() {
      const databaseRefreshToken = (
        await RefreshToken.find({
          token: RefreshAccess.oldRefreshToken
        })
      )[0];

      return databaseRefreshToken;
    }

    private static async sendSuccessResponse(userId: string) {
      const { accessToken, refreshToken } = await RefreshAccess.createTokens(
        userId
      );

      await RefreshToken.refresh(userId, refreshToken);

      res
        .setHeader(
          "Set-Cookie",
          `refreshToken=${refreshToken}; httpOnly; max-age=31556952`
        )
        .json({ accessToken });
    }

    private static async createTokens(userId: string): Promise<{
      accessToken: string;
      refreshToken: string;
    }> {
      const accessToken = JWT.createAccessToken(userId);
      const refreshToken = JWT.createRefreshToken(userId);
      return { accessToken, refreshToken };
    }
  }

  await RefreshAccess.run();
}
