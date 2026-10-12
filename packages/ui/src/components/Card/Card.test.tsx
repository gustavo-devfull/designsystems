import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card";

describe("Card", () => {
  it("composes header, content and footer in order", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>For teams</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    const text = screen.getByTestId("card").textContent;
    expect(text).toBe("PlanFor teamsBodyFooter");
  });

  it("renders the title as a level-3 heading by default and lets the level be chosen", () => {
    const { rerender } = render(<CardTitle>Title</CardTitle>);
    expect(screen.getByRole("heading", { level: 3, name: "Title" })).toBeInTheDocument();
    rerender(<CardTitle as="h2">Title</CardTitle>);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    rerender(<CardTitle as="p">Title</CardTitle>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("can be a landmark-capable element", () => {
    render(
      <Card as="section" aria-label="Billing">
        x
      </Card>,
    );
    expect(screen.getByRole("region", { name: "Billing" })).toBeInTheDocument();
  });

  it("defaults to outline and supports elevated", () => {
    const { rerender } = render(<Card data-testid="c">x</Card>);
    expect(screen.getByTestId("c")).toHaveAttribute("data-variant", "outline");
    rerender(
      <Card data-testid="c" variant="elevated">
        x
      </Card>,
    );
    expect(screen.getByTestId("c")).toHaveClass("shadow-mid");
  });

  it("forwards refs and merges className on every part", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Card ref={ref} className="w-96">
        <CardContent className="p-xl" data-testid="content">
          x
        </CardContent>
      </Card>,
    );
    expect(ref.current).toHaveClass("w-96");
    expect(screen.getByTestId("content")).toHaveClass("p-xl");
    expect(screen.getByTestId("content")).not.toHaveClass("p-lg");
  });

  it("a11y: has no axe violations", async () => {
    const { container } = render(
      <main>
        <Card as="article" variant="elevated">
          <CardHeader>
            <CardTitle as="h2">Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
