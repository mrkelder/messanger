import jsonwebtoken, { JwtPayload } from "jsonwebtoken";

const ONE_MONTH_IN_MILLISECONDS = 2629800000;
const TEN_MINUTES_IN_MILLISECONDS = 600000;

type VerificationReturnValue = JwtPayload & { _id: string };

class JWT {
  private static accessExpirational = TEN_MINUTES_IN_MILLISECONDS;
  private static refreshExpirational = ONE_MONTH_IN_MILLISECONDS;
  private static accessSecret = process.env.ACCESS_TOKEN_SECRET as string;
  private static refreshSecret = process.env.REFRESH_TOKEN_SECRET as string;

  public static createAccessToken(userId: string): string {
    return JWT.createToken(userId, JWT.accessSecret, JWT.accessExpirational);
  }

  public static createRefreshToken(userId: string): string {
    return JWT.createToken(userId, JWT.refreshSecret, JWT.refreshExpirational);
  }

  private static createToken(
    userId: string,
    token: string,
    expiresIn: number
  ): string {
    return jsonwebtoken.sign({ _id: userId }, token, {
      expiresIn
    });
  }

  public static verifyAccessToken(
    accessToken: string
  ): VerificationReturnValue {
    return JWT.validateToken(accessToken, JWT.accessSecret);
  }

  public static verifyRefreshToken(
    refreshToken: string
  ): VerificationReturnValue {
    return JWT.validateToken(refreshToken, JWT.refreshSecret);
  }

  private static validateToken(
    token: string,
    secret: string
  ): VerificationReturnValue {
    return jsonwebtoken.verify(token, secret) as VerificationReturnValue;
  }
}

export default JWT;
