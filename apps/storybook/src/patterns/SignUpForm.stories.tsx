import { Button, Checkbox, Input, Radio, RadioGroup, Select, Switch, Textarea } from "@sette/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type SyntheticEvent } from "react";
import { expect, userEvent, within } from "storybook/test";

interface Errors {
  name?: string;
  email?: string;
  country?: string;
  plan?: string;
  terms?: string;
}

/** Text value of a form entry (File entries are not used in this form). */
const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
};

function validate(data: FormData): Errors {
  const errors: Errors = {};
  if (!text(data, "name").trim()) errors.name = "Tell us your name.";
  if (!/^\S+@\S+\.\S+$/.test(text(data, "email")))
    errors.email = "Enter an email like ada@company.com.";
  if (!data.get("country")) errors.country = "Select your country.";
  if (!data.get("plan")) errors.plan = "Choose a plan to continue.";
  if (!data.get("terms")) errors.terms = "You must accept the terms.";
  return errors;
}

function SignUpForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate(new FormData(event.currentTarget));
    setErrors(next);
    setDone(Object.keys(next).length === 0);
  };

  return (
    // noValidate: validation messages come from our fields, not browser bubbles.
    <form
      noValidate
      onSubmit={onSubmit}
      className="flex w-96 flex-col gap-lg"
      aria-labelledby="signup-title"
    >
      <h2 id="signup-title" className="text-xl font-semibold">
        Create your account
      </h2>
      <Input label="Full name" name="name" autoComplete="name" required error={errors.name} />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        helperText="We will send a confirmation link."
        error={errors.email}
      />
      <Select
        label="Country"
        name="country"
        placeholder="Choose a country"
        required
        error={errors.country}
      >
        <option value="br">Brazil</option>
        <option value="pt">Portugal</option>
        <option value="us">United States</option>
      </Select>
      <RadioGroup legend="Plan" name="plan" required error={errors.plan}>
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Pro" helperText="Billed monthly" />
      </RadioGroup>
      <Textarea label="Anything we should know?" name="notes" rows={3} />
      <Switch label="Send me product updates" name="updates" />
      <Checkbox label="I accept the terms of service" name="terms" required error={errors.terms} />
      <Button type="submit" fullWidth>
        Create account
      </Button>
      <p role="status" className="text-sm text-feedback-success">
        {done ? "Account created. Check your inbox." : ""}
      </p>
    </form>
  );
}

const meta = {
  title: "Patterns/Sign-up form",
  component: SignUpForm,
  parameters: { layout: "centered" },
} satisfies Meta<typeof SignUpForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Submitting an empty form lists every problem next to its field, each announced and described. */
export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Create account" }));
    await expect(canvas.getByLabelText(/Full name/)).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByLabelText(/Email/)).toHaveAccessibleDescription(
      "Enter an email like ada@company.com.",
    );
    await expect(canvas.getByRole("radiogroup", { name: /Plan/ })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  },
};

export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/Full name/), "Ada Lovelace");
    await userEvent.type(canvas.getByLabelText(/Email/), "ada@lovelace.dev");
    await userEvent.selectOptions(canvas.getByLabelText(/Country/), "br");
    await userEvent.click(canvas.getByLabelText("Pro"));
    await userEvent.click(canvas.getByLabelText(/I accept/));
    await userEvent.click(canvas.getByRole("button", { name: "Create account" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Account created");
  },
};
