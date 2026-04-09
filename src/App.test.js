import { render, screen } from "@testing-library/react";
import DisplayStatus from "./components/DisplayStatus";

test("renders a status message", () => {
  render(<DisplayStatus type="success" message="Order placed successfully." />);
  expect(screen.getByText("Order placed successfully.")).toBeInTheDocument();
});
