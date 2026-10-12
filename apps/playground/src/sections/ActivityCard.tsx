import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Divider,
} from "@sette/ui";
import { activity } from "../data";

export function ActivityCard() {
  return (
    <Card as="section" aria-labelledby="activity-title">
      <CardHeader>
        <CardTitle as="h2" id="activity-title">
          Recent activity
        </CardTitle>
        <CardDescription>What happened across your projects.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col">
        <ul className="m-0 flex list-none flex-col p-0">
          {activity.map((item, index) => (
            <li key={item.id}>
              {index > 0 ? <Divider decorative /> : null}
              <div className="flex items-center justify-between gap-md py-sm">
                <div className="min-w-0">
                  <p className="truncate">{item.text}</p>
                  <p className="text-sm text-text-secondary">{item.time}</p>
                </div>
                <Badge variant={item.status}>{item.label}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
