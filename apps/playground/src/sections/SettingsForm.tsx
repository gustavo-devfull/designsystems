import {
  Alert,
  Button,
  Checkbox,
  Input,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Textarea,
} from "@sette/ui";
import { useRef, useState, type SyntheticEvent } from "react";
import { flushSync } from "react-dom";
import { saveSettings, type ProjectSettings } from "../api";

interface SettingsFormProps {
  projectName: string;
  onSaved: (settings: ProjectSettings) => void;
}

interface Errors {
  name?: string;
  description?: string;
  visibility?: string;
}

const formText = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
};

export function SettingsForm({ projectName, onSaved }: SettingsFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const settings: ProjectSettings = {
      name: formText(data, "name").trim(),
      description: formText(data, "description"),
      visibility: formText(data, "visibility"),
      comments: data.has("comments"),
      notify: data.has("notify"),
    };

    const next: Errors = {};
    if (!settings.name) next.name = "Give your project a name.";
    if (settings.description.length > 200)
      next.description = "Keep the description under 200 characters.";
    if (!settings.visibility) next.visibility = "Choose who can see this project.";
    // Commit the errors to the DOM first: focus targets are found through aria-invalid.
    flushSync(() => {
      setErrors(next);
      setSaved(false);
    });

    if (Object.keys(next).length > 0) {
      // Move focus to the first invalid control so keyboard and screen-reader users land on the problem.
      formRef.current
        ?.querySelector<HTMLElement>(
          "input[aria-invalid='true'], textarea[aria-invalid='true'], fieldset[aria-invalid='true'] input",
        )
        ?.focus();
      return;
    }

    setSaving(true);
    const result = await saveSettings(settings);
    setSaving(false);
    setSaved(true);
    onSaved(result);
  };

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(e) => void onSubmit(e)}
      className="flex max-w-dialog-md flex-col gap-lg"
    >
      <h2 className="text-lg font-semibold">Project settings</h2>
      {saved ? (
        <Alert
          variant="success"
          title="Settings saved"
          onDismiss={() => {
            setSaved(false);
          }}
        >
          Your changes are live.
        </Alert>
      ) : null}
      <Input
        label="Project name"
        name="name"
        defaultValue={projectName}
        required
        error={errors.name}
      />
      <Textarea
        label="Description"
        name="description"
        rows={3}
        helperText="Up to 200 characters."
        error={errors.description}
      />
      <Select label="Region" name="region" defaultValue="sa-east">
        <option value="sa-east">São Paulo</option>
        <option value="us-east">N. Virginia</option>
        <option value="eu-west">Ireland</option>
      </Select>
      <RadioGroup legend="Visibility" name="visibility" required error={errors.visibility}>
        <Radio value="private" label="Private" helperText="Only you" />
        <Radio value="team" label="Team" helperText="Everyone in your workspace" />
        <Radio value="public" label="Public" helperText="Anyone with the link" />
      </RadioGroup>
      <Switch
        label="Allow comments"
        name="comments"
        defaultChecked
        helperText="Members can discuss changes."
      />
      <Checkbox label="Notify members when settings change" name="notify" defaultChecked />
      <div>
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
