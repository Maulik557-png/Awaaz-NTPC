import { Activity, AlertTriangle, CheckCircle2, Mic, FileText, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { recordingsApi, alertsApi } from "@/lib/api";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import EquipmentStatus from "@/components/dashboard/EquipmentStatus";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { format } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: recordings } = useQuery({
    queryKey: ["recordings"],
    queryFn: () => recordingsApi.list({ limit: "20" }),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const { data: todayRecordings } = useQuery({
    queryKey: ["recordings-today", today],
    queryFn: () => recordingsApi.list({ date: today }),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const { data: alerts } = useQuery({
    queryKey: ["alerts-active"],
    queryFn: () => alertsApi.list({ status: "active" }),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const totalRecordings = recordings?.length || 0;
  const activeAlerts = alerts?.length || 0;
  const analyzedToday =
    todayRecordings?.filter((r) => r.analyzed).length || 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />

      <main className="container mx-auto px-4 pb-24 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatsCard
            icon={Activity}
            title="Total Recordings"
            value={totalRecordings.toString()}
            subtitle="Recent"
            variant="primary"
          />
          <StatsCard
            icon={AlertTriangle}
            title="Active Alerts"
            value={activeAlerts.toString()}
            subtitle="Needs attention"
            variant="warning"
          />
          <StatsCard
            icon={CheckCircle2}
            title="Analyzed Today"
            value={analyzedToday.toString()}
            subtitle="Processed recordings"
            variant="success"
          />
        </div>

        <Card className="p-6 mb-6 card-industrial">
          <h2 className="text-lg font-heading font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              className="h-14 bg-gradient-primary hover:opacity-90 touch-target"
              onClick={() => navigate("/record")}
            >
              <Mic className="mr-2 h-5 w-5" />
              Start Recording
            </Button>
            <Button
              variant="outline"
              className="h-14 touch-target"
              onClick={() => navigate("/reports")}
            >
              <FileText className="mr-2 h-5 w-5" />
              View Reports
            </Button>
            <Button
              variant="outline"
              className="h-14 border-error text-error hover:bg-error/10 touch-target"
              onClick={() => navigate("/alerts")}
            >
              <AlertCircle className="mr-2 h-5 w-5" />
              View Alerts
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EquipmentStatus />
          <RecentActivity recordings={recordings} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
