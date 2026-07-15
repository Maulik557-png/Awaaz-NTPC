import { User, Bell, Database, Shield, Info, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-heading font-bold">Settings</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <Card className="p-4 card-industrial">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user?.full_name || "User"}</h3>
              <p className="text-sm text-muted-foreground">
                {user?.department || "Technician"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.employee_id || user?.email}
              </p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => navigate("/profile")}>
            Edit Profile
          </Button>
        </Card>

        {/* Notifications */}
        <Card className="p-4 card-industrial">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Critical Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified for critical issues</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Reminders</p>
                <p className="text-sm text-muted-foreground">Scheduled maintenance alerts</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* Data & Storage */}
        <Card className="p-4 card-industrial">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Data & Storage</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Offline Mode</p>
                <p className="text-sm text-muted-foreground">Work without internet</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto Sync</p>
                <p className="text-sm text-muted-foreground">Sync data automatically</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <Button variant="outline" className="w-full">
              Clear Cache
            </Button>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-4 card-industrial">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Security</h3>
          </div>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Biometric Authentication
            </Button>
          </div>
        </Card>

        {/* About */}
        <Card className="p-4 card-industrial">
          <div className="flex items-center gap-3 mb-4">
            <Info className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">About</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build</span>
              <span className="font-medium">2025.10.10</span>
            </div>
          </div>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full border-error text-error hover:bg-error/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Settings;
