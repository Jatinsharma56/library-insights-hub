import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format, startOfDay, subDays } from "date-fns";

interface LogRow {
  recorded_at: string;
  occupancy_percentage: number;
}

export default function OccupancyCharts() {
  const [todayData, setTodayData] = useState<{ hour: string; occupancy: number }[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ day: string; occupancy: number }[]>([]);

  useEffect(() => {
    async function fetch() {
      const todayStart = startOfDay(new Date()).toISOString();
      const { data: todayLogs } = await supabase
        .from("occupancy_logs")
        .select("recorded_at, occupancy_percentage")
        .gte("recorded_at", todayStart)
        .order("recorded_at");

      if (todayLogs) {
        const hourly = new Map<string, number[]>();
        (todayLogs as LogRow[]).forEach((l) => {
          const h = format(new Date(l.recorded_at), "HH:00");
          hourly.set(h, [...(hourly.get(h) || []), l.occupancy_percentage]);
        });
        setTodayData(
          Array.from(hourly, ([hour, vals]) => ({
            hour,
            occupancy: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
          }))
        );
      }

      const weekStart = subDays(new Date(), 7).toISOString();
      const { data: weekLogs } = await supabase
        .from("occupancy_logs")
        .select("recorded_at, occupancy_percentage")
        .gte("recorded_at", weekStart)
        .order("recorded_at");

      if (weekLogs) {
        const daily = new Map<string, number[]>();
        (weekLogs as LogRow[]).forEach((l) => {
          const d = format(new Date(l.recorded_at), "EEE");
          daily.set(d, [...(daily.get(d) || []), l.occupancy_percentage]);
        });
        setWeeklyData(
          Array.from(daily, ([day, vals]) => ({
            day,
            occupancy: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
          }))
        );
      }
    }
    fetch();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today's Occupancy Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {todayData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No data yet for today</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={todayData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Line type="monotone" dataKey="occupancy" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Occupancy</CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No data yet this week</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="occupancy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
