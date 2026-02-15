import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface HourSlot {
  hour: number;
  avg: number;
}

export default function BestTimeCard() {
  const [bestSlots, setBestSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function analyze() {
      const { data } = await supabase
        .from("occupancy_logs")
        .select("recorded_at, occupancy_percentage")
        .order("recorded_at");

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      const hourlyMap = new Map<number, number[]>();
      data.forEach((l) => {
        const h = new Date(l.recorded_at).getHours();
        hourlyMap.set(h, [...(hourlyMap.get(h) || []), l.occupancy_percentage]);
      });

      const hourlyAvg: HourSlot[] = Array.from(hourlyMap, ([hour, vals]) => ({
        hour,
        avg: vals.reduce((a, b) => a + b, 0) / vals.length,
      })).sort((a, b) => a.avg - b.avg);

      // Find contiguous low-occupancy ranges (below 40%)
      const lowHours = hourlyAvg.filter((h) => h.avg < 40).map((h) => h.hour).sort((a, b) => a - b);

      if (lowHours.length === 0) {
        // Just pick the 3 lowest hours
        const best = hourlyAvg.slice(0, 3).map((h) => h.hour).sort((a, b) => a - b);
        setBestSlots(formatRanges(best));
      } else {
        setBestSlots(formatRanges(lowHours));
      }
      setLoading(false);
    }
    analyze();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Best Time to Visit</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Analyzing...</p>
        ) : bestSlots.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not enough data yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {bestSlots.map((slot) => (
              <Badge key={slot} variant="secondary" className="text-sm">
                {slot}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatRanges(hours: number[]): string[] {
  if (hours.length === 0) return [];
  const ranges: string[] = [];
  let start = hours[0];
  let end = hours[0];

  for (let i = 1; i < hours.length; i++) {
    if (hours[i] === end + 1) {
      end = hours[i];
    } else {
      ranges.push(`${fmtHour(start)}-${fmtHour(end + 1)}`);
      start = hours[i];
      end = hours[i];
    }
  }
  ranges.push(`${fmtHour(start)}-${fmtHour(end + 1)}`);
  return ranges;
}

function fmtHour(h: number): string {
  const hour = h % 24;
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}
