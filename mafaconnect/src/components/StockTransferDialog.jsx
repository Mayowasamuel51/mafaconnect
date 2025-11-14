import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { useStockTransfers } from "@/hooks/useStockTransfers";
import { useProducts } from "@/hooks/useProducts";
import { useLocations } from "@/hooks/useLocations";
import { LocationSelector } from "./LocationSelector";
import { ArrowRight, Package } from "lucide-react";

export function StockTransferDialog({ open, onOpenChange }) {
  const { createTransfer } = useStockTransfers();
  const { products } = useProducts();
  const { locations } = useLocations();

  const [productId, setProductId] = React.useState("");
  const [fromLocationId, setFromLocationId] = React.useState("");
  const [toLocationId, setToLocationId] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [expectedDelivery, setExpectedDelivery] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const handleSubmit = () => {
    if (!productId || !fromLocationId || !toLocationId || !quantity) return;

    createTransfer({
      productId,
      fromLocationId,
      toLocationId,
      quantity: parseInt(quantity),
      expectedDelivery: expectedDelivery || undefined,
      notes: notes || undefined,
    });

    // Reset form
    setProductId("");
    setFromLocationId("");
    setToLocationId("");
    setQuantity("");
    setExpectedDelivery("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create Stock Transfer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product selection */}
          <div>
            <Label>Product *</Label>
            <select
              className="w-full mt-1 p-2 border rounded-md"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select a product...</option>
              {products?.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Location selection */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <Label>From Location *</Label>
              <LocationSelector
                value={fromLocationId}
                onValueChange={setFromLocationId}
                placeholder="Source location"
                className="mt-1"
              />
            </div>

            <div className="flex justify-center pt-6">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            <div>
              <Label>To Location *</Label>
              <LocationSelector
                value={toLocationId}
                onValueChange={setToLocationId}
                placeholder="Destination location"
                className="mt-1"
              />
            </div>
          </div>

          {/* Quantity */}
          <div>
            <Label>Quantity *</Label>
            <Input
              type="number"
              placeholder="Enter quantity to transfer"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
            />
          </div>

          {/* Expected Delivery Date */}
          <div>
            <Label>Expected Delivery Date</Label>
            <Input
              type="date"
              value={expectedDelivery}
              onChange={(e) => setExpectedDelivery(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              placeholder="Add any notes about this transfer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!productId || !fromLocationId || !toLocationId || !quantity}
              className="flex-1"
            >
              Create Transfer
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
