import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Header from "./index";

beforeEach(() => {
  render(<Header />);
});

describe("Header", () => {
  test("Should render Header", () => {
    const heading = screen.getByText(/Belo Chat/i);
    expect(heading).toBeInTheDocument();
  });

  test("Should call up the side bar on burger button click", () => {
    const burgerButton = screen.getByLabelText(/open nav/i);
    fireEvent.click(burgerButton);

    expect(screen.getByText(/User Name/i)).toBeInTheDocument();
  });

  test("Should have three links in the header", () => {
    const burgerButton = screen.getByLabelText(/open nav/i);
    fireEvent.click(burgerButton);

    const newContact = screen.getByText(/New Contact/i);
    const settings = screen.getByText(/Settings/i);
    const nightMode = screen.getByText(/Night Mode/i);

    expect(newContact).toBeInTheDocument();
    expect(settings).toBeInTheDocument();
    expect(nightMode).toBeInTheDocument();
  });
});
