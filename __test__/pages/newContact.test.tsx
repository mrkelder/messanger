import { screen, render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import axios from "axios";
import mongoose from "mongoose";
import NewChat from "pages/newChat";

import RefreshToken from "src/models/RefreshToken";
import User from "src/models/User";

jest.setTimeout(15 * 1000);

const host = process.env.NEXT_PUBLIC_HOST + "/api/auth";
const registrateAPI = host + "/registrate";
const conf = { headers: { "Content-Type": "text/plain" } };

const password = "some-password";
const testUser1 = { password, name: "test-user-1" };
const testUser2 = { password, name: "test-user-2" };

async function deleteUser(testUser: typeof testUser1): Promise<void> {
  const user = await User.findByName(testUser.name);
  if (user) {
    await RefreshToken.deleteByUserId(user._id);
    await User.deleteByName(testUser.name);
  }
}

async function registrateUser(testUser: typeof testUser1): Promise<string> {
  const result = await axios.post(
    registrateAPI,
    JSON.stringify(testUser),
    conf
  );
  return result.data.accessToken;
}

describe("New chat page", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_HOST as string);
    await deleteUser(testUser1);
    await deleteUser(testUser2);
    await registrateUser(testUser1);
    await registrateUser(testUser2);
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) await mongoose.disconnect();
  });

  beforeEach(() => {
    render(<NewChat />);
  });

  test("Should render all the elements", () => {
    expect(screen.getByText(/New Contact/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("Should find 2 users", () => {
    const input = screen.getByRole("textbox");
    const submit = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "test-user-" } });
    fireEvent.click(submit);

    expect(screen.queryByText(/User 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/User 2/i)).toBeInTheDocument();
  });

  test("Should render no results", () => {
    const input = screen.getByRole("textbox");
    const submit = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "Test Contact" } });
    fireEvent.click(submit);

    expect(screen.queryByText(/No user found/i)).toBeInTheDocument();
  });
});
