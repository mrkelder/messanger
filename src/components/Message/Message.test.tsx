import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Message from "./Message";

const MOCK_TEXT = "Lorem foo bar 1234 @$^^)./,|\\";
const MOCK_AUTHOR_NAME = "User 6136";

describe("chat message component", () => {
  test("should render a message of the current date", () => {
    const date = new Date();
    const dateString = date.toISOString();
    const dateTime = Intl.DateTimeFormat("en-US", {
      timeStyle: "short"
    }).format(date);

    render(
      <Message
        dateString={dateString}
        text={MOCK_TEXT}
        authorName={MOCK_AUTHOR_NAME}
      />
    );
    expect(screen.getByText(dateTime)).toBeInTheDocument();
    expect(screen.getByText(MOCK_TEXT)).toBeInTheDocument();
    expect(screen.getByText(MOCK_AUTHOR_NAME)).toBeInTheDocument();
  });
  test("should render a default message when no prop is passed", () => {
    const emptyProps = {} as any;
    render(<Message {...emptyProps} />);
    expect(screen.getByText("12:00 AM")).toBeInTheDocument();
    expect(screen.getByText("text")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
  });
});
