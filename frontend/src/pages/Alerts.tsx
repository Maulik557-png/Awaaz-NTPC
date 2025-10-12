import { AlertTriangle, AlertCircle, Info, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const alertsData = [
  { id: 1, title: "Critical Vibration Detected", equipment: "Turbine T2", severity: "critical", status: "active", message: "Abnormal vibration levels detected. Immediate inspection required.", time: "5 mins ago" },
  { id: 2, title: "Temperature Warning", equipment: "Motor Unit A1", severity: "warning", status: "active", message: "Operating temperature above normal range.", time: "15 mins ago" },
  { id: 3, title: "Pressure Fluctuation", equipment: "Pump B3", severity: "warning", status: "active", message: "Minor pressure variations detected during operation.", time: "45 mins ago" },
  { id: 4, title: "Maintenance Due", equipment: "Valve C7", severity: "info", status: "active", message: "Scheduled maintenance is due within 24 hours.", time: "2 hours ago" },
  { id: 5, title: "High Temperature Alert", equipment: "Heat Exchanger HX5", severity: "critical", status: "acknowledged", message: "Critical temperature threshold exceeded.", time: "3 hours ago" },
  { id: 6, title: "Lubrication Low", equipment: "Motor Unit A2", severity: "warning", status: "acknowledged", message: "Lubrication levels below recommended threshold.", time: "5 hours ago" },
  { id: 7, title: "Inspection Completed", equipment: "Pump B1", severity: "info", status: "resolved", message: "Routine inspection completed successfully.", time: "1 day ago" },
  { id: 8, title: "Bearing Replacement", equipment: "Motor Unit A3", severity: "warning", status: "resolved", message: "Bearing replacement completed. Equipment operational.", time: "2 days ago" },
];

const Alerts = () => {
  const [activeTab, setActiveTab] = useState("all");

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertCircle className="h-5 w-5 text-error" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "info": return <Info className="h-5 w-5 text-primary" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-error/10 text-error border-error/20";
      case "warning": return "bg-warning/10 text-warning border-warning/20";
      case "info": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-error/10 text-error border-error/20";
      case "acknowledged": return "bg-warning/10 text-warning border-warning/20";
      case "resolved": return "bg-success/10 text-success border-success/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filterAlerts = (type: string) => {
    if (type === "all") return alertsData;
    if (type === "critical" || type === "warning" || type === "info") {
      return alertsData.filter(alert => alert.severity === type);
    }
    return alertsData.filter(alert => alert.status === type);
  };

  const handleAcknowledge = (alertId: number) => {
    toast.success("Alert acknowledged");
  };

  const handleResolve = (alertId: number) => {
    toast.success("Alert marked as resolved");
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
                {alertsData.filter(a => a.severity === "critical").length}
              </div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </Card>
            <Card className="p-3 text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-warning" />
              <div className="text-2xl font-bold">
                {alertsData.filter(a => a.severity === "warning").length}
              </div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </Card>
            <Card className="p-3 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-success" />
              <div className="text-2xl font-bold">
                {alertsData.filter(a => a.status === "resolved").length}
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
              {filterAlerts(tab).length > 0 ? (
                filterAlerts(tab).map((alert) => (
                  <Card key={alert.id} className="p-4 card-industrial">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{alert.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {alert.equipment} • {alert.time}
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
                  <p>No {tab} alerts</p>
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