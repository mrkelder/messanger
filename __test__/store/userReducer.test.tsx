import reducer, {
  setAccessToken,
  setUserData
} from "src/store/reducers/userReducer";

jest.mock("axios");

const initState = {
  accessToken: "",
  userData: {
    userName: ""
  }
};

const accessToken = "header.payload.secret";
const userName = "MR. Paladin";

describe("User reducer", () => {
  test("Should return the initial value", () => {
    expect(reducer(undefined, { type: "" })).toEqual(initState);
  });

  test("Should assign access token", () => {
    expect(reducer(undefined, setAccessToken(accessToken))).toEqual({
      ...initState,
      accessToken
    });
  });

  test("Should load user's data", () => {
    expect(reducer(undefined, setUserData({ userName }))).toEqual({
      ...initState,
      userData: { userName }
    });
  });
});
