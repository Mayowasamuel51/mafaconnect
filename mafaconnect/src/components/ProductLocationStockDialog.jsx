import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/uimain/dialog";
import { Button } from "@/components/uimain/button";
import { Input } from "@/components/uimain/Input";
import { Label } from "@/components/uimain/label";
import { Textarea } from "@/components/uimain/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/uimain/select";
import { useProductLocations } from "@/hooks/useProductLocations";
import { useLocations } from "@/hooks/useLocations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/uimain/tabs";
import { Card } from "@/components/uimain/card";
import { Badge } from "@/components/uimain/Badge";
import { Package, TrendingDown, TrendingUp } from "lucide-react";



export function ProductLocationStockDialog({
  open,
  onOpenChange,
  product,
}: ProductLocationStockDialogProps) {
  const { productLocations, updateProductLocationStock, adjustLocationStock } = useProductLocations();
  const { locations } = useLocations();
  const [selectedLocationId, setSelectedLocationId] = React.useState("");
  const [adjustment, setAdjustment] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [newLocationId, setNewLocationId] = React.useState("");
  const [initialStock, setInitialStock] = React.useState(0);
  const [reorderLevel, setReorderLevel] = React.useState(10);

  const productLocationStock = productLocations?.filter(
    (pl) => pl.product_id === product?.id
  );

  // Get locations that don't have this product yet
  const availableLocations = locations?.filter(
    (loc) => !productLocationStock?.some((stock) => stock.location?.id === loc.id)
  ) || [];

  const handleAdjustment = (type: 'add' | 'remove') => {
    if (!selectedLocationId || !adjustment) return;

    const adjustmentValue = type === 'add' ? parseInt(adjustment) : -parseInt(adjustment);

    adjustLocationStock({
      productId: product.id,
      locationId: selectedLocationId,
      adjustment: adjustmentValue,
      reason: reason || `Stock ${type === 'add' ? 'added' : 'removed'}`,
    });

    setAdjustment("");
    setReason("");
    setSelectedLocationId("");
  };

  const handleAssignToLocation = () => {
    if (!newLocationId || initialStock < 0) return;

    updateProductLocationStock({
      productId: product.id,
      locationId: newLocationId,
      stockQty: initialStock,
      reorderLevel: reorderLevel,
    });

    setNewLocationId("");
    setInitialStock(0);
    setReorderLevel(10);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product?.name} - Location Stock
          </DialogTitle>
        </DialogHeader>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="view">View Stock</TabsTrigger>
          <TabsTrigger value="adjust">Adjust Stock</TabsTrigger>
          <TabsTrigger value="assign">Assign to Location</TabsTrigger>
        </TabsList>

          <TabsContent value="view" className="space-y-4">
            {productLocationStock && productLocationStock.length > 0 ? (
              <div className="grid gap-3">
                {productLocationStock.map((pl) => (
                  <Card key={pl.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{pl.location?.name}</h4>
                        {pl.location?.state && (
                          <p className="text-sm text-muted-foreground">{pl.location.state}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{pl.stock_qty}</span>
                          {pl.stock_qty <= pl.reorder_level && (
                            <Badge variant="destructive">Low Stock</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Reorder at: {pl.reorder_level}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No stock at any location yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="adjust" className="space-y-4">
            <div>
              <Label>Select Location</Label>
              <select
                className="w-full mt-1 p-2 border rounded-md"
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
              >
                <option value="">Choose a location...</option>
                {productLocationStock?.map((pl) => (
                  <option key={pl.location?.id} value={pl.location?.id}>
                    {pl.location?.name} - Current: {pl.stock_qty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                min="0"
              />
            </div>

            <div>
              <Label>Reason (Optional)</Label>
              <Textarea
                placeholder="Why are you adjusting stock?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleAdjustment('add')}
                disabled={!selectedLocationId || !adjustment}
                className="flex-1"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Add Stock
              </Button>
              <Button
                onClick={() => handleAdjustment('remove')}
                disabled={!selectedLocationId || !adjustment}
                variant="destructive"
                className="flex-1"
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Remove Stock
              </Button>
            </div>
        </TabsContent>

        <TabsContent value="assign" className="space-y-4">
          {availableLocations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>This product is already assigned to all locations.</p>
              <p className="text-sm mt-2">Create more locations to assign this product.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="new-location">Select Location</Label>
                <Select value={newLocationId} onValueChange={setNewLocationId}>
                  <SelectTrigger id="new-location">
                    <SelectValue placeholder="Choose a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLocations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} - {location.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initial-stock">Initial Stock Quantity</Label>
                <Input
                  id="initial-stock"
                  type="number"
                  min="0"
                  value={initialStock}
                  onChange={(e) => setInitialStock(parseInt(e.target.value) || 0)}
                  placeholder="Enter initial stock quantity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorder-level">Reorder Level</Label>
                <Input
                  id="reorder-level"
                  type="number"
                  min="0"
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(parseInt(e.target.value) || 10)}
                  placeholder="Enter reorder level"
                />
                <p className="text-xs text-muted-foreground">
                  You'll be alerted when stock falls below this level
                </p>
              </div>

              <Button
                onClick={handleAssignToLocation}
                disabled={!newLocationId}
                className="w-full"
              >
                Assign Product to Location
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
  );
}
