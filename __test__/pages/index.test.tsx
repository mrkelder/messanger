import { screen, render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import Home from "pages/index";

beforeEach(() => {
  render(<Home />);
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
    const passwordInput = screen.getByPlaceholderText(/Name/i);
    const submitButton = screen.getByText(/Sign up/i);
    const linkToAuthorization = screen.getByText(/Have the account already?/i);

    fireEvent.change(passwordInput, { target: { value: "12" } });
    fireEvent.click(submitButton);
    expect(screen.getByText(errorMessageRegExp)).toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: "122" } });
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
});
