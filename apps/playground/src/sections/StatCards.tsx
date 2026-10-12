import { Badge, Card, CardContent, CardDescription, CardHeader } from "@sette/ui";
import { stats } from "../data";

export function StatCards() {
  return (
    <ul className="grid list-none grid-cols-1 gap-md p-0 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <li key={stat.label}>
          <Card as="article" className="h-full">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-sm">
              <span className="text-3xl font-semibold whitespace-nowrap">{stat.value}</span>
              <Badge variant={stat.tone} size="sm">
                {stat.trend}
              </Badge>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
