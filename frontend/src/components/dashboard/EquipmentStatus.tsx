import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Fan, Gauge, Waves, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { equipmentApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const iconMap = {
  motors: Activity,
  pumps: Waves,
  turbines: Fan,
  valves: Gauge,
  heat_exchangers: Flame,
};

const statusConfig = {
  healthy: { label: "Healthy", class: "status-healthy" },
  warning: { label: "Warning", class: "status-warning" },
  critical: { label: "Critical", class: "status-critical" },
  offline: { label: "Offline", class: "status-critical" },
};

const EquipmentStatus = () => {
  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ["equipment-status"],
    queryFn: () => equipmentApi.list(),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const items = equipment.slice(0, 5);

  return (
    <Card className="p-6 card-industrial">
      <h2 className="text-lg font-heading font-bold mb-4">Equipment Status Overview</h2>
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No equipment registered yet. Add equipment to see status here.
          </p>
        ) : (
          items.map((item) => {
            const Icon = iconMap[item.category as keyof typeof iconMap] || Activity;
            const config =
              statusConfig[item.status as keyof typeof statusConfig] ||
              statusConfig.healthy;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                </div>

                <div className="text-right">
                  <Badge className={`${config.class} border`} variant="outline">
                    {config.label}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.last_inspection
                      ? formatDistanceToNow(new Date(item.last_inspection), {
                          addSuffix: true,
                        })
                      : "No inspection"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default EquipmentStatus;
