import { screen, render } from "@testing-library/react";

import M from "pages/m";

describe("Main page", () => {
  beforeEach(() => {
    render(<M isAccessTokenValid />);
  });

  test('Should render header with "main" variant', () => {
    expect(screen.getByText(/Belo Chat/i)).toBeInTheDocument();
  });

  test("Should render with a loading placeholder", () => {
    expect(
      screen.getAllByText(/Loading your chats\.\.\./gi)
    ).toBeInTheDocument();
  });

  test("Should render with a list of 5 chats", () => {
    expect(screen.findAllByText(/Chat/gi)).toHaveLength(5);
  });

  test("Should render with a list of 10 chats even though 12 are loaded", () => {
    expect(screen.findAllByText(/Chat/gi)).toHaveLength(10);
  });

  test("Should render with no messages", () => {
    expect(screen.findAllByText(/Chat/gi)).toHaveLength(0);
    expect(screen.findByText(/You have no chats/gi)).toHaveLength(0);
  });
});
