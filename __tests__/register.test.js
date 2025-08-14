import { render, screen } from "@testing-library/react";
import Register from "../pages/register";

jest.mock("next/router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), pathname: "" }),
}));

test("renders register form with role selector", () => {
  window.localStorage.setItem("token", "dummy");
  render(<Register />);
  expect(screen.getByRole("heading", { name: /register/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  expect(screen.getByRole("combobox")).toBeInTheDocument();
});
