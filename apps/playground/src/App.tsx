import { BellIcon } from "@design-system/icons";
import {
  Alert,
  Avatar,
  Divider,
  IconButton,
  Input,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ThemeProvider,
  Tooltip,
  TooltipProvider,
  useTheme,
} from "@sette/ui";
import { useState } from "react";
import { initialMembers, type Member } from "./data";
import { ActivityCard } from "./sections/ActivityCard";
import { DangerZone } from "./sections/DangerZone";
import { SettingsForm } from "./sections/SettingsForm";
import { StatCards } from "./sections/StatCards";
import { TeamPanel } from "./sections/TeamPanel";

const navigation = [
  { label: "Dashboard", current: true },
  { label: "Projects", current: false },
  { label: "Team", current: false },
  { label: "Billing", current: false },
];

function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Switch
      label="Dark mode"
      checked={resolvedTheme === "dark"}
      onChange={(event) => {
        setTheme(event.target.checked ? "dark" : "light");
      }}
    />
  );
}

function Dashboard() {
  const [projectName, setProjectName] = useState("Sette Console");
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [notice, setNotice] = useState<"welcome" | "deleted" | null>("welcome");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-md focus:top-md focus:z-50 focus:rounded-control focus:bg-action-primary focus:px-md focus:py-sm focus:text-text-on-action"
      >
        Skip to content
      </a>

      <aside className="shrink-0 border-b border-solid border-border-default bg-background-secondary md:w-64 md:border-e md:border-b-0">
        <div className="flex items-center gap-sm p-md text-lg font-semibold">
          <span
            aria-hidden="true"
            className="inline-block size-6 rounded-control bg-action-primary"
          />
          Sette
        </div>
        <nav aria-label="Primary" className="p-sm">
          <ul className="m-0 flex list-none flex-row gap-xs p-0 md:flex-col">
            {navigation.map((item) => (
              <li key={item.label}>
                <a
                  href="#main"
                  aria-current={item.current ? "page" : undefined}
                  className="block rounded-control px-md py-sm text-text-secondary outline-focus-ring hover:bg-background-tertiary hover:text-text-primary focus-visible:outline-2 aria-[current=page]:bg-background-tertiary aria-[current=page]:font-medium aria-[current=page]:text-text-primary"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-md border-b border-solid border-border-default p-md">
          <Input
            label="Search projects"
            hideLabel
            type="search"
            placeholder="Search projects…"
            className="w-64 max-w-full"
          />
          <div className="ms-auto flex items-center gap-md">
            <ThemeSwitch />
            <Tooltip content="Notifications">
              <IconButton aria-label="Notifications" variant="outline">
                <BellIcon />
              </IconButton>
            </Tooltip>
            <Avatar name="Ada Lovelace" />
          </div>
        </header>

        <main id="main" tabIndex={-1} className="flex flex-col gap-lg p-md md:p-lg">
          <h1 className="text-3xl font-semibold">{projectName}</h1>

          {notice === "welcome" ? (
            <Alert
              variant="info"
              title="Welcome back"
              onDismiss={() => {
                setNotice(null);
              }}
            >
              Your deployment pipeline is healthy. Review the open issues below.
            </Alert>
          ) : null}
          {notice === "deleted" ? (
            <Alert
              variant="warning"
              title="Project deleted"
              onDismiss={() => {
                setNotice(null);
              }}
            >
              This is a demo, so nothing was actually removed.
            </Alert>
          ) : null}

          <Tabs defaultValue="overview">
            <TabsList aria-label="Project sections">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="flex flex-col gap-lg">
              <StatCards />
              <ActivityCard />
              <DangerZone
                projectName={projectName}
                onDelete={() => {
                  setNotice("deleted");
                }}
              />
            </TabsContent>
            <TabsContent value="team">
              <TeamPanel
                members={members}
                onInvite={(member) => {
                  setMembers((current) => [...current, member]);
                }}
              />
            </TabsContent>
            <TabsContent value="settings">
              <SettingsForm
                projectName={projectName}
                onSaved={(settings) => {
                  setProjectName(settings.name);
                }}
              />
            </TabsContent>
          </Tabs>

          <Divider decorative />
          <footer className="text-sm text-text-secondary">
            Built with <code>@sette/ui</code> — every colour, space and radius on this page comes
            from design tokens.
          </footer>
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider storageKey="sette-theme">
      <TooltipProvider>
        <Dashboard />
      </TooltipProvider>
    </ThemeProvider>
  );
}
