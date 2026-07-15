import { AlertTriangle, AlertCircle, Info, CheckCircle2, Clock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Alert, alertsApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const Alerts = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await alertsApi.list();
      setAlerts(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-error" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "info":
        return <Info className="h-5 w-5 text-primary" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-error/10 text-error border-error/20";
      case "warning":
        return "bg-warning/10 text-warning border-warning/20";
      case "info":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-error/10 text-error border-error/20";
      case "acknowledged":
        return "bg-warning/10 text-warning border-warning/20";
      case "resolved":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filterAlerts = (type: string) => {
    if (type === "all") return alerts;
    if (type === "critical" || type === "warning" || type === "info") {
      return alerts.filter((alert) => alert.severity === type);
    }
    return alerts.filter((alert) => alert.status === type);
  };

  const handleAcknowledge = async (alertId: number) => {
    try {
      await alertsApi.updateStatus(alertId, "acknowledged");
      toast.success("Alert acknowledged");
      await loadAlerts();
    } catch (error: any) {
      toast.error(error.message || "Failed to acknowledge alert");
    }
  };

  const handleResolve = async (alertId: number) => {
    try {
      await alertsApi.updateStatus(alertId, "resolved");
      toast.success("Alert marked as resolved");
      await loadAlerts();
    } catch (error: any) {
      toast.error(error.message || "Failed to resolve alert");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-heading font-bold mb-4">Alerts & Notifications</h1>

          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 text-center">
              <AlertCircle className="h-6 w-6 mx-auto mb-1 text-error" />
              <div className="text-2xl font-bold">
                {alerts.filter((a) => a.severity === "critical").length}
              </div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </Card>
            <Card className="p-3 text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-warning" />
              <div className="text-2xl font-bold">
                {alerts.filter((a) => a.severity === "warning").length}
              </div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </Card>
            <Card className="p-3 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-success" />
              <div className="text-2xl font-bold">
                {alerts.filter((a) => a.status === "resolved").length}
              </div>
              <div className="text-xs text-muted-foreground">Resolved</div>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start mb-6 overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="warning">Warning</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          {["all", "critical", "warning", "info", "resolved"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {loading ? (
                <Card className="p-6 text-center text-muted-foreground">Loading alerts...</Card>
              ) : filterAlerts(tab).length > 0 ? (
                filterAlerts(tab).map((alert) => (
                  <Card key={alert.id} className="p-4 card-industrial">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{alert.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {alert.equipment_name || "Unknown equipment"} •{" "}
                              {formatDistanceToNow(new Date(alert.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={`${getSeverityColor(alert.severity)} capitalize`}>
                              {alert.severity}
                            </Badge>
                            <Badge className={`${getStatusColor(alert.status)} capitalize`}>
                              {alert.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>
                        {alert.status === "active" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Acknowledge
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-primary"
                              onClick={() => handleResolve(alert.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-6 text-center text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No {tab === "all" ? "" : tab + " "}alerts yet</p>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Alerts;
