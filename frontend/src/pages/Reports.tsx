import { FileText, Calendar, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { recordingsApi, Recording } from "@/lib/api";
import { format } from "date-fns";

type ReportGroup = {
  id: string;
  title: string;
  date: string;
  type: string;
  status: string;
  equipment: number;
  recordings: Recording[];
};

const Reports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [reportsData, setReportsData] = useState<ReportGroup[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const recordings = await recordingsApi.list();
        const reportsMap = new Map<string, ReportGroup>();

        recordings.forEach((recording) => {
          const date = format(new Date(recording.created_at), "yyyy-MM-dd");
          if (!reportsMap.has(date)) {
            reportsMap.set(date, {
              id: date,
              title: `Analysis Report - ${format(new Date(recording.created_at), "MMM dd, yyyy")}`,
              date,
              type: "daily",
              status: "completed",
              equipment: 0,
              recordings: [],
            });
          }
          const report = reportsMap.get(date)!;
          report.equipment += 1;
          report.recordings.push(recording);
        });

        setReportsData(Array.from(reportsMap.values()));
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast.error("Failed to load reports");
      }
    };

    fetchReports();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success border-success/20";
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filterReports = (type: string) => {
    if (type === "all") return reportsData;
    return reportsData.filter((report) => report.type === type);
  };

  const renderReportCards = (reports: ReportGroup[]) => {
    if (reports.length === 0) {
      return (
        <Card className="p-6 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No reports available yet. Record and analyze equipment sounds first.</p>
        </Card>
      );
    }

    return reports.map((report) => (
      <Card
        key={report.id}
        className="p-4 card-industrial hover:shadow-industrial transition-shadow"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{report.title}</h3>
            <p className="text-sm text-muted-foreground">
              {report.date} • {report.equipment} recording(s)
            </p>
          </div>
          <Badge className={`${getStatusColor(report.status)} capitalize ml-2`}>
            {report.status}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate(`/reports/${report.id}`)}
        >
          View Report
        </Button>
      </Card>
    ));
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-heading font-bold mb-4">Reports & Analytics</h1>

          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 text-center">
              <FileText className="h-6 w-6 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold">{reportsData.length}</div>
              <div className="text-xs text-muted-foreground">Total Reports</div>
            </Card>
            <Card className="p-3 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-1 text-success" />
              <div className="text-2xl font-bold">
                {reportsData.reduce((sum, r) => sum + r.equipment, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Recordings</div>
            </Card>
            <Card className="p-3 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-1 text-warning" />
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start mb-6 overflow-x-auto">
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderReportCards(filterReports("all"))}
          </TabsContent>
          <TabsContent value="daily" className="space-y-4">
            {renderReportCards(filterReports("daily"))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
