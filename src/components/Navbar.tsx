import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const { user, role, signOut } = useAuth();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg">Smart Library</span>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="capitalize">{role}</Badge>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
