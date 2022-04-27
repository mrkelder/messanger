let JWT: any;

interface AccessRefreshTokens {
  access: string;
  refresh: string;
}

interface CreateTokenInfo {
  _id: string;
}

const tokenPair: AccessRefreshTokens = {
  access: "access-token",
  refresh: "refresh-token"
};

const tokenInfo: CreateTokenInfo = { _id: "507f191e810c19729de860ea" };

const expectedAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1MDdmMTkxZTgxMGMxOTcyOWRlODYwZWEiLCJleHBpcmVzSW4iOiI2MDAwMDAifQ.6TnJM8jDmKNJLZXKHClnwDduKwXTPpkjMK-5T7XolzY";

const expectedRefreshToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1MDdmMTkxZTgxMGMxOTcyOWRlODYwZWEiLCJleHBpcmVzSW4iOiI2MDAwMDAifQ.qzccIExLIHAg8wlT_R09s3AxQqV4gNGTpoPZkedfNSw";

const jwt = new JWT(tokenPair);

describe("Json Web Token class", () => {
  test("Should generate a valid access token", () => {
    const actualAccessToken = jwt.createAcessToken(tokenInfo);
    expect(actualAccessToken).toBe(expectedAccessToken);
  });

  test("Should generate a valid refresh token", () => {
    const actualRefreshToken = jwt.createRefreshToken(tokenInfo);
    expect(actualRefreshToken).toBe(expectedRefreshToken);
  });

  test("Should validate access and refresh tokens successfully", () => {
    const accessTokenValidation = jwt.validateAccessToken();
    const refreshTokenValidation = jwt.validateRefreshToken();

    expect(accessTokenValidation).toBeTruthy();
    expect(refreshTokenValidation).toBeTruthy();
  });
});
