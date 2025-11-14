import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLocations } from "@/hooks/useLocations";
import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_HOME_OO || "http://localhost:8000";

export function LocationDialog({ open, onOpenChange, location }) {
  const { createLocation, updateLocation } = useLocations();

  const [formData, setFormData] = React.useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    state: "",
    zone: "",
    location_type: "warehouse",
    capacity_sqft: "",
    active: true,
    manager_id: "",
  });

  // ✅ Fetch managers from REST API instead of Supabase
  const { data: managers } = useQuery({
    queryKey: ["managers"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/users/managers`);
      if (!res.ok) throw new Error("Failed to fetch managers");
      return res.json();
    },
  });

  // Load existing location into form
  React.useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || "",
        address: location.address || "",
        phone: location.phone || "",
        email: location.email || "",
        state: location.state || "",
        zone: location.zone || "",
        location_type: location.location_type || "warehouse",
        capacity_sqft: location.capacity_sqft?.toString() || "",
        active: location.active ?? true,
        manager_id: location.manager_id || "",
      });
    } else {
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        state: "",
        zone: "",
        location_type: "warehouse",
        capacity_sqft: "",
        active: true,
        manager_id: "",
      });
    }
  }, [location, open]);

  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
    "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
    "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];

  const zones = [
    "North Central", "North East", "North West",
    "South East", "South South", "South West"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      capacity_sqft: formData.capacity_sqft ? Number(formData.capacity_sqft) : null,
      manager_id: formData.manager_id || null,
    };

    if (location) {
      updateLocation({ id: location.id, data: submitData });
    } else {
      createLocation(submitData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{location ? "Edit Location" : "New Location"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Location Name *</Label>
              <Input
                value={formData.name}
                required
                placeholder="Main Store, Warehouse A"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Location Type *</Label>
              <Select
                value={formData.location_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, location_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="depot">Depot</SelectItem>
                  <SelectItem value="retail_store">Retail Store</SelectItem>
                  <SelectItem value="distribution_center">Distribution Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* State + Zone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>State *</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => setFormData({ ...formData, state: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {nigerianStates.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Zone *</Label>
              <Select
                value={formData.zone}
                onValueChange={(value) => setFormData({ ...formData, zone: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (
                    <SelectItem key={z} value={z}>{z}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address */}
          <div>
            <Label>Address</Label>
            <Input
              value={formData.address}
              placeholder="123 Main Road, Lagos"
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                placeholder="+234..."
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                placeholder="location@example.com"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <Label>Capacity (sq ft)</Label>
            <Input
              type="number"
              value={formData.capacity_sqft}
              placeholder="e.g. 5000"
              onChange={(e) =>
                setFormData({ ...formData, capacity_sqft: e.target.value })
              }
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.active}
              onCheckedChange={(value) =>
                setFormData({ ...formData, active: value })
              }
            />
            <Label>Active</Label>
          </div>

          {/* Manager */}
          <div>
            <Label>Location Manager (optional)</Label>
            <Select
              value={formData.manager_id}
              onValueChange={(value) =>
                setFormData({ ...formData, manager_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {managers?.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.full_name} ({m.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {location ? "Update Location" : "Create Location"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
