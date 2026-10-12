export interface Member {
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
}

export const initialMembers: Member[] = [
  { name: "Ada Lovelace", email: "ada@sette.dev", role: "Owner" },
  { name: "Grace Hopper", email: "grace@sette.dev", role: "Admin" },
  { name: "Linus Torvalds", email: "linus@sette.dev", role: "Member" },
];

export const stats = [
  { label: "Revenue", value: "R$ 48.200", trend: "+12%", tone: "success" },
  { label: "Active users", value: "1.284", trend: "+4%", tone: "success" },
  { label: "Open issues", value: "23", trend: "+3", tone: "warning" },
  { label: "Uptime", value: "99,98%", trend: "stable", tone: "neutral" },
] as const;

export const activity = [
  {
    id: 1,
    text: "Grace deployed v2.4.0 to production",
    time: "2 min ago",
    status: "success",
    label: "Deployed",
  },
  { id: 2, text: "Build #1042 failed on main", time: "1 h ago", status: "error", label: "Failed" },
  {
    id: 3,
    text: "Linus opened pull request #88",
    time: "3 h ago",
    status: "info",
    label: "In review",
  },
  {
    id: 4,
    text: "Ada updated the billing plan",
    time: "Yesterday",
    status: "neutral",
    label: "Updated",
  },
] as const;
