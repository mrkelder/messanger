import JWT from "./JWT";

const userId = "507f191e810c19729de860ea";

describe("Json Web Token class", () => {
  let accessToken: string;
  let refreshToken: string;

  test("Should result in an access token", () => {
    accessToken = JWT.createAccessToken(userId);
    expect(accessToken).toBeDefined();
  });

  test("Should result in a refresh token", () => {
    refreshToken = JWT.createRefreshToken(userId);
    expect(refreshToken).toBeDefined();
  });

  test("Should validate access and refresh tokens successfully", () => {
    expect(() => {
      JWT.verifyAccessToken(accessToken);
      JWT.verifyRefreshToken(refreshToken);
    }).not.toThrow();
  });

  test("Should extract userId from verificational method", () => {
    const verification = JWT.verifyAccessToken(accessToken);
    expect(verification._id).toBe(userId);
  });
});
