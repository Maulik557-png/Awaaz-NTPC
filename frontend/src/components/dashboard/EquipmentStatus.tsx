import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Fan, Gauge, Waves, Flame } from "lucide-react";

const equipment = [
  { id: 1, name: "Motor #A12", type: "Motor", status: "healthy", icon: Activity, lastCheck: "2 min ago" },
  { id: 2, name: "Pump #B34", type: "Pump", status: "warning", icon: Waves, lastCheck: "15 min ago" },
  { id: 3, name: "Turbine #T5", type: "Turbine", status: "healthy", icon: Fan, lastCheck: "1 hr ago" },
  { id: 4, name: "Valve #V78", type: "Valve", status: "critical", icon: Gauge, lastCheck: "5 min ago" },
  { id: 5, name: "Heat Exchanger #H2", type: "Heat Exchanger", status: "healthy", icon: Flame, lastCheck: "30 min ago" },
];

const statusConfig = {
  healthy: { label: "Healthy", class: "status-healthy" },
  warning: { label: "Warning", class: "status-warning" },
  critical: { label: "Critical", class: "status-critical" },
};

const EquipmentStatus = () => {
  return (
    <Card className="p-6 card-industrial">
      <h2 className="text-lg font-heading font-bold mb-4">Equipment Status Overview</h2>
      <div className="space-y-3">
        {equipment.map((item) => {
          const Icon = item.icon;
          const config = statusConfig[item.status as keyof typeof statusConfig];
          
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.type}</p>
                </div>
              </div>
              
              <div className="text-right">
                <Badge className={`${config.class} border`} variant="outline">
                  {config.label}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">{item.lastCheck}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default EquipmentStatus;
