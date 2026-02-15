import { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SeatGrid from "@/components/SeatGrid";
import StatsPanel from "@/components/StatsPanel";
import NoiseMonitor from "@/components/NoiseMonitor";
import BestTimeCard from "@/components/BestTimeCard";
import LibraryStatusCard from "@/components/LibraryStatusCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";

type Seat = Tables<"seats">;

export default function Index() {
  const { user, loading } = useAuth();
  const [seats, setSeats] = useState<Seat[]>([]);

  const fetchSeats = useCallback(async () => {
    const { data } = await supabase.from("seats").select("*").order("seat_number");
    if (data) setSeats(data);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchSeats();

    // Real-time subscription
    const channel = supabase
      .channel("seats-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "seats" }, () => {
        fetchSeats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchSeats]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Library Dashboard</h1>
          <p className="text-muted-foreground">Real-time seat monitoring & booking</p>
        </div>

        <StatsPanel seats={seats} />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Seat Map</CardTitle>
                <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-green-500" /> Free</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-destructive" /> Booked</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-blue-500" /> Your Seat</span>
              <span className="flex items-center gap-1">⚡ Electric Port</span>
                </div>
              </CardHeader>
              <CardContent>
                <SeatGrid seats={seats} onRefresh={fetchSeats} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <LibraryStatusCard />
            <NoiseMonitor />
            <BestTimeCard />
          </div>
        </div>
      </main>
    </div>
  );
}
