import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Share2, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Parse the date from URL params (yyyy-MM-dd format)
        const reportDate = new Date(id!);
        const startOfDay = new Date(reportDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(reportDate);
        endOfDay.setHours(23, 59, 59, 999);

        const { data: recordings, error } = await supabase
          .from('recordings')
          .select('*')
          .gte('created_at', startOfDay.toISOString())
          .lt('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (recordings && recordings.length > 0) {
          const criticalIssues = recordings.filter(r => r.prediction && r.prediction > 2).length;
          const warnings = recordings.filter(r => r.prediction && r.prediction > 0 && r.prediction <= 2).length;
          const healthy = recordings.filter(r => !r.prediction || r.prediction === 0).length;
          const healthScore = Math.round((healthy / recordings.length) * 100);

          setReport({
            id: id,
            title: `Analysis Report - ${format(new Date(id!), 'MMM dd, yyyy')}`,
            date: id,
            type: "Daily",
            status: "completed",
            equipment: recordings.length,
            healthScore: healthScore,
            criticalIssues: criticalIssues,
            warnings: warnings,
            summary: `Analysis completed for ${recordings.length} equipment recordings. ${criticalIssues} critical issues, ${warnings} warnings detected.`,
            findings: recordings.map((recording: any) => ({
              equipment: recording.equipment_id,
              status: recording.prediction > 2 ? "critical" : recording.prediction > 0 ? "warning" : "healthy",
              issue: recording.prediction > 0 ? `Fault ${recording.prediction} detected` : "No issues detected",
              recommendation: recording.remedies || "Continue monitoring",
            })),
          });
        }
      } catch (error) {
        console.error('Error fetching report:', error);
        toast.error('Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
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

  const handleDownload = () => {
    toast.success("Report downloaded successfully");
  };

  const handleShare = () => {
    toast.success("Report shared with team");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "bg-error/10 text-error border-error/20";
      case "warning": return "bg-warning/10 text-warning border-warning/20";
      case "healthy": return "bg-success/10 text-success border-success/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/reports")}
            >
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

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{report.equipment}</div>
            <div className="text-xs text-muted-foreground">Equipment</div>
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

        {/* Executive Summary */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">Executive Summary</h2>
          <p className="text-muted-foreground">{report.summary}</p>
        </Card>

        {/* Detailed Findings */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Detailed Findings</h2>
          <div className="space-y-4">
            {report.findings.map((finding, index) => (
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
                    <span className="font-semibold">Recommendation:</span> {finding.recommendation}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Maintenance Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">Recommended Actions</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-error mt-2" />
              <p className="text-sm">Schedule immediate inspection for Turbine T2</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-warning mt-2" />
              <p className="text-sm">Monitor Motor Unit A1 and Pump B3 closely</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-success mt-2" />
              <p className="text-sm">Continue regular inspection schedule for healthy equipment</p>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default ReportDetail;