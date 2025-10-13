import { useState, useEffect, useRef } from "react";
import { Mic, StopCircle, Save, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Record = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [maxDuration, setMaxDuration] = useState(60);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const { data: equipment, error } = await supabase
          .from('equipment')
          .select('id, name, category, plant_location')
          .order('name');

        if (error) throw error;

        setEquipmentList(equipment || []);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        toast.error('Failed to load equipment list');
      } finally {
        setLoadingEquipment(false);
      }
    };

    fetchEquipment();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleRecordToggle = async () => {
    if (!selectedEquipment) {
      toast.error("Please select equipment first");
      return;
    }
    
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setRecordedAudio(blob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        toast.success("Recording started");

        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => {
            const newTime = prev + 1;
            if (newTime >= maxDuration) {
              // Stop recording when max duration is reached
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
              }
              setIsRecording(false);
              toast.success("Recording completed");
              return maxDuration;
            }
            return newTime;
          });
        }, 1000);
      } catch (error) {
        toast.error("Failed to access microphone");
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
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

    try {
      // First, send to backend for analysis
      const formData = new FormData();
      formData.append('audio', recordedAudio, 'recording.webm');

      console.log('Sending audio to backend:', formData.get('audio'));
      const backendResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload/`, {
        method: 'POST',
        body: formData,
      });

      console.log('Backend response status:', backendResponse.status);
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Backend error:', errorText);
        throw new Error(`Backend analysis failed: ${backendResponse.status} ${errorText}`);
      }

      const { prediction, remedies, spectrogram_url } = await backendResponse.json();
      console.log('Backend response:', { prediction, remedies, spectrogram_url });

      // Then, save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to save recordings");
        return;
      }

      const fileName = `recording_${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, recordedAudio);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('recordings')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('recordings')
        .insert({
          equipment_id: selectedEquipment,
          user_id: user.id,
          audio_url: publicUrl,
          duration: recordingTime,
          analyzed: true,
          prediction,
          remedies
        });

      if (insertError) throw insertError;

      toast.success(`Recording saved! Fault: ${prediction}, Remedies: ${remedies}`);
      setRecordedAudio(null);
      setRecordingTime(0);
      setSelectedEquipment("");
    } catch (error: any) {
      toast.error(error.message || "Failed to save recording");
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24 flex items-center justify-center">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <Card className="p-8 card-industrial">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-heading font-bold mb-2">Audio Recording</h1>
            <p className="text-muted-foreground">Record equipment sounds for analysis</p>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Equipment</label>
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose equipment to monitor" />
                </SelectTrigger>
                <SelectContent>
                  {loadingEquipment ? (
                    <SelectItem value="loading" disabled>Loading equipment...</SelectItem>
                  ) : equipmentList.length === 0 ? (
                    <SelectItem value="no-equipment" disabled>No equipment available</SelectItem>
                  ) : (
                    equipmentList.map((equipment) => (
                      <SelectItem key={equipment.id} value={equipment.id}>
                        {equipment.name} ({equipment.category} - {equipment.plant_location})
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
                min="10"
                max="300"
                value={maxDuration}
                onChange={(e) => setMaxDuration(parseInt(e.target.value))}
                disabled={isRecording}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Max: {formatTime(maxDuration)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center mb-8">
            <button
              onClick={handleRecordToggle}
              disabled={!selectedEquipment}
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
              <div className="text-3xl font-mono font-bold mb-2">{formatTime(recordingTime)}</div>
              {isRecording && (
                <div className="w-full max-w-xs mx-auto">
                  <Progress value={(recordingTime / maxDuration) * 100} className="mb-2" />
                  <p className="text-sm text-muted-foreground">Recording quality: Good</p>
                </div>
              )}
            </div>
          </div>

          {(isRecording || recordedAudio) && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
              >
                <X className="mr-2 h-5 w-5" />
                Cancel
              </Button>
              {recordedAudio && (
                <Button
                  className="flex-1 bg-gradient-primary"
                  onClick={handleSave}
                >
                  <Save className="mr-2 h-5 w-5" />
                  Save
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