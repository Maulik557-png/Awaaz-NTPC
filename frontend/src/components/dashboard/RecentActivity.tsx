import { Card } from "@/components/ui/card";
import { AlertTriangle, Mic } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Recording } from "@/lib/api";

interface RecentActivityProps {
  recordings?: Recording[];
}

const RecentActivity = ({ recordings = [] }: RecentActivityProps) => {
  const activities = recordings.slice(0, 4).map((recording) => ({
    id: recording.id,
    icon: recording.prediction && recording.prediction > 0 ? AlertTriangle : Mic,
    title: recording.analyzed
      ? `Fault ${recording.prediction} on ${recording.equipment_name}`
      : `Recording for ${recording.equipment_name} pending analysis`,
    time: formatDistanceToNow(new Date(recording.created_at), { addSuffix: true }),
    iconColor:
      recording.prediction && recording.prediction > 0 ? "text-warning" : "text-primary",
  }));

  return (
    <Card className="p-6 card-industrial">
      <h2 className="text-lg font-heading font-bold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
              >
                <div className={`p-2 rounded-lg bg-muted ${activity.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">No recent activities</p>
        )}
      </div>
    </Card>
  );
};

export default RecentActivity;
