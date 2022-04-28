import JWT from "./JWT";
import { AccessRefreshSecrets, TokenPayload } from "./JWTTypes";

const tokenPair: AccessRefreshSecrets = {
  access: "access-token",
  refresh: "refresh-token"
};

const tokenPayload: TokenPayload = { _id: "507f191e810c19729de860ea" };

const jwt = new JWT(tokenPair, tokenPayload);

describe("Json Web Token class", () => {
  let accessToken: string;
  let refreshToken: string;

  test("Should result in an access token", () => {
    accessToken = jwt.createAccessToken();
    expect(accessToken).toBeDefined();
  });

  test("Should result in a refresh token", () => {
    refreshToken = jwt.createRefreshToken();
    expect(refreshToken).toBeDefined();
  });

  test("Should validate access and refresh tokens successfully", () => {
    const accessTokenValidation = jwt.validateAccessToken(accessToken);
    const refreshTokenValidation = jwt.validateRefreshToken(refreshToken);
    expect(accessTokenValidation).toBeTruthy();
    expect(refreshTokenValidation).toBeTruthy();
  });

  test("Should extract the same _id from both access and refresh tokens' payloads", () => {
    const { _id: accessTokenId } = JWT.extractTokenPayload(accessToken);
    const { _id: refreshTokenId } = JWT.extractTokenPayload(refreshToken);

    expect(accessTokenId).toBe(tokenPayload._id);
    expect(refreshTokenId).toBe(tokenPayload._id);
  });
});
