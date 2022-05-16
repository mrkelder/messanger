import store from "src/store";
import { USER_DATA_LOCAL_STORAGE_NAME } from "src/store/CONSTANTS";
import reducer, {
  setAccessToken,
  setUserData,
  initStoreFromLocalStorage
} from "src/store/reducers/userReducer";

jest.mock("axios");

const initState = {
  accessToken: "",
  userData: {
    userName: ""
  }
};

const localStorageState = {
  accessToken: "header.payload.secret",
  userData: {
    userName: "New User"
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

describe("User reducer with localStorage", () => {
  test("Should remain the same state because of the invalid user data", () => {
    localStorage.setItem(
      USER_DATA_LOCAL_STORAGE_NAME,
      JSON.stringify({ accessToken: localStorageState.accessToken })
    );

    store.dispatch(initStoreFromLocalStorage());
    expect(store.getState().user).toEqual(initState);
  });

  test("Should remain the same state because of the invalid access token", () => {
    localStorage.setItem(
      USER_DATA_LOCAL_STORAGE_NAME,
      JSON.stringify({ userData: localStorageState.userData })
    );

    store.dispatch(initStoreFromLocalStorage());
    expect(store.getState().user).toEqual(initState);
  });

  test("Should remain the same state because of no data", () => {
    store.dispatch(initStoreFromLocalStorage());
    expect(store.getState().user).toEqual(initState);
  });

  test("Should initiate store from localStorage", () => {
    localStorage.setItem(
      USER_DATA_LOCAL_STORAGE_NAME,
      JSON.stringify(localStorageState)
    );

    store.dispatch(initStoreFromLocalStorage());
    expect(store.getState().user).toEqual(localStorageState);
  });
});
