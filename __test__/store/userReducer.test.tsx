import store from "src/store";
import { USER_DATA_LOCAL_STORAGE_NAME } from "src/store/CONSTANTS";
import reducer, {
  setUserData,
  initStoreFromLocalStorage
} from "src/store/reducers/userReducer";
import LocalStorage from "src/utils/LocalStorage";

jest.mock("axios");

const initState = {
  _id: "",
  userName: ""
};

const localStorageState = {
  _id: "iidi9229edj239d29udiwj",
  userName: "New User"
};

const customUserName = "Mr. Plading";

describe("User reducer", () => {
  test("Should return the initial value", () => {
    expect(reducer(undefined, { type: "" })).toEqual(initState);
  });

  test("Should load user's data", () => {
    expect(
      reducer(
        undefined,
        setUserData({ ...initState, userName: customUserName })
      )
    ).toEqual({
      ...initState,
      userName: customUserName
    });
  });
});

describe("User reducer with localStorage", () => {
  beforeEach(() => {
    store.dispatch(setUserData(initState));
  });

  test("Should remain the same state because of no data", () => {
    store.dispatch(initStoreFromLocalStorage());
    expect(store.getState().user).toEqual(initState);
  });

  test("Should initiate store from localStorage", () => {
    LocalStorage.set(USER_DATA_LOCAL_STORAGE_NAME, localStorageState);

    store.dispatch(initStoreFromLocalStorage());
    expect(store.getState().user).toEqual(localStorageState);
  });

  test("Should add user data to localStorage", () => {
    store.dispatch(setUserData(localStorageState));

    expect(
      LocalStorage.get<typeof localStorageState>(USER_DATA_LOCAL_STORAGE_NAME)
    ).toEqual({
      ...localStorageState
    });
  });
});
