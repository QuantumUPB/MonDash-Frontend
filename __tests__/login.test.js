import { render, screen } from "@testing-library/react";
import Login from "../pages/login";

jest.mock("next/router", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

test("renders login form", () => {
    render(<Login />);
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
});
