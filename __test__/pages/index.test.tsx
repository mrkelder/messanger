import { screen, render, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import { Provider } from "react-redux";

import Home from "pages/index";
import store from "src/store";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  render(
    <Provider store={store}>
      <Home />
    </Provider>
  );
});

describe("Home page", () => {
  test("Should render page with all components", () => {
    const title = screen.getByText(/Registration/i);
    const nameInput = screen.getByPlaceholderText(/Name/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const hidePasswordButton = screen.getByLabelText(/show password/i);
    const submitButton = screen.getByText(/Sign Up/i);
    const linkToAuthorization = screen.getByText(/Have the account already?/i);

    expect(title).toBeInTheDocument();
    expect(nameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(hidePasswordButton).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(linkToAuthorization).toBeInTheDocument();
  });

  test("Should change content after the link is clicked", () => {
    const linkToAuthorization = screen.getByText(/Have the account already?/i);
    fireEvent.click(linkToAuthorization);
    expect(screen.getByText(/Authorization/i)).toBeInTheDocument();

    const linkToRegistration = screen.getByText(/Don't have an account yet?/i);
    fireEvent.click(linkToRegistration);
    expect(screen.getByText(/Registration/i)).toBeInTheDocument();
  });

  test("Should display name too short message and then hide it after page manipulations", () => {
    const errorMessageRegExp = /Name has to be at least 4 characters long/i;
    const nameInput = screen.getByPlaceholderText(/Name/i);
    const submitButton = screen.getByText(/Sign up/i);
    const linkToAuthorization = screen.getByText(/Have the account already?/i);

    fireEvent.change(nameInput, { target: { value: "12" } });
    fireEvent.click(submitButton);
    expect(screen.getByText(errorMessageRegExp)).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: "122" } });
    expect(screen.queryByText(errorMessageRegExp)).toBeNull();

    fireEvent.click(submitButton);
    expect(screen.getByText(errorMessageRegExp)).toBeInTheDocument();

    fireEvent.click(linkToAuthorization);
    expect(screen.queryByText(errorMessageRegExp)).toBeNull();
  });

  test("Should display password too short message and then hide it after page manipulations", () => {
    const errorMessageRegExp = /Password has to be at least 6 characters long/i;
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByText(/Sign up/i);
    const linkToAuthorization = screen.getByText(/Have the account already?/i);

    fireEvent.change(passwordInput, { target: { value: "123" } });
    fireEvent.click(submitButton);
    expect(screen.getByText(errorMessageRegExp)).toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: "12345" } });
    expect(screen.queryByText(errorMessageRegExp)).toBeNull();

    fireEvent.click(submitButton);
    expect(screen.getByText(errorMessageRegExp)).toBeInTheDocument();

    fireEvent.click(linkToAuthorization);
    expect(screen.queryByText(errorMessageRegExp)).toBeNull();
  });

  test("Should throw an error because such user already exists on registration page", async () => {
    mockedAxios.post.mockImplementationOnce(() =>
      Promise.reject({ response: { status: 409 } })
    );

    const nameInput = screen.getByPlaceholderText(/Name/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByText(/Sign up/i);

    await act(async () => {
      await fireEvent.change(nameInput, { target: { value: "123456" } });
      await fireEvent.change(passwordInput, { target: { value: "12345678" } });
      await fireEvent.click(submitButton);
    });

    expect(
      screen.getByText("Such user already exists, try another name")
    ).toBeInTheDocument();
  });

  test("Should throw an error because of server failed response on registration page", async () => {
    mockedAxios.post.mockImplementationOnce(() =>
      Promise.reject({ response: { status: 500 } })
    );

    const nameInput = screen.getByPlaceholderText(/Name/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByText(/Sign up/i);

    await act(async () => {
      await fireEvent.change(nameInput, { target: { value: "123456" } });
      await fireEvent.change(passwordInput, { target: { value: "12345678" } });
      await fireEvent.click(submitButton);
    });

    expect(
      screen.getByText("Server error occured, try to send data once again")
    ).toBeInTheDocument();
  });

  test("Should throw an error because of an unexpected exception on registration page", async () => {
    mockedAxios.post.mockImplementationOnce(() =>
      Promise.reject({ response: { status: 405 } })
    );

    const nameInput = screen.getByPlaceholderText(/Name/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByText(/Sign up/i);

    await act(async () => {
      await fireEvent.change(nameInput, { target: { value: "123456" } });
      await fireEvent.change(passwordInput, { target: { value: "12345678" } });
      await fireEvent.click(submitButton);
    });

    expect(
      screen.getByText("Some problem occured, try to send data once again")
    ).toBeInTheDocument();
  });

  test("Should throw an error because the password is incorrect on authorization page", async () => {
    mockedAxios.post.mockImplementationOnce(() =>
      Promise.reject({ response: { status: 401 } })
    );

    const nameInput = screen.getByPlaceholderText(/Name/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByText(/Sign up/i);
    const linkToAuthorization = screen.getByText(/Have the account already?/i);

    await act(async () => {
      await fireEvent.click(linkToAuthorization);
      await fireEvent.change(nameInput, { target: { value: "123456" } });
      await fireEvent.change(passwordInput, { target: { value: "12345678" } });
      await fireEvent.click(submitButton);
    });

    expect(screen.getByText("Password is not correct")).toBeInTheDocument();
  });

  test("Should throw an error because the user was not found on authorization page", async () => {
    mockedAxios.post.mockImplementationOnce(() =>
      Promise.reject({ response: { status: 404 } })
    );

    const nameInput = screen.getByPlaceholderText(/Name/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByText(/Sign up/i);
    const linkToAuthorization = screen.getByText(/Have the account already?/i);

    await act(async () => {
      await fireEvent.click(linkToAuthorization);
      await fireEvent.change(nameInput, { target: { value: "123456" } });
      await fireEvent.change(passwordInput, { target: { value: "12345678" } });
      await fireEvent.click(submitButton);
    });

    expect(screen.getByText("Such user doesn't exist")).toBeInTheDocument();
  });

  test("Should throw an error because of server failed response on authorization page", async () => {
    mockedAxios.post.mockImplementationOnce(() =>
      Promise.reject({ response: { status: 500 } })
    );

    const nameInput = screen.getByPlaceholderText(/Name/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByText(/Sign up/i);
    const linkToAuthorization = screen.getByText(/Have the account already?/i);

    await act(async () => {
      await fireEvent.click(linkToAuthorization);
      await fireEvent.change(nameInput, { target: { value: "123456" } });
      await fireEvent.change(passwordInput, { target: { value: "12345678" } });
      await fireEvent.click(submitButton);
    });

    expect(
      screen.getByText("Server error occured, try to send data once again")
    ).toBeInTheDocument();
  });
});
