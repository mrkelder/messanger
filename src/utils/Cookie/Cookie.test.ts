import Cookie from "./index";

const name = "test-cookie";
const value = "test-value";

describe("Cookie", () => {
  test("Should set a cookie", () => {
    Cookie.set(name, value);

    expect(Cookie.get(name)).toBe(value);
  });

  test("Should remove the cookie", () => {
    Cookie.set(name, value);
    Cookie.remove(name);

    expect(Cookie.get(name)).toBeNull();
  });

  test("Should returen null because cookie doesn't exist", () => {
    expect(Cookie.get(name)).toBeNull();
  });
});
