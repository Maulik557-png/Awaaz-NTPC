import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { recordingsApi } from "@/lib/api";
import { format } from "date-fns";

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const recordings = await recordingsApi.list({ date: id! });

        if (recordings.length > 0) {
          const criticalIssues = recordings.filter(
            (r) => r.prediction != null && r.prediction > 2
          ).length;
          const warnings = recordings.filter(
            (r) => r.prediction != null && r.prediction > 0 && r.prediction <= 2
          ).length;
          const healthy = recordings.filter(
            (r) => !r.prediction || r.prediction === 0
          ).length;
          const healthScore = Math.round((healthy / recordings.length) * 100);

          setReport({
            id,
            title: `Analysis Report - ${format(new Date(id!), "MMM dd, yyyy")}`,
            date: id,
            status: "completed",
            equipment: recordings.length,
            healthScore,
            criticalIssues,
            warnings,
            summary: `Analysis completed for ${recordings.length} recording(s). ${criticalIssues} critical, ${warnings} warning(s).`,
            findings: recordings.map((recording) => ({
              equipment: recording.equipment_name,
              status:
                (recording.prediction ?? 0) > 2
                  ? "critical"
                  : (recording.prediction ?? 0) > 0
                    ? "warning"
                    : "healthy",
              issue:
                (recording.prediction ?? 0) > 0
                  ? `Fault ${recording.prediction} detected`
                  : "No issues detected",
              recommendation: recording.remedies || "Continue monitoring",
            })),
          });
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        toast.error("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 pb-24 flex items-center justify-center">
        <Card className="p-6">
          <p>Loading report...</p>
        </Card>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-muted/30 pb-24 flex items-center justify-center">
        <Card className="p-6">
          <p>Report not found</p>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-error/10 text-error border-error/20";
      case "warning":
        return "bg-warning/10 text-warning border-warning/20";
      case "healthy":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/reports")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-heading font-bold">{report.title}</h1>
              <p className="text-sm text-muted-foreground">{report.date}</p>
            </div>
            <Badge className="bg-success/10 text-success border-success/20 capitalize">
              {report.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{report.equipment}</div>
            <div className="text-xs text-muted-foreground">Recordings</div>
          </Card>
          <Card className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold">{report.healthScore}%</div>
            <div className="text-xs text-muted-foreground">Health Score</div>
          </Card>
          <Card className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-error" />
            <div className="text-2xl font-bold">{report.criticalIssues}</div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">Executive Summary</h2>
          <p className="text-muted-foreground">{report.summary}</p>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-4">Detailed Findings</h2>
          <div className="space-y-4">
            {report.findings.map((finding: any, index: number) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{finding.equipment}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{finding.issue}</p>
                  </div>
                  <Badge className={`${getStatusColor(finding.status)} capitalize`}>
                    {finding.status}
                  </Badge>
                </div>
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm">
                    <span className="font-semibold">Recommendation:</span>{" "}
                    {finding.recommendation}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
