import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CtaArrow } from "./cta-arrow";
import { BackArrow } from "./back-arrow";

// Regression test for a real bug: the homepage originally used literal "→"
// / "←" characters after link text, which don't mirror for Arabic and read
// backwards in RTL. Both components must carry rtl:rotate-180 so the
// direction actually flips — see PROGRESS.md Sprint 2 RTL audit.
describe("CtaArrow", () => {
  it("renders an icon that flips in RTL via rtl:rotate-180", () => {
    const { container } = render(<CtaArrow />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("rtl:rotate-180");
  });

  it("is hidden from assistive tech (decorative, always paired with real text)", () => {
    const { container } = render(<CtaArrow />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden");
  });
});

describe("BackArrow", () => {
  it("renders an icon that flips in RTL via rtl:rotate-180", () => {
    const { container } = render(<BackArrow />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("rtl:rotate-180");
  });
});
