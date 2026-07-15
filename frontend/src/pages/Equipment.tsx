import { Search, Plus, Filter, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Equipment as EquipmentType, equipmentApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const Equipment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPlant, setSelectedPlant] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [equipmentList, setEquipmentList] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [plantLocation, setPlantLocation] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [model, setModel] = useState("");

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const data = await equipmentApi.list();
      setEquipmentList(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load equipment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-success/10 text-success border-success/20";
      case "warning":
        return "bg-warning/10 text-warning border-warning/20";
      case "critical":
        return "bg-error/10 text-error border-error/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((equipment) => {
      const matchesSearch = equipment.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === "all" || equipment.status === selectedStatus;
      const matchesPlant =
        selectedPlant === "all" || equipment.plant_location === selectedPlant;
      const matchesCategory =
        activeCategory === "all" || equipment.category === activeCategory;
      return matchesSearch && matchesStatus && matchesPlant && matchesCategory;
    });
  }, [equipmentList, searchQuery, selectedStatus, selectedPlant, activeCategory]);

  const plants = useMemo(
    () => Array.from(new Set(equipmentList.map((e) => e.plant_location))).sort(),
    [equipmentList]
  );

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !plantLocation) {
      toast.error("Name, category, and plant location are required");
      return;
    }
    try {
      await equipmentApi.create({
        name,
        category,
        plant_location: plantLocation,
        serial_number: serialNumber,
        model,
        status: "healthy",
      });
      toast.success("Equipment added successfully");
      setIsAddDialogOpen(false);
      setName("");
      setCategory("");
      setPlantLocation("");
      setSerialNumber("");
      setModel("");
      await loadEquipment();
    } catch (error: any) {
      toast.error(error.message || "Failed to add equipment");
    }
  };

  const renderList = (items: EquipmentType[]) => {
    if (loading) {
      return (
        <Card className="p-6 text-center text-muted-foreground">Loading equipment...</Card>
      );
    }
    if (items.length === 0) {
      return (
        <Card className="p-6 text-center text-muted-foreground">
          No equipment found. Add equipment to get started.
        </Card>
      );
    }
    return items.map((equipment) => (
      <Card
        key={equipment.id}
        className="p-4 card-industrial hover:shadow-industrial transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{equipment.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {equipment.category} • {equipment.plant_location}
            </p>
            <p className="text-xs text-muted-foreground">
              Last inspection:{" "}
              {equipment.last_inspection
                ? formatDistanceToNow(new Date(equipment.last_inspection), {
                    addSuffix: true,
                  })
                : "Never"}
            </p>
          </div>
          <Badge className={`${getStatusColor(equipment.status)} capitalize`}>
            {equipment.status}
          </Badge>
        </div>
      </Card>
    ));
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
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Motor Unit A3"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="motors">Motors</SelectItem>
                        <SelectItem value="pumps">Pumps</SelectItem>
                        <SelectItem value="valves">Valves</SelectItem>
                        <SelectItem value="turbines">Turbines</SelectItem>
                        <SelectItem value="heat_exchangers">Heat Exchangers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="plant">Plant Location</Label>
                    <Input
                      id="plant"
                      value={plantLocation}
                      onChange={(e) => setPlantLocation(e.target.value)}
                      placeholder="e.g., Unit A"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serial">Serial Number</Label>
                    <Input
                      id="serial"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="e.g., SN12345"
                    />
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
                      <SelectItem value="offline">Offline</SelectItem>
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
                      {plants.map((plant) => (
                        <SelectItem key={plant} value={plant}>
                          {plant}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full justify-start mb-6 overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="motors">Motors</TabsTrigger>
            <TabsTrigger value="pumps">Pumps</TabsTrigger>
            <TabsTrigger value="valves">Valves</TabsTrigger>
            <TabsTrigger value="turbines">Turbines</TabsTrigger>
            <TabsTrigger value="heat_exchangers">Heat Exchangers</TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory} className="space-y-4">
            {renderList(filteredEquipment)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Equipment;
