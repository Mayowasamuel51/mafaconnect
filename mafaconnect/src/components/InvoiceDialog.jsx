import React, { useState, useEffect } from "react";
import axios from "axios";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

import { useInvoices } from "@/hooks/useInvoices";
import { useCustomers } from "@/hooks/useCustomers";
import { useProducts } from "@/hooks/useProducts";

const API_URL = import.meta.env.VITE_HOME_OO;

export function InvoiceDialog({ open, onOpenChange, invoiceId, mode = "create" }) {
  const { createInvoice, updateInvoice } = useInvoices();
  const { customers } = useCustomers();
  const { products } = useProducts();

  const [customerId, setCustomerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
  });

  // ------------------------------------------
  // 🔥 LOAD INVOICE DATA VIA REST API
  // ------------------------------------------
  useEffect(() => {
    if (mode === "edit" && invoiceId && open) {
      const loadInvoice = async () => {
        try {
          const res = await axios.get(`${API_URL}/invoices/${invoiceId}`);
          const invoice = res.data;

          setCustomerId(invoice.customer_id || "");
          setDueDate(invoice.due_date || "");
          setNotes(invoice.notes || "");
          setDiscount(Number(invoice.discount_amount));
          setTax(Number(invoice.tax_amount));

          setItems(
            invoice.invoice_items?.map((item) => ({
              productId: item.product_id || "",
              description: item.description,
              quantity: item.quantity,
              unitPrice: Number(item.unit_price),
            })) || []
          );
        } catch (err) {
          console.error("Failed to load invoice", err);
        }
      };

      loadInvoice();
    }
  }, [mode, invoiceId, open]);

  // ------------------------------------------
  // 🔸 Add item
  // ------------------------------------------
  const handleAddItem = () => {
    if (currentItem.description && currentItem.quantity > 0 && currentItem.unitPrice > 0) {
      setItems([...items, currentItem]);
      setCurrentItem({
        productId: "",
        description: "",
        quantity: 1,
        unitPrice: 0
      });
    }
  };

  // ------------------------------------------
  // 🔸 Remove item
  // ------------------------------------------
  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // ------------------------------------------
  // 🔸 Auto-fill item when selecting product
  // ------------------------------------------
  const handleProductChange = (productId) => {
    const product = products?.find((p) => p.id === productId);
    if (product) {
      setCurrentItem({
        ...currentItem,
        productId,
        description: product.name,
        unitPrice: Number(product.sale_price),
      });
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total = subtotal + tax - discount;

  // ------------------------------------------
  // 🔥 Submit Invoice
  // ------------------------------------------
  const handleSubmit = () => {
    if (items.length === 0 || !dueDate) return;

    const invoiceData = {
      customerId: customerId || undefined,
      dueDate,
      items,
      notes,
      discount,
      tax,
    };

    if (mode === "edit" && invoiceId) {
      updateInvoice({ id: invoiceId, invoiceData });
    } else {
      createInvoice(invoiceData);
    }

    // Reset
    onOpenChange(false);
    setCustomerId("");
    setDueDate("");
    setNotes("");
    setDiscount(0);
    setTax(0);
    setItems([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Invoice" : "Create Invoice"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-4">

            {/* Customer + Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer (Optional)</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Add Items</h3>

              {/* Item Row */}
              <div className="grid grid-cols-12 gap-2">
                {/* Product */}
                <div className="col-span-4">
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

                {/* Description */}
                <div className="col-span-3">
                  <Input
                    placeholder="Description"
                    value={currentItem.description}
                    onChange={(e) =>
                      setCurrentItem({ ...currentItem, description: e.target.value })
                    }
                  />
                </div>

                {/* Quantity */}
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={currentItem.quantity}
                    onChange={(e) =>
                      setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })
                    }
                  />
                </div>

                {/* Price */}
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Price"
                    value={currentItem.unitPrice}
                    onChange={(e) =>
                      setCurrentItem({ ...currentItem, unitPrice: Number(e.target.value) })
                    }
                  />
                </div>

                {/* Add Button */}
                <div className="col-span-1">
                  <Button onClick={handleAddItem} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Added Items List */}
              {items.length > 0 && (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-accent rounded">
                      <span>
                        {item.description} x {item.quantity} @ ₦{item.unitPrice.toLocaleString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          ₦{(item.quantity * item.unitPrice).toLocaleString()}
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
                  ))}
                </div>
              )}
            </div>

            {/* Tax + Discount */}
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
                <Label>Discount (₦)</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={items.length === 0 || !dueDate}>
                {mode === "edit" ? "Update Invoice" : "Create Invoice"}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
