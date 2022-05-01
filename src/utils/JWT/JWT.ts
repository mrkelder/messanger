import jsonwebtoken, { JwtPayload } from "jsonwebtoken";

const ONE_YEAR_IN_MILLISECONDS = 31556952000;
const TEN_MINUTES_IN_MILLISECONDS = 600000;

class JWT {
  private static accessExpirational = TEN_MINUTES_IN_MILLISECONDS;
  private static refreshExpirational = ONE_YEAR_IN_MILLISECONDS;
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

  public static verifyAccessToken(accessToken: string): string | JwtPayload {
    return JWT.validateToken(accessToken, JWT.accessSecret);
  }

  public static verifyRefreshToken(refreshToken: string): string | JwtPayload {
    return JWT.validateToken(refreshToken, JWT.refreshSecret);
  }

  private static validateToken(
    token: string,
    secret: string
  ): string | JwtPayload {
    return jsonwebtoken.verify(token, secret);
  }
}

export default JWT;
