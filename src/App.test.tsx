import { render, screen } from "@testing-library/react";
import App from "./App"; // Make sure './App' exports a React component, not a type

test("renders learn react link", () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
