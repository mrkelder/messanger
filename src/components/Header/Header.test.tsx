import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Header from "./index";

describe("Header", () => {
  test("Should render Header with main variant (default)", () => {
    render(<Header />);
    const heading = screen.getByText(/Belo Chat/i);
    expect(heading).toBeInTheDocument();
  });

  test("Should render Header with chat variant", () => {
    render(<Header variant="chat" />);
    const heading = screen.getByText(/Another User/i);
    expect(heading).toBeInTheDocument();
  });

  test("Should render Header with new-contact variant", () => {
    render(<Header variant="new-contact" />);
    const heading = screen.getByText(/New Contact/i);
    expect(heading).toBeInTheDocument();
  });

  test("Should call up the side bar on burger button click", () => {
    render(<Header />);
    const burgerButton = screen.getByLabelText(/open nav/i);
    fireEvent.click(burgerButton);

    expect(screen.getByText(/New User/i)).toBeInTheDocument();
  });

  test("Should call up the side bar and turn a night mode", () => {
    render(<Header />);
    const burgerButton = screen.getByLabelText(/open nav/i);
    fireEvent.click(burgerButton);
    const nightModeButton = screen.getByLabelText(/night mode/i);
    fireEvent.click(nightModeButton);

    expect(screen.getByRole("checkbox")).toBeChecked();
  });
});
