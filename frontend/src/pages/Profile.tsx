import { Camera, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

// Validation schema for profile fields
const profileSchema = z.object({
  fullName: z.string().trim().min(1, { message: "Full name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  department: z.string().trim().max(100, { message: "Department must be less than 100 characters" }).optional(),
  phone: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }).max(20, { message: "Phone must be less than 20 characters" }).optional().or(z.literal("")),
});

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) {
        toast.error("Failed to load profile");
        return;
      }
      
      if (data) {
        setFullName(data.full_name || "");
        setDepartment(data.department || "");
        setPhone(data.phone || "");
        setEmployeeId(data.employee_id || "");
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    // Validate inputs
    const validation = profileSchema.safeParse({ 
      fullName, 
      department, 
      phone 
    });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          department: department || null,
          phone: phone || null,
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-heading font-bold">Edit Profile</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        <Card className="p-6 card-industrial mb-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold">
                RK
              </div>
              <button className="absolute bottom-0 right-0 bg-primary rounded-full p-2 border-2 border-card">
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Tap to change photo</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="empId">Employee ID</Label>
              <Input 
                id="empId" 
                value={employeeId}
                disabled 
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input 
                id="department" 
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                maxLength={20}
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate(-1)} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1 bg-gradient-primary" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
