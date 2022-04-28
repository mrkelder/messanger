import jsonwebtoken from "jsonwebtoken";

import { AccessRefreshSecrets, TokenPayload } from "./JWTTypes";

class JWT {
  private static expiresIn = 1000 * 60 * 10;

  private accessSecret: string;
  private refreshSecret: string;
  private payload: TokenPayload;

  constructor(tokens: AccessRefreshSecrets, payload: TokenPayload) {
    const { access, refresh } = tokens;
    this.accessSecret = access;
    this.refreshSecret = refresh;
    this.payload = payload;
  }

  public createAccessToken(): string {
    return this.createToken(this.accessSecret);
  }

  public createRefreshToken(): string {
    return this.createToken(this.refreshSecret);
  }

  private createToken(token: string): string {
    return jsonwebtoken.sign(this.payload, token, {
      expiresIn: JWT.expiresIn
    });
  }

  public validateAccessToken(accessToken: string): boolean {
    return this.validateToken(accessToken, this.accessSecret);
  }

  public validateRefreshToken(refreshToken: string): boolean {
    return this.validateToken(refreshToken, this.refreshSecret);
  }

  private validateToken(token: string, secret: string): boolean {
    try {
      const result = jsonwebtoken.verify(token, secret);
      return !!result;
    } catch {
      return false;
    }
  }

  public static extractTokenPayload(token: string): TokenPayload {
    return new Object(jsonwebtoken.decode(token)) as TokenPayload;
  }
}

export default JWT;
