import Cookie from "./index";

const name = "testCookie";
const value = "testValue";
const token =
  "xxxxxx-2xxxxxxx.xxxxxxxx__ss2FSSXxxxxxxxxxx.xCFSAs231j--__-xxxxxxxx";

describe("Cookie", () => {
  test("Should set a cookie", () => {
    Cookie.set(name, value);
    expect(Cookie.get(name)).toBe(value);
  });

  test("Should get a complex value", () => {
    Cookie.set(name, token);
    expect(Cookie.get(name)).toBe(token);
  });

  test("Should remove the cookie", () => {
    Cookie.set(name, value);
    Cookie.remove(name);
    expect(Cookie.get(name)).toBeNull();
  });

  test("Should return null because cookie doesn't exist", () => {
    expect(Cookie.get(name)).toBeNull();
  });
});
