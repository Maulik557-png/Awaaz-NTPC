import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Mic, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Recording {
  id: string;
  equipment_id: string;
  user_id: string;
  audio_url: string;
  duration: number;
  analyzed: boolean;
  prediction?: number;
  remedies?: string;
  created_at: string;
}

interface RecentActivityProps {
  recordings?: Recording[];
}

const RecentActivity = ({ recordings = [] }: RecentActivityProps) => {
  const activities = recordings.slice(0, 4).map((recording) => ({
    id: recording.id,
    type: recording.analyzed ? "recording" : "pending",
    icon: recording.prediction && recording.prediction > 0 ? AlertTriangle : Mic,
    title: recording.analyzed
      ? `Fault ${recording.prediction} detected on ${recording.equipment_id}`
      : `Recording for ${recording.equipment_id} pending analysis`,
    user: "User", // Could fetch user name if needed
    time: formatDistanceToNow(new Date(recording.created_at), { addSuffix: true }),
    iconColor: recording.prediction && recording.prediction > 0 ? "text-warning" : "text-primary",
  }));

  return (
    <Card className="p-6 card-industrial">
      <h2 className="text-lg font-heading font-bold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.length > 0 ? activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className={`p-2 rounded-lg bg-muted ${activity.iconColor}`}>
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground mb-1">
                  {activity.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          );
        }) : (
          <p className="text-sm text-muted-foreground">No recent activities</p>
        )}
      </div>
    </Card>
  );
};

export default RecentActivity;
