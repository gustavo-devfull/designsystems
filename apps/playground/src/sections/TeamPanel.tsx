import {
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  Divider,
  Input,
  Select,
} from "@sette/ui";
import { PlusIcon } from "@design-system/icons";
import { useState, type SyntheticEvent } from "react";
import type { Member } from "../data";

interface TeamPanelProps {
  members: Member[];
  onInvite: (member: Member) => void;
}

interface InviteErrors {
  email?: string;
  role?: string;
}

const roleVariant = { Owner: "info", Admin: "success", Member: "neutral" } as const;
const formText = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
};

export function TeamPanel({ members, onInvite }: TeamPanelProps) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<InviteErrors>({});
  const [message, setMessage] = useState("");

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = formText(data, "email");
    const role = formText(data, "role") as Member["role"] | "";
    const next: InviteErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter an email like ada@company.com.";
    if (!role) next.role = "Choose a role.";
    setErrors(next);
    if (next.email) {
      event.currentTarget.querySelector<HTMLElement>("[name=email]")?.focus();
      return;
    }
    if (next.role || !role) {
      event.currentTarget.querySelector<HTMLElement>("[name=role]")?.focus();
      return;
    }
    const name = (email.split("@")[0] ?? email).replace(/^\w/, (c) => c.toUpperCase());
    onInvite({ name, email, role });
    setMessage(`Invitation sent to ${email}.`);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center justify-between gap-md">
        <h2 className="text-lg font-semibold">Members ({members.length})</h2>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (next) {
              setErrors({});
              setMessage("");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button leftIcon={<PlusIcon />}>Invite member</Button>
          </DialogTrigger>
          <DialogContent
            title="Invite member"
            description="They will receive an email with a link to join."
          >
            <form className="flex flex-col gap-md" noValidate onSubmit={submit}>
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="off"
                required
                error={errors.email}
              />
              <Select
                label="Role"
                name="role"
                placeholder="Choose a role"
                required
                error={errors.role}
              >
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
              </Select>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Send invitation</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <p role="status" className="min-h-6 text-sm text-feedback-success">
        {message}
      </p>
      <ul className="m-0 flex list-none flex-col p-0">
        {members.map((member, index) => (
          <li key={member.email}>
            {index > 0 ? <Divider decorative /> : null}
            <div className="flex items-center gap-md py-sm">
              <Avatar name={member.name} alt="" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{member.name}</p>
                <p className="truncate text-sm text-text-secondary">{member.email}</p>
              </div>
              <Badge variant={roleVariant[member.role]}>{member.role}</Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
