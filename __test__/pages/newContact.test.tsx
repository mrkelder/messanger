import { screen, render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";

import NewContact from "pages/newContact";

jest.mock("axios");

describe("New chat page", () => {
  beforeEach(() => {
    render(<NewContact isAccessTokenValid />);
  });

  test("Should render all the elements", () => {
    expect(screen.getByText(/New Contact/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/User name/i)).toBeInTheDocument();
  });

  test("Should find 2 users", async () => {
    axios.get.mockImplementationOnce(() =>
      Promise.resolve({
        data: [
          { _id: "some-id1", name: "User 1" },
          { _id: "some-id2", name: "User 2" }
        ]
      })
    );

    const input = screen.getByLabelText(/User name/i);

    fireEvent.change(input, { target: { value: "User" } });

    expect(await screen.findByText(/User 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/User 2/i)).toBeInTheDocument();
  });

  test("Should render no results", async () => {
    axios.get.mockImplementationOnce(() => Promise.reject(new Error("404")));
    const input = screen.getByLabelText(/User name/i);

    fireEvent.change(input, { target: { value: "Test Contact" } });

    expect(await screen.findByText(/No results/i)).toBeInTheDocument();
    screen.debug();
  });
});
