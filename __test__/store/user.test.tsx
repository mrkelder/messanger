import { screen, render, fireEvent } from "@testing-library/react";
import axios from "axios";
import { Provider } from "react-redux";

import Home from "pages/index";
import User from "src/models/User";
import store from "src/store";
import reducer, { setAccessToken, setUserData } from "src/store/reducers/user";

jest.mock("axios");

const initState = {
  accessToken: "",
  info: {
    userName: ""
  }
};

const testUser = { name: "Gabe Newell Test", password: "I love money" };

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
      info: { userName }
    });
  });
});

describe("User reducer with the registration page", () => {
  beforeAll(async () => {
    await User.deleteByName(testUser.name);
  });

  beforeEach(() => {
    render(
      <Provider store={store}>
        <Home />
      </Provider>
    );
  });

  test("Should assign access token and userName in store after the registration", () => {
    axios.post.mockImplementationOnce(() =>
      Promise.resolve({ accessToken, userName: testUser.name })
    );

    const nameInput = screen.getByPlaceholderText(/Name/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByText(/Sign Up/i);

    fireEvent.change(nameInput, { target: { value: testUser.name } });
    fireEvent.change(passwordInput, { target: { value: testUser.password } });
    fireEvent.click(submitButton);

    expect(store.getState()).toEqual({
      ...store,
      user: { info: { userName: testUser.name }, accessToken: accessToken }
    });
  });

  test("Should assign access token and userName in store after the authorization", () => {
    axios.post.mockImplementationOnce(() =>
      Promise.resolve({ accessToken, userName: testUser.name })
    );

    const linkToAuthorization = screen.getByText(/Have the account already?/i);
    fireEvent.click(linkToAuthorization);

    const nameInput = screen.getByPlaceholderText(/Name/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByText(/Sign Up/i);
    fireEvent.change(nameInput, { target: { value: testUser.name } });
    fireEvent.change(passwordInput, { target: { value: testUser.password } });
    fireEvent.click(submitButton);

    expect(store.getState()).toEqual({
      ...store,
      user: { info: { userName: testUser.name }, accessToken: accessToken }
    });
  });
});
