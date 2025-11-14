import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

export function ProductDialog({ open, onOpenChange }) {
  const { createProduct } = useProducts();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    cost_price: "",
    sale_price: "",
    stock_qty: "",
    reorder_level: "50",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createProduct.mutateAsync({
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      description: formData.description || null,
      cost_price: parseFloat(formData.cost_price),
      sale_price: parseFloat(formData.sale_price),
      stock_qty: parseInt(formData.stock_qty),
      reorder_level: parseInt(formData.reorder_level),
      active: true,
    });

    setFormData({
      name: "",
      sku: "",
      description: "",
      cost_price: "",
      sale_price: "",
      stock_qty: "",
      reorder_level: "50",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => handleChange("sku", e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price (₦) *</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => handleChange("cost_price", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale Price (₦) *</Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={(e) => handleChange("sale_price", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Stock and Reorder Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_qty">Stock Quantity *</Label>
              <Input
                id="stock_qty"
                type="number"
                value={formData.stock_qty}
                onChange={(e) => handleChange("stock_qty", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level</Label>
              <Input
                id="reorder_level"
                type="number"
                value={formData.reorder_level}
                onChange={(e) => handleChange("reorder_level", e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProduct.isPending}>
              {createProduct.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
