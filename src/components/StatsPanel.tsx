import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, Armchair, CheckCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Seat = Tables<"seats">;

interface StatsPanelProps {
  seats: Seat[];
}

export default function StatsPanel({ seats }: StatsPanelProps) {
  const total = seats.length;
  const booked = seats.filter((s) => s.status === "booked").length;
  const free = total - booked;
  const percentage = total > 0 ? Math.round((booked / total) * 100) : 0;

  const crowdStatus = percentage < 40 ? "Low" : percentage < 75 ? "Medium" : "High";
  const crowdColor =
    crowdStatus === "Low"
      ? "bg-green-500/10 text-green-600 border-green-500/20"
      : crowdStatus === "Medium"
        ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
        : "bg-destructive/10 text-destructive border-destructive/20";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Seats</CardTitle>
          <Armchair className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Free Seats</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{free}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Booked Seats</CardTitle>
          <Users className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{booked}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
          <Badge className={crowdColor}>{crowdStatus}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{percentage}%</div>
          <Progress value={percentage} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  );
}
