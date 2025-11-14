import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/checkbox";
import { useProducts } from "@/hooks/useProducts";
import { useProductLocations } from "@/hooks/useProductLocations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package } from "lucide-react";

export function BulkAddProductsDialog({
  open,
  onOpenChange,
  locationId,
  existingProductIds,
}) {
  const { products } = useProducts();
  const { updateProductLocationStock } = useProductLocations();

  const [selectedProducts, setSelectedProducts] = React.useState({});

  // Only show products NOT already assigned to this location
  const availableProducts =
    products?.filter((p) => !existingProductIds.includes(p.id)) || [];

  const handleToggleProduct = (productId) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: {
        selected: !prev[productId]?.selected,
        quantity: prev[productId]?.quantity || 0,
        reorderLevel: prev[productId]?.reorderLevel || 10,
      },
    }));
  };

  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: quantity,
      },
    }));
  };

  const handleReorderLevelChange = (productId, level) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        reorderLevel: level,
      },
    }));
  };

  const handleBulkAdd = () => {
    const selected = Object.entries(selectedProducts).filter(
      ([, data]) => data.selected
    );

    selected.forEach(([productId, data]) => {
      updateProductLocationStock({
        productId,
        locationId,
        stockQty: data.quantity,
        reorderLevel: data.reorderLevel,
      });
    });

    setSelectedProducts({});
    onOpenChange(false);
  };

  const selectedCount = Object.values(selectedProducts).filter(
    (p) => p.selected
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Products to Location</DialogTitle>
        </DialogHeader>

        {availableProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>All products are already assigned to this location.</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {availableProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <Checkbox
                      checked={selectedProducts[product.id]?.selected || false}
                      onCheckedChange={() => handleToggleProduct(product.id)}
                    />

                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {product.sku}
                        </p>
                      </div>

                      {selectedProducts[product.id]?.selected && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label
                              htmlFor={`qty-${product.id}`}
                              className="text-xs"
                            >
                              Initial Stock
                            </Label>
                            <Input
                              id={`qty-${product.id}`}
                              type="number"
                              min="0"
                              value={selectedProducts[product.id]?.quantity || 0}
                              onChange={(e) =>
                                handleQuantityChange(
                                  product.id,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="h-8"
                            />
                          </div>

                          <div>
                            <Label
                              htmlFor={`reorder-${product.id}`}
                              className="text-xs"
                            >
                              Reorder Level
                            </Label>
                            <Input
                              id={`reorder-${product.id}`}
                              type="number"
                              min="0"
                              value={
                                selectedProducts[product.id]?.reorderLevel || 10
                              }
                              onChange={(e) =>
                                handleReorderLevelChange(
                                  product.id,
                                  parseInt(e.target.value) || 10
                                )
                              }
                              className="h-8"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {selectedCount} product
                {selectedCount !== 1 ? "s" : ""} selected
              </p>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>

                <Button
                  onClick={handleBulkAdd}
                  disabled={selectedCount === 0}
                >
                  Add Products
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
