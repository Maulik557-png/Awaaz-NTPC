import { Bell, Settings, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { alertsApi } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts-active"],
    queryFn: () => alertsApi.list({ status: "active" }),
    refetchOnMount: "always",
  });

  const activeCount = alerts.length;

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-heading font-bold text-primary">Awaaz</h1>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <span className="font-semibold">Plant 1 - Korba</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem>Plant 1 - Korba</DropdownMenuItem>
                <DropdownMenuItem>Plant 2 - Ramagundam</DropdownMenuItem>
                <DropdownMenuItem>Plant 3 - Dadri</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative touch-target"
              onClick={() => navigate("/alerts")}
            >
              <Bell className="h-5 w-5" />
              {activeCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 bg-error text-white border-0 text-xs">
                  {activeCount > 99 ? "99+" : activeCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="touch-target"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="touch-target"
              onClick={() => navigate("/profile")}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
