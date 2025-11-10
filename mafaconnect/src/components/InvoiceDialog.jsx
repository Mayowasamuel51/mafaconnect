import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/uimain/dialog";
import { ScrollArea } from "@/components/uimain/scroll-area";
import { Button } from "@/components/uimain/button";
import { Input } from "@/components/uimain/Input";
import { Label } from "@/components/uimain/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/uimain/select";
import { Textarea } from "@/components/uimain/textarea";
import { useInvoices } from "@/hooks/useInvoices";
import { useCustomers } from "@/hooks/useCustomers";
import { useProducts } from "@/hooks/useProducts";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";



export function InvoiceDialog({
  open,
  onOpenChange,
  invoiceId,
  mode = "create",
}: InvoiceDialogProps) {
  const { createInvoice, updateInvoice } = useInvoices();
  const { customers } = useCustomers();
  const { products } = useProducts();

  const [customerId, setCustomerId] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [discount, setDiscount] = React.useState(0);
  const [tax, setTax] = React.useState(0);
  const [items, setItems] = React.useState<
    Array<{ productId; description; quantity; unitPrice: number }>
  >([]);
  const [currentItem, setCurrentItem] = React.useState({
    productId: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
  });

  const handleAddItem = () => {
    if (currentItem.description && currentItem.quantity > 0 && currentItem.unitPrice > 0) {
      setItems([...items, currentItem]);
      setCurrentItem({ productId: "", description: "", quantity: 1, unitPrice: 0 });
    }
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

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

  // Load invoice data when editing
  React.useEffect(() => {
    if (mode === "edit" && invoiceId && open) {
      const loadInvoice = async () => {
        const { data: invoice } = await supabase
          .from("invoices")
          .select(
            `
            *,
            invoice_items(*)
          `
          )
          .eq("id", invoiceId)
          .single();

        if (invoice) {
          setCustomerId(invoice.customer_id || "");
          setDueDate(invoice.due_date);
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
        }
      };
      loadInvoice();
    }
  }, [mode, invoiceId, open]);

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

    onOpenChange(false);
    // Reset form
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

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Add Items</h3>
            <div className="grid grid-cols-12 gap-2">
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
              <div className="col-span-3">
                <Input
                  placeholder="Description"
                  value={currentItem.description}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, description: e.target.value })
                  }
                />
              </div>
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
              <div className="col-span-1">
                <Button onClick={handleAddItem} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

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

          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
          </div>

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
