import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Start diagnosis</Button>);
    expect(screen.getByRole("button", { name: "Start diagnosis" })).toBeInTheDocument();
  });

  it("fires onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Book</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Book" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Book
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Book" }));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies the requested variant as a data attribute", () => {
    render(<Button variant="outline">Discover</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "outline");
  });

  it("renders as the child element when asChild is set (no nested <button>)", () => {
    render(
      <Button asChild>
        <a href="/shop">Shop</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Shop" });
    expect(link.tagName).toBe("A");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
