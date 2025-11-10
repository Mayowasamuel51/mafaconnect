import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/uimain/dialog";
import { Button } from "@/components/uimain/button";
import { Input } from "@/components/uimain/Input";
import { Label } from "@/components/uimain/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/uimain/select";
import { Textarea } from "@/components/uimain/textarea";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useLocations } from "@/hooks/useLocations";
import { useProducts } from "@/hooks/useProducts";
import { Plus, X } from "lucide-react";



export function PurchaseOrderDialog({ open, onOpenChange }: PurchaseOrderDialogProps) {
  const { createPurchaseOrder } = usePurchaseOrders();
  const { suppliers } = useSuppliers();
  const { locations } = useLocations();
  const { products } = useProducts();

  const [supplierId, setSupplierId] = React.useState("");
  const [locationId, setLocationId] = React.useState("");
  const [expectedDelivery, setExpectedDelivery] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [tax, setTax] = React.useState(0);
  const [items, setItems] = React.useState<Array<{ productId; quantity; unitCost: number }>>([]);
  const [currentItem, setCurrentItem] = React.useState({
    productId: "",
    quantity: 1,
    unitCost: 0,
  });

  const handleProductChange = (productId) => {
    const product = products?.find((p) => p.id === productId);
    if (product && product.cost_price) {
      setCurrentItem({
        ...currentItem,
        productId,
        unitCost: Number(product.cost_price),
      });
    }
  };

  const handleAddItem = () => {
    if (currentItem.productId && currentItem.quantity > 0 && currentItem.unitCost > 0) {
      setItems([...items, currentItem]);
      setCurrentItem({ productId: "", quantity: 1, unitCost: 0 });
    }
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const total = subtotal + tax;

  const handleSubmit = () => {
    if (!supplierId || items.length === 0) return;

    createPurchaseOrder({
      supplierId,
      locationId: locationId || undefined,
      expectedDelivery: expectedDelivery || undefined,
      items,
      notes,
      tax,
    });

    onOpenChange(false);
    // Reset form
    setSupplierId("");
    setLocationId("");
    setExpectedDelivery("");
    setNotes("");
    setTax(0);
    setItems([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Supplier *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.filter((s) => s.active).map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Delivery Location</Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations?.filter((l) => l.active).map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Expected Delivery</Label>
              <Input
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Add Items</h3>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <Select value={currentItem.productId} onValueChange={handleProductChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.filter((p) => p.active).map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={currentItem.quantity}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })
                  }
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  placeholder="Unit Cost"
                  value={currentItem.unitCost}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, unitCost: Number(e.target.value) })
                  }
                />
              </div>
              <div className="col-span-1">
                <Button onClick={handleAddItem} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {items.length > 0 && (
              <div className="space-y-2">
                {items.map((item, index) => {
                  const product = products?.find((p) => p.id === item.productId);
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-accent rounded">
                      <span>
                        {product?.name} x {item.quantity} @ ₦{item.unitCost.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          ₦{(item.quantity * item.unitCost).toLocaleString()}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tax (₦)</Label>
              <Input
                type="number"
                value={tax}
                onChange={(e) => setTax(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={!supplierId || items.length === 0}>
              Create Purchase Order
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
