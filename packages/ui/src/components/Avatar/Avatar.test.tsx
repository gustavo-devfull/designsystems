import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { Avatar, getInitials } from "./Avatar";

describe("getInitials", () => {
  it.each([
    ["Ada Lovelace", "AL"],
    ["  grace   brewster   hopper ", "GH"],
    ["Cher", "C"],
    ["", ""],
  ])("%j → %j", (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});

describe("Avatar", () => {
  it("shows initials as an image named after the person when there is no src", () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveTextContent("AL");
  });

  it("shows the image with the name as alt text", () => {
    render(<Avatar name="Ada Lovelace" src="/ada.png" />);
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveAttribute("src", "/ada.png");
  });

  it("falls back to initials when the image fails and retries when src changes", () => {
    const { rerender } = render(<Avatar name="Ada Lovelace" src="/broken.png" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveTextContent("AL");
    expect(document.querySelector("img")).not.toBeInTheDocument();
    rerender(<Avatar name="Ada Lovelace" src="/ok.png" />);
    expect(document.querySelector("img")).toHaveAttribute("src", "/ok.png");
  });

  it("uses a custom alt, and alt='' makes it decorative", () => {
    const { container, rerender } = render(
      <Avatar name="Ada Lovelace" alt="Profile photo of Ada" />,
    );
    expect(screen.getByRole("img", { name: "Profile photo of Ada" })).toBeInTheDocument();
    rerender(<Avatar name="Ada Lovelace" alt="" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("supports sizes, className and ref", () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<Avatar ref={ref} name="Ada" size="xl" className="ring-0" />);
    expect(ref.current).toHaveClass("size-16");
    expect(ref.current).toHaveAttribute("data-size", "xl");
  });

  it("a11y: initials, image and decorative variants have no axe violations", async () => {
    const { container } = render(
      <>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Ada Lovelace" src="/ada.png" />
        <Avatar name="Ada Lovelace" alt="" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
