import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useLocations } from "@/hooks/useLocations";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  MapPin,
  Warehouse,
  Package,
  TrendingUp,
  ArrowRightLeft,
  ShoppingCart,
  User,
} from "lucide-react";
import { LocationDialog } from "@/components/LocationDialog";
import { BulkAddProductsDialog } from "@/components/BulkAddProductsDialog";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = import.meta.env.VITE_HOME_OO || "http://localhost:8000";

export default function LocationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { locations } = useLocations();
  const { hasRole } = useAuth();

  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showAddProductsDialog, setShowAddProductsDialog] = React.useState(false);

  const location = locations?.find((loc) => String(loc.id) === String(id));

  // 📊 Location stats
  const { data: locationStats } = useQuery({
    queryKey: ["location-detail-stats", id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/locations/${id}/stats`);
      if (!res.ok) throw new Error("Failed to fetch location stats");
      return res.json();
    },
    enabled: !!id,
  });

  // 🧾 Recent sales (last 30 days)
  const { data: recentSales } = useQuery({
    queryKey: ["location-recent-sales", id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/locations/${id}/sales?days=30`);
      if (!res.ok) throw new Error("Failed to fetch recent sales");
      return res.json();
    },
    enabled: !!id,
  });

  // 🔁 Active transfers
  const { data: activeTransfers } = useQuery({
    queryKey: ["location-active-transfers", id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/locations/${id}/transfers`);
      if (!res.ok) throw new Error("Failed to fetch active transfers");
      return res.json();
    },
    enabled: !!id,
  });

  // 📦 Product stock at this location
  const { data: productStock } = useQuery({
    queryKey: ["location-product-stock", id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/locations/${id}/stock`);
      if (!res.ok) throw new Error("Failed to fetch product stock");
      return res.json();
    },
    enabled: !!id,
  });

  // 👤 Location manager
  const { data: manager } = useQuery({
    queryKey: ["location-manager", location?.manager_id],
    queryFn: async () => {
      if (!location?.manager_id) return null;
      const res = await fetch(`${API_BASE}/users/${location.manager_id}`);
      if (!res.ok) throw new Error("Failed to fetch manager");
      return res.json();
    },
    enabled: !!location?.manager_id,
  });

  if (!location) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/locations")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Locations
        </Button>
        <div className="text-center py-8">Location not found</div>
      </div>
    );
  }

  const getLocationTypeBadge = (type) => {
    const colors = {
      warehouse: "bg-blue-500/10 text-blue-500",
      depot: "bg-green-500/10 text-green-500",
      retail_store: "bg-purple-500/10 text-purple-500",
      distribution_center: "bg-orange-500/10 text-orange-500",
    };
    return colors[type || "warehouse"] || colors.warehouse;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/locations")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{location.name}</h1>
              {location.is_primary && (
                <Badge variant="default">Main Location</Badge>
              )}
              <Badge variant={location.active ? "default" : "secondary"}>
                {location.active ? "Active" : "Inactive"}
              </Badge>
              {location.location_type && (
                <Badge className={getLocationTypeBadge(location.location_type)}>
                  {location.location_type.replace("_", " ")}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {location.state}
                {location.state && location.zone && " • "}
                {location.zone}
              </p>
            </div>
          </div>
        </div>

        {(hasRole("admin") || hasRole("manager")) && (
          <Button onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Location
          </Button>
        )}
      </div>

      {/* Top stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Package className="h-8 w-8 text-primary" />
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {locationStats?.total_products || 0}
                </p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ₦
                  {Number(locationStats?.total_stock_value || 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Stock Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <ShoppingCart className="h-8 w-8 text-blue-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{recentSales?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Sales (30d)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <ArrowRightLeft className="h-8 w-8 text-orange-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {activeTransfers?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Active Transfers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="sales">Recent Sales</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{location.address || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{location.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{location.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-medium">
                    {location.capacity_sqft
                      ? `${Number(location.capacity_sqft).toLocaleString()} sq ft`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {manager && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Location Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{manager.full_name}</p>
                  <p className="text-sm text-muted-foreground">{manager.email}</p>
                  {manager.phone && (
                    <p className="text-sm text-muted-foreground">{manager.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {locationStats && locationStats.low_stock_items > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Low Stock Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {locationStats.low_stock_items} products are below reorder level
                  at this location
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Stock Tab */}
        <TabsContent value="stock">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Product Stock</CardTitle>
              {(hasRole("admin") || hasRole("manager")) && (
                <Button onClick={() => setShowAddProductsDialog(true)}>
                  <Package className="mr-2 h-4 w-4" />
                  Add Products
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productStock?.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <div>
                      <p className="text-muted-foreground font-medium">
                        No products at this location
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add products to start tracking inventory here
                      </p>
                    </div>
                    {(hasRole("admin") || hasRole("manager")) && (
                      <Button
                        onClick={() => setShowAddProductsDialog(true)}
                        className="mt-4"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Add Products
                      </Button>
                    )}
                  </div>
                ) : (
                  productStock?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.product?.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {item.stock_qty} units
                        </p>
                        {item.stock_qty <= item.reorder_level && (
                          <Badge variant="destructive" className="text-xs">
                            Low Stock
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSales?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No recent sales
                  </p>
                ) : (
                  recentSales?.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sale.created_at).toLocaleDateString()}
                        </p>
                        <Badge variant="outline">{sale.status}</Badge>
                      </div>
                      <p className="font-semibold">
                        ₦{Number(sale.total_amount).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers">
          <Card>
            <CardHeader>
              <CardTitle>Active Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeTransfers?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No active transfers
                  </p>
                ) : (
                  activeTransfers?.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{transfer.product?.name}</p>
                        <Badge>{transfer.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>From: {transfer.from_location?.name || "N/A"}</p>
                        <p>To: {transfer.to_location?.name || "N/A"}</p>
                        <p>Quantity: {transfer.quantity} units</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Location Dialog */}
      <LocationDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        location={location}
      />

      {/* Bulk Add Products Dialog */}
      <BulkAddProductsDialog
        open={showAddProductsDialog}
        onOpenChange={setShowAddProductsDialog}
        locationId={id || ""}
        existingProductIds={productStock?.map((item) => item.product_id) || []}
      />
    </div>
  );
}
