import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("renders title and description", () => {
    render(<Alert title="Saved">Your changes were saved.</Alert>);
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Your changes were saved.")).toBeInTheDocument();
  });

  it("announces urgent variants immediately (alert) and others politely (status)", () => {
    const { rerender } = render(<Alert variant="error">Boom</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Boom");
    rerender(<Alert variant="warning">Careful</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    rerender(<Alert variant="success">Done</Alert>);
    expect(screen.getByRole("status")).toHaveTextContent("Done");
    rerender(<Alert variant="info">FYI</Alert>);
    expect(screen.getByRole("status")).toHaveTextContent("FYI");
  });

  it("lets the consumer override the role", () => {
    render(
      <Alert variant="error" role="status">
        Quiet
      </Alert>,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("hides decorative icons from assistive technology and supports a custom or no icon", () => {
    const { container, rerender } = render(<Alert>x</Alert>);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("svg")?.closest("[aria-hidden='true']")).toBeInTheDocument();
    rerender(<Alert icon={<i data-testid="custom" />}>x</Alert>);
    expect(screen.getByTestId("custom")).toBeInTheDocument();
    rerender(<Alert icon={false}>x</Alert>);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("has no dismiss button unless onDismiss is provided", () => {
    render(<Alert>x</Alert>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("dismisses with click and with the keyboard, with a configurable name", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Alert onDismiss={onDismiss} dismissLabel="Dismiss notice">
        x
      </Alert>,
    );
    const button = screen.getByRole("button", { name: "Dismiss notice" });
    await user.click(button);
    await user.tab();
    await user.tab({ shift: true });
    await user.keyboard("{Enter}");
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it("forwards ref, className and native attributes", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Alert ref={ref} className="w-96" data-testid="a">
        x
      </Alert>,
    );
    expect(ref.current).toBe(screen.getByTestId("a"));
    expect(ref.current).toHaveClass("w-96");
  });

  it("a11y: all variants, with and without dismiss, have no axe violations", async () => {
    const { container } = render(
      <>
        {(["info", "success", "warning", "error"] as const).map((v) => (
          <Alert key={v} variant={v} title={v} onDismiss={() => undefined}>
            Description of {v}
          </Alert>
        ))}
        <Alert icon={false}>No icon</Alert>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
