import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DoorOpen, DoorClosed, Coffee } from "lucide-react";

const OPEN_HOUR = 10;    // 10:00 AM
const CLOSE_HOUR = 19;   // 7:30 PM (19:30)
const CLOSE_MINUTE = 30;
const LUNCH_HOUR = 13;   // 1:00 PM
const LUNCH_DURATION = 60; // minutes

function getLibraryStatus(now: Date) {
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMin = h * 60 + m;

  const openMin = OPEN_HOUR * 60;
  const closeMin = CLOSE_HOUR * 60 + CLOSE_MINUTE;
  const lunchStart = LUNCH_HOUR * 60;
  const lunchEnd = lunchStart + LUNCH_DURATION;

  if (totalMin < openMin || totalMin >= closeMin) {
    return { status: "closed" as const, label: "Closed", nextEvent: totalMin < openMin ? "Opens at 10:00 AM" : "Opens tomorrow at 10:00 AM" };
  }
  if (totalMin >= lunchStart && totalMin < lunchEnd) {
    return { status: "break" as const, label: "Lunch Break", nextEvent: "Resumes at 2:00 PM" };
  }
  if (totalMin >= openMin && totalMin < lunchStart) {
    return { status: "open" as const, label: "Open", nextEvent: "Lunch break at 1:00 PM" };
  }
  return { status: "open" as const, label: "Open", nextEvent: `Closes at 7:30 PM` };
}

export default function LibraryStatusCard() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const { status, label, nextEvent } = getLibraryStatus(now);

  const icon = status === "open" ? <DoorOpen className="h-5 w-5" /> : status === "break" ? <Coffee className="h-5 w-5" /> : <DoorClosed className="h-5 w-5" />;
  const badgeColor =
    status === "open"
      ? "bg-green-500/10 text-green-600 border-green-500/20"
      : status === "break"
        ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
        : "bg-destructive/10 text-destructive border-destructive/20";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Library Status</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge className={badgeColor}>{label}</Badge>
          <span className="text-xs text-muted-foreground">{nextEvent}</span>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>Mon – Sun: 10:00 AM – 7:30 PM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Coffee className="h-3 w-3" />
            <span>Lunch Break: 1:00 PM – 2:00 PM</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
