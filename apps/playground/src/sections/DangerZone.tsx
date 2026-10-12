import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  Input,
} from "@sette/ui";
import { useState } from "react";

interface DangerZoneProps {
  projectName: string;
  onDelete: () => void;
}

/** Destructive action guarded by a confirmation dialog: the user must type the project name. */
export function DangerZone({ projectName, onDelete }: DangerZoneProps) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const matches = typed === projectName;

  return (
    <Card as="section" aria-labelledby="danger-title">
      <CardHeader>
        <CardTitle as="h2" id="danger-title">
          Danger zone
        </CardTitle>
        <CardDescription>Deleting a project removes its data permanently.</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setTyped("");
          }}
        >
          <DialogTrigger asChild>
            <Button variant="danger">Delete project</Button>
          </DialogTrigger>
          <DialogContent title="Delete project" description="This action cannot be undone.">
            <form
              className="flex flex-col gap-md"
              onSubmit={(event) => {
                event.preventDefault();
                if (!matches) return;
                setOpen(false);
                onDelete();
              }}
            >
              <Input
                label={`Type “${projectName}” to confirm`}
                value={typed}
                onChange={(event) => {
                  setTyped(event.target.value);
                }}
                autoComplete="off"
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" variant="danger" disabled={!matches}>
                  Delete
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
