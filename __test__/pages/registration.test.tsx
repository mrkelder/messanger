import { screen, render, fireEvent } from "@testing-library/react";
import axios from "axios";
import Regestration from "pages/regestration";
import "@testing-library/jest-dom";

jest.mock("axios");

const testUser = {
  name: "user-name",
  password: "user-password"
};

describe("Regestration page", () => {
  beforeEach(() => {
    render(<Regestration />);
  });

  test("Should render page with all components", () => {
    const h1 = screen.getByText(/Registration/i);
    const nameInput = screen.getByPlaceholderText(/Name/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const hidePasswordCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByText(/Sign up/i);
    const linkToAuthorization = screen.getByText(/Sign in/i);

    expect(h1).toBeInTheDocument();
    expect(nameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(hidePasswordCheckbox).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(linkToAuthorization).toBeInTheDocument();
  });

  test("Should warn that the name is already occupied", () => {
    axios.post.mockImplementationOnce(() => Promise.resolve({ status: 409 }));

    const nameInput = screen.getByPlaceholderText(/Name/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByText(/Sign up/i);

    fireEvent.change(nameInput, { target: { value: testUser.name } });
    fireEvent.change(passwordInput, { target: { value: testUser.password } });
    fireEvent.click(submitButton);

    const errorMessage = screen.getByText(/This user name is already taken/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test("Should reveal password", () => {
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const hidePasswordCheckbox = screen.getByRole("checkbox");

    fireEvent.change(passwordInput, { target: { value: testUser.password } });

    const unrevealedPasswordInput = screen.getByText(
      testUser.password.replace(/.{1}/, "*")
    );
    expect(unrevealedPasswordInput).toBeInTheDocument();

    fireEvent.click(hidePasswordCheckbox);

    const revealedPasswordInput = screen.getByText(testUser.password);
    expect(revealedPasswordInput).toBeInTheDocument();
  });

  test("Should warn that password is too short", () => {
    const nameInput = screen.getByPlaceholderText(/Name/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByText(/Sign up/i);

    fireEvent.change(nameInput, { target: { value: testUser.name } });
    fireEvent.change(passwordInput, { target: { value: "321" } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Password is too short/i));
  });

  test("Should warn about the empty name input", () => {
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByText(/Sign up/i);

    fireEvent.change(passwordInput, { target: { value: testUser.password } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Name is empty/i));
  });

  test("Should warn about the empty password input", () => {
    const nameInput = screen.getByPlaceholderText(/Name/i);
    const submitButton = screen.getByText(/Sign up/i);

    fireEvent.change(nameInput, { target: { value: testUser.name } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Password is empty/i));
  });
});
