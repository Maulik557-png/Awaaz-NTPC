import { Search, Plus, Filter, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const equipmentData = [
  { id: 1, name: "Motor Unit A1", category: "Motors", status: "healthy", plant: "Plant 1", lastInspection: "2 hours ago" },
  { id: 2, name: "Pump B3", category: "Pumps", status: "warning", plant: "Plant 1", lastInspection: "5 hours ago" },
  { id: 3, name: "Valve C7", category: "Valves", status: "healthy", plant: "Plant 2", lastInspection: "1 day ago" },
  { id: 4, name: "Turbine T2", category: "Turbines", status: "critical", plant: "Plant 1", lastInspection: "30 mins ago" },
  { id: 5, name: "Heat Exchanger HX5", category: "Heat Exchangers", status: "healthy", plant: "Plant 3", lastInspection: "3 hours ago" },
  { id: 6, name: "Motor Unit A2", category: "Motors", status: "warning", plant: "Plant 1", lastInspection: "4 hours ago" },
];

const Equipment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPlant, setSelectedPlant] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-success/10 text-success border-success/20";
      case "warning": return "bg-warning/10 text-warning border-warning/20";
      case "critical": return "bg-error/10 text-error border-error/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredEquipment = equipmentData.filter((equipment) => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || equipment.status === selectedStatus;
    const matchesPlant = selectedPlant === "all" || equipment.plant === selectedPlant;
    return matchesSearch && matchesStatus && matchesPlant;
  });

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Equipment added successfully!");
    setIsAddDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-heading font-bold mb-4">Equipment Management</h1>
          
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search equipment..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5" />
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">
                  <Plus className="h-5 w-5 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Equipment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddEquipment} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Equipment Name</Label>
                    <Input id="name" placeholder="e.g., Motor Unit A3" required />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="motors">Motors</SelectItem>
                        <SelectItem value="pumps">Pumps</SelectItem>
                        <SelectItem value="valves">Valves</SelectItem>
                        <SelectItem value="turbines">Turbines</SelectItem>
                        <SelectItem value="heat-exchangers">Heat Exchangers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="plant">Plant Location</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plant1">Plant 1 - Korba</SelectItem>
                        <SelectItem value="plant2">Plant 2 - Ramagundam</SelectItem>
                        <SelectItem value="plant3">Plant 3 - Dadri</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="serial">Serial Number</Label>
                    <Input id="serial" placeholder="e.g., SN12345" />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-primary">
                    Add Equipment
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {showFilters && (
            <Card className="p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedStatus("all");
                    setSelectedPlant("all");
                    setShowFilters(false);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="healthy">Healthy</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Plant</Label>
                  <Select value={selectedPlant} onValueChange={setSelectedPlant}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Plants</SelectItem>
                      <SelectItem value="Plant 1">Plant 1</SelectItem>
                      <SelectItem value="Plant 2">Plant 2</SelectItem>
                      <SelectItem value="Plant 3">Plant 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="all">
          <TabsList className="w-full justify-start mb-6 overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="motors">Motors</TabsTrigger>
            <TabsTrigger value="pumps">Pumps</TabsTrigger>
            <TabsTrigger value="valves">Valves</TabsTrigger>
            <TabsTrigger value="turbines">Turbines</TabsTrigger>
            <TabsTrigger value="heat-exchangers">Heat Exchangers</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredEquipment.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                No equipment found matching your filters
              </Card>
            ) : (
              filteredEquipment.map((equipment) => (
                <Card key={equipment.id} className="p-4 card-industrial hover:shadow-industrial transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{equipment.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{equipment.category} • {equipment.plant}</p>
                      <p className="text-xs text-muted-foreground">Last inspection: {equipment.lastInspection}</p>
                    </div>
                    <Badge className={`${getStatusColor(equipment.status)} capitalize`}>
                      {equipment.status}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {["motors", "pumps", "valves", "turbines", "heat-exchangers"].map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {filteredEquipment.filter(e => e.category.toLowerCase() === category.replace('-', ' ')).map((equipment) => (
                <Card key={equipment.id} className="p-4 card-industrial mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{equipment.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{equipment.category} • {equipment.plant}</p>
                      <p className="text-xs text-muted-foreground">Last inspection: {equipment.lastInspection}</p>
                    </div>
                    <Badge className={`${getStatusColor(equipment.status)} capitalize`}>
                      {equipment.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Equipment;