import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Tables } from "@/integrations/supabase/types";

type Seat = Tables<"seats">;

interface SeatGridProps {
  seats: Seat[];
  onRefresh: () => void;
}

export default function SeatGrid({ seats, onRefresh }: SeatGridProps) {
  const { user } = useAuth();

  const handleSeatClick = async (seat: Seat) => {
    if (!user) return;

    if (seat.status === "booked" && seat.booked_by === user.id) {
      // Release own seat
      const { error } = await supabase
        .from("seats")
        .update({ status: "free", booked_by: null, booked_at: null, expires_at: null })
        .eq("id", seat.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Seat released", description: `Seat #${seat.seat_number} is now free.` });
        onRefresh();
      }
    } else if (seat.status === "free") {
      // Book seat - expires in 2 hours
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from("seats")
        .update({ status: "booked", booked_by: user.id, booked_at: new Date().toISOString(), expires_at: expiresAt })
        .eq("id", seat.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Seat booked!", description: `Seat #${seat.seat_number} booked for 2 hours.` });
        onRefresh();
      }
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.status === "booked" && seat.booked_by === user?.id) return "bg-blue-500 hover:bg-blue-600 text-white";
    if (seat.status === "booked") return "bg-destructive text-destructive-foreground cursor-not-allowed";
    return "bg-green-500 hover:bg-green-600 text-white cursor-pointer";
  };

  const getSeatLabel = (seat: Seat) => {
    if (seat.status === "booked" && seat.booked_by === user?.id) return "Your seat";
    if (seat.status === "booked") return "Booked";
    return "Click to book";
  };

  // Sort by seat_number and arrange in 5x10 grid
  const sorted = [...seats].sort((a, b) => a.seat_number - b.seat_number);

  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {sorted.map((seat) => (
        <Tooltip key={seat.id}>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleSeatClick(seat)}
              disabled={seat.status === "booked" && seat.booked_by !== user?.id}
              className={cn(
                "aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-colors",
                getSeatColor(seat)
              )}
            >
              {seat.seat_number}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Seat #{seat.seat_number} — {getSeatLabel(seat)}</p>
            {seat.status === "booked" && seat.expires_at && (
              <p className="text-xs text-muted-foreground">
                Expires: {new Date(seat.expires_at).toLocaleTimeString()}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
