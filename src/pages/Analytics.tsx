import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import OccupancyCharts from "@/components/OccupancyCharts";
import BestTimeCard from "@/components/BestTimeCard";
import NoiseMonitor from "@/components/NoiseMonitor";

export default function Analytics() {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Occupancy trends, noise levels & recommendations</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <NoiseMonitor />
          <BestTimeCard />
        </div>

        <OccupancyCharts />
      </main>
    </div>
  );
}
