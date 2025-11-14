import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions } from "@/hooks/useTransactions";
import { useProducts } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";
import { useLocations } from "@/hooks/useLocations";
import {
  TRANSACTION_TYPES,
  calculateDueDate,
  getPaymentTermsOptions,
  formatCurrency,
} from "@/lib/transactionUtils";

// ✅ Zod validation schema
const transactionSchema = z.object({
  transactionType: z.string(),
  customerId: z.string().optional(),
  locationId: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentTerms: z.string().optional(),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export function TransactionDialog({ open, onOpenChange }) {
  const [selectedType, setSelectedType] = useState("cash_sale");
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const { user, isStaff, loading: authLoading } = useAuth();
  const { createTransaction, isCreating } = useTransactions();
  const { products, isLoading: productsLoading } = useProducts();
  const { customers, isLoading: customersLoading } = useCustomers();
  const { locations, isLoading: locationsLoading } = useLocations();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transactionType: "cash_sale",
      discount: 0,
    },
  });

  const discount = watch("discount") || 0;
  const paymentTerms = watch("paymentTerms");
  const typeConfig = TRANSACTION_TYPES[selectedType];

  // Update due date when payment terms change
  useEffect(() => {
    if (paymentTerms) calculateDueDate(paymentTerms);
  }, [paymentTerms]);

  // Reset when dialog reopens
  useEffect(() => {
    if (open) {
      setSelectedCustomer("");
      setSelectedLocation("");
      setItems([]);
      setSelectedProduct("");
      setQuantity(1);
      reset({
        transactionType: "cash_sale",
        discount: 0,
        notes: "",
      });
    }
  }, [open, reset]);

  const handleAddProduct = () => {
    if (!selectedProduct) return;

    const product = products?.find((p) => p.id === selectedProduct);
    if (!product) return;

    const existingItem = items.find((i) => i.productId === selectedProduct);
    if (existingItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.productId === selectedProduct
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      );
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.sale_price,
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const tax = subtotal * 0.075;
  const total = subtotal + tax - discount;

  const onSubmit = (data) => {
    if (items.length === 0) {
      alert("Please add at least one item.");
      return;
    }

    if (typeConfig.requiresLocation && !selectedLocation) {
      alert(`Please select a location for ${typeConfig.label}.`);
      return;
    }

    if (typeConfig.requiresCustomer && !selectedCustomer) {
      alert(`Please select a customer for ${typeConfig.label}.`);
      return;
    }

    const dueDate = data.paymentTerms ? calculateDueDate(data.paymentTerms) : null;

    createTransaction({
      transactionType: selectedType,
      customerId: selectedCustomer,
      locationId: selectedLocation,
      items: items.map((item) => ({
        productId: item.productId,
        description: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      paymentMethod: data.paymentMethod,
      discount: data.discount,
      notes: data.notes,
      dueDate: dueDate ? dueDate.toISOString().split("T")[0] : null,
    });

    onOpenChange(false);
  };

  // Loading / Access Denied states
  if (authLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            Loading...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user || !isStaff) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-muted-foreground">
            You do not have permission to create transactions. Staff access is required.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.error("Form errors:", errors);
            alert("Form validation failed. Check console for details.");
          })}
          className="space-y-6"
        >
          {/* Errors Display */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
              <p className="text-sm font-medium text-destructive">
                Please fix the following errors:
              </p>
              <ul className="mt-2 text-sm text-destructive list-disc list-inside">
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key}>
                    {key}: {error?.message || "Invalid value"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Transaction Type */}
          <div>
            <Label>Transaction Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => {
                setSelectedType(value);
                setValue("transactionType", value);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TRANSACTION_TYPES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{config.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {config.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer */}
          {typeConfig.requiresCustomer && (
            <div>
              <Label>Customer *</Label>
              {customersLoading ? (
                <div className="text-sm text-muted-foreground py-2">
                  Loading customers...
                </div>
              ) : !customers?.length ? (
                <div className="text-sm text-destructive py-2">
                  No customers found.
                </div>
              ) : (
                <Select
                  value={selectedCustomer}
                  onValueChange={(value) => {
                    setSelectedCustomer(value);
                    setValue("customerId", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Location */}
          {typeConfig.requiresLocation && (
            <div>
              <Label>Location *</Label>
              {locationsLoading ? (
                <div className="text-sm text-muted-foreground py-2">
                  Loading locations...
                </div>
              ) : !locations?.length ? (
                <div className="text-sm text-destructive py-2">
                  No locations found.
                </div>
              ) : (
                <Select
                  value={selectedLocation}
                  onValueChange={(value) => {
                    setSelectedLocation(value);
                    setValue("locationId", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name} - {loc.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Products */}
          <div className="space-y-4">
            <Label>Products</Label>
            <div className="flex gap-2">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} - {formatCurrency(p.sale_price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Qty"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                min={1}
                className="w-24"
              />
              <Button type="button" onClick={handleAddProduct}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {items.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Terms */}
          {typeConfig.requiresDueDate && (
            <div>
              <Label>Payment Terms</Label>
              <Select {...register("paymentTerms")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
                  {getPaymentTermsOptions().map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Payment Method */}
          {selectedType === "cash_sale" && (
            <div>
              <Label>Payment Method</Label>
              <Select {...register("paymentMethod")} defaultValue="cash">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Discount */}
          <div>
            <Label>Discount</Label>
            <Input
              type="number"
              {...register("discount", { valueAsNumber: true })}
              min={0}
              step={0.01}
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea {...register("notes")} placeholder="Additional notes..." />
          </div>

          {/* Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (7.5%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Discount:</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || items.length === 0}>
              {isCreating ? "Creating..." : "Create Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
