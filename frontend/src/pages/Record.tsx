import { useState, useEffect, useRef } from "react";
import {
  Mic,
  StopCircle,
  Save,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Equipment, equipmentApi, recordingsApi, Recording } from "@/lib/api";
import { format } from "date-fns";

type AnalysisResult = {
  prediction: number;
  remedies: string;
  fault_label: string;
  recording: Recording;
  equipmentName: string;
};

const Record = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maxDuration, setMaxDuration] = useState(60);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const equipment = await equipmentApi.list();
        setEquipmentList(equipment);
      } catch (error) {
        console.error("Error fetching equipment:", error);
        toast.error("Failed to load equipment list");
      } finally {
        setLoadingEquipment(false);
      }
    };

    fetchEquipment();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const invalidateDashboardData = async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["recordings"] }),
      queryClient.invalidateQueries({ queryKey: ["recordings-today", today] }),
      queryClient.invalidateQueries({ queryKey: ["alerts-active"] }),
      queryClient.invalidateQueries({ queryKey: ["equipment-status"] }),
    ]);
  };

  const handleRecordToggle = async () => {
    if (!selectedEquipment) {
      toast.error("Please select equipment first");
      return;
    }

    if (!isRecording) {
      try {
        setAnalysisResult(null);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          setRecordedAudio(blob);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        toast.success("Recording started");

        intervalRef.current = setInterval(() => {
          setRecordingTime((prev) => {
            const newTime = prev + 1;
            if (newTime >= maxDuration) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              if (
                mediaRecorderRef.current &&
                mediaRecorderRef.current.state !== "inactive"
              ) {
                mediaRecorderRef.current.stop();
              }
              setIsRecording(false);
              toast.success("Recording completed");
              return maxDuration;
            }
            return newTime;
          });
        }, 1000);
      } catch {
        toast.error("Failed to access microphone");
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  const handleSave = async () => {
    if (!recordedAudio) {
      toast.error("No recording to save");
      return;
    }

    const equipmentName =
      equipmentList.find((e) => String(e.id) === selectedEquipment)?.name ||
      "Equipment";

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("audio", recordedAudio, "recording.webm");
      formData.append("equipment_id", selectedEquipment);
      formData.append("duration", String(recordingTime));

      const result = await recordingsApi.upload(formData);
      await invalidateDashboardData();

      setAnalysisResult({
        prediction: result.prediction,
        remedies: result.remedies,
        fault_label: result.fault_label,
        recording: result.recording,
        equipmentName,
      });
      setRecordedAudio(null);
      setRecordingTime(0);
      toast.success("Analysis complete");
    } catch (error: any) {
      toast.error(error.message || "Failed to save recording");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRecording(false);
    }
    setRecordedAudio(null);
    setRecordingTime(0);
    toast.info("Recording cancelled");
  };

  const handleRecordAnother = () => {
    setAnalysisResult(null);
    setSelectedEquipment("");
    setRecordedAudio(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const severity =
    analysisResult == null
      ? "healthy"
      : analysisResult.prediction > 2
        ? "critical"
        : analysisResult.prediction > 0
          ? "warning"
          : "healthy";

  const severityClass =
    severity === "critical"
      ? "bg-error/10 text-error border-error/20"
      : severity === "warning"
        ? "bg-warning/10 text-warning border-warning/20"
        : "bg-success/10 text-success border-success/20";

  if (analysisResult) {
    const today = format(new Date(analysisResult.recording.created_at), "yyyy-MM-dd");
    return (
      <div className="min-h-screen bg-muted/30 pb-24 flex items-center justify-center">
        <div className="container mx-auto px-4 py-6 max-w-lg">
          <Card className="p-8 card-industrial">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                {analysisResult.prediction > 0 ? (
                  <AlertTriangle className="h-8 w-8 text-warning" />
                ) : (
                  <CheckCircle2 className="h-8 w-8 text-success" />
                )}
              </div>
              <h1 className="text-2xl font-heading font-bold mb-2">Analysis Result</h1>
              <p className="text-muted-foreground">{analysisResult.equipmentName}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={`${severityClass} capitalize`}>{severity}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fault</span>
                <span className="font-semibold text-right">
                  {analysisResult.fault_label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Code</span>
                <span className="font-mono font-semibold">
                  {analysisResult.prediction}
                </span>
              </div>
              <div className="bg-muted/50 p-4 rounded-md">
                <p className="text-sm font-semibold mb-1">Recommendation</p>
                <p className="text-sm text-muted-foreground">{analysisResult.remedies}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-primary"
                onClick={() => navigate(`/reports/${today}`)}
              >
                <FileText className="mr-2 h-5 w-5" />
                View Full Report
              </Button>
              {analysisResult.prediction > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/alerts")}
                >
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  View Alerts
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={handleRecordAnother}>
                <RotateCcw className="mr-2 h-5 w-5" />
                Record Another
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-24 flex items-center justify-center">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <Card className="p-8 card-industrial">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-heading font-bold mb-2">Audio Recording</h1>
            <p className="text-muted-foreground">
              Record equipment sounds for analysis
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Equipment</label>
              <Select
                value={selectedEquipment}
                onValueChange={setSelectedEquipment}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose equipment to monitor" />
                </SelectTrigger>
                <SelectContent>
                  {loadingEquipment ? (
                    <SelectItem value="loading" disabled>
                      Loading equipment...
                    </SelectItem>
                  ) : equipmentList.length === 0 ? (
                    <SelectItem value="no-equipment" disabled>
                      No equipment available — add some first
                    </SelectItem>
                  ) : (
                    equipmentList.map((equipment) => (
                      <SelectItem key={equipment.id} value={String(equipment.id)}>
                        {equipment.name} ({equipment.category} -{" "}
                        {equipment.plant_location})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                <Clock className="inline h-4 w-4 mr-1" />
                Recording Duration (seconds)
              </label>
              <Input
                type="number"
                min={10}
                max={300}
                value={maxDuration}
                onChange={(e) => setMaxDuration(parseInt(e.target.value) || 60)}
                disabled={isRecording || saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Max: {formatTime(maxDuration)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center mb-8">
            <button
              onClick={handleRecordToggle}
              disabled={!selectedEquipment || saving}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all touch-target ${
                isRecording
                  ? "bg-error hover:bg-error/90 animate-pulse"
                  : "bg-gradient-primary hover:opacity-90"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? (
                <StopCircle className="h-16 w-16 text-white" />
              ) : (
                <Mic className="h-16 w-16 text-white" />
              )}
            </button>

            <div className="mt-6 text-center w-full">
              <div className="text-3xl font-mono font-bold mb-2">
                {formatTime(recordingTime)}
              </div>
              {isRecording && (
                <div className="w-full max-w-xs mx-auto">
                  <Progress
                    value={(recordingTime / maxDuration) * 100}
                    className="mb-2"
                  />
                  <p className="text-sm text-muted-foreground">Recording in progress</p>
                </div>
              )}
              {saving && (
                <div className="w-full max-w-xs mx-auto mt-4">
                  <Progress value={66} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Uploading & running ML analysis… this can take a minute on first run
                  </p>
                </div>
              )}
            </div>
          </div>

          {(isRecording || recordedAudio) && !saving && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="mr-2 h-5 w-5" />
                Cancel
              </Button>
              {recordedAudio && (
                <Button
                  className="flex-1 bg-gradient-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="mr-2 h-5 w-5" />
                  Save & Analyze
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Record;
