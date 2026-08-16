import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("accepts typed input and reflects it back", async () => {
    render(<Input aria-label="Email" />);
    const input = screen.getByLabelText("Email");
    await userEvent.type(input, "jane@ioma.com");
    expect(input).toHaveValue("jane@ioma.com");
  });

  it("reflects aria-invalid for form validation error states", () => {
    render(<Input aria-label="Email" aria-invalid />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("is disabled and non-interactive when disabled", () => {
    render(<Input aria-label="Email" disabled />);
    expect(screen.getByLabelText("Email")).toBeDisabled();
  });
});
