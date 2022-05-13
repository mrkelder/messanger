import { screen, render } from "@testing-library/react";

import M from "pages/m";

describe("Main page", () => {
  test('Should render header with "main" variant', () => {
    render(<M />);

    expect(screen.getByText(/Belo Chat/i));
  });
});
