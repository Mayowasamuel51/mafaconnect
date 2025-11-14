import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useLocations } from "@/hooks/useLocations";
import { useLocationStats } from "@/hooks/useLocationStats"; // ⭐ NEW HOOK
import { MapPin, Plus, Search, Package, TrendingUp, Warehouse, Edit } from "lucide-react";
import { LocationDialog } from "@/components/LocationDialog";
import { useAuth } from "@/hooks/useAuth";

export default function Locations() {
  const navigate = useNavigate();
  const { locations, isLoading } = useLocations();
  const { hasRole } = useAuth();
  const { locationStats } = useLocationStats(); // ⭐ replaces Supabase RPC

  const [searchQuery, setSearchQuery] = React.useState("");
  const [showDialog, setShowDialog] = React.useState(false);
  const [editLocation, setEditLocation] = React.useState(null);
  const [groupBy, setGroupBy] = React.useState("all");

  const getLocationStats = (locationId) => {
    return locationStats?.find((stat) => stat.location_id === locationId);
  };

  const getLocationTypeBadge = (type) => {
    const colors = {
      warehouse: "bg-blue-500/10 text-blue-500",
      depot: "bg-green-500/10 text-green-500",
      retail_store: "bg-purple-500/10 text-purple-500",
      distribution_center: "bg-orange-500/10 text-orange-500",
    };
    return colors[type] || colors.warehouse;
  };

  const filteredLocations = locations?.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.state?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedLocations = React.useMemo(() => {
    if (!filteredLocations) return {};

    if (groupBy === "state") {
      return filteredLocations.reduce((acc, loc) => {
        const key = loc.state || "Unknown";
        if (!acc[key]) acc[key] = [];
        acc[key].push(loc);
        return acc;
      }, {});
    }

    if (groupBy === "zone") {
      return filteredLocations.reduce((acc, loc) => {
        const key = loc.zone || "Unknown";
        if (!acc[key]) acc[key] = [];
        acc[key].push(loc);
        return acc;
      }, {});
    }

    return { "All Locations": filteredLocations };
  }, [filteredLocations, groupBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Locations</h1>
          <p className="text-muted-foreground">Manage your business locations across Nigeria</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Location
        </Button>
      </div>

      {/* Search + Grouping */}
      <Card>
        <CardHeader>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={groupBy === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupBy("all")}
              >
                All
              </Button>
              <Button
                variant={groupBy === "state" ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupBy("state")}
              >
                By State
              </Button>
              <Button
                variant={groupBy === "zone" ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupBy("zone")}
              >
                By Zone
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading locations...</div>
          ) : filteredLocations?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No locations found" : "No locations yet"}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedLocations).map(([groupName, locs]) => (
                <div key={groupName}>
                  {groupBy !== "all" && (
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      {groupName}
                    </h3>
                  )}

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {locs.map((location) => {
                      const stats = getLocationStats(location.id);

                      return (
                        <Card
                          key={location.id}
                          className="hover:shadow-lg transition-shadow cursor-pointer group"
                        >
                          <CardContent className="p-6">
                            {/* Top section */}
                            <div className="flex items-start justify-between mb-4">
                              <div
                                className="flex items-center gap-2 flex-1"
                                onClick={() => navigate(`/locations/${location.id}`)}
                              >
                                <Warehouse className="h-8 w-8 text-primary" />
                                {location.is_primary && (
                                  <Badge variant="default" className="text-xs">Main</Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-1 items-end">
                                  <Badge variant={location.active ? "default" : "secondary"}>
                                    {location.active ? "Active" : "Inactive"}
                                  </Badge>

                                  {location.location_type && (
                                    <Badge className={getLocationTypeBadge(location.location_type)}>
                                      {location.location_type.replace("_", " ")}
                                    </Badge>
                                  )}
                                </div>

                                {(hasRole("admin") || hasRole("manager")) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditLocation(location);
                                      setShowDialog(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Name */}
                            <div onClick={() => navigate(`/locations/${location.id}`)}>
                              <h3 className="font-semibold text-lg mb-2">{location.name}</h3>

                              {(location.state || location.zone) && (
                                <div className="flex items-center gap-2 mb-3">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    {location.state}
                                    {location.state && location.zone && " • "}
                                    {location.zone}
                                  </p>
                                </div>
                              )}

                              {/* Stats */}
                              {stats && (
                                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Products</p>
                                    <p className="text-lg font-semibold flex items-center gap-1">
                                      <Package className="h-4 w-4" />
                                      {stats.total_products || 0}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-muted-foreground">Stock Value</p>
                                    <p className="text-lg font-semibold flex items-center gap-1">
                                      <TrendingUp className="h-4 w-4" />
                                      ₦{Number(stats.total_stock_value || 0).toLocaleString()}
                                    </p>
                                  </div>

                                  {stats.low_stock_items > 0 && (
                                    <div className="col-span-2">
                                      <Badge variant="destructive" className="w-full justify-center">
                                        {stats.low_stock_items} Low Stock Items
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              )}

                              {location.address && (
                                <p className="text-sm text-muted-foreground mt-3">
                                  {location.address}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <LocationDialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) setEditLocation(null);
        }}
        location={editLocation}
      />
    </div>
  );
}
