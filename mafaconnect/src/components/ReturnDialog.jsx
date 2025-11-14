import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useReturns } from "@/hooks/useReturns";
import { useSales } from "@/hooks/useSales";
import { Plus, X } from "lucide-react";

export function ReturnDialog({ open, onOpenChange }) {
  const { createReturn } = useReturns();
  const { sales } = useSales();

  const [saleId, setSaleId] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [refundMethod, setRefundMethod] = React.useState("cash");
  const [notes, setNotes] = React.useState("");

  const [items, setItems] = React.useState([]);

  const selectedSale = sales?.find((s) => s.id === saleId);

  const handleSubmit = () => {
    if (!saleId || items.length === 0 || !reason) return;

    createReturn({
      saleId,
      customerId: selectedSale?.customer_id || undefined,
      reason,
      items,
      refundMethod,
      notes,
    });

    onOpenChange(false);

    // reset
    setSaleId("");
    setReason("");
    setRefundMethod("cash");
    setNotes("");
    setItems([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process Return</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* SALE SELECT */}
          <div>
            <Label>Select Sale *</Label>
            <Select value={saleId} onValueChange={setSaleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select sale to return" />
              </SelectTrigger>
              <SelectContent>
                {sales?.slice(0, 50).map((sale) => (
                  <SelectItem key={sale.id} value={sale.id}>
                    {sale.id.slice(0, 8)} - ₦{Number(sale.total_amount).toLocaleString()} (
                    {sale.customers?.name || "Walk-in"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* REASON & METHOD */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Reason *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defective">Defective Product</SelectItem>
                  <SelectItem value="wrong_item">Wrong Item</SelectItem>
                  <SelectItem value="not_satisfied">Not Satisfied</SelectItem>
                  <SelectItem value="damaged">Damaged in Transit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Refund Method *</Label>
              <Select value={refundMethod} onValueChange={setRefundMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="store_credit">Store Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* SALE SUMMARY */}
          {saleId && selectedSale && (
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">Sale Items</h3>
              <p className="text-sm text-muted-foreground">
                Total: ₦{Number(selectedSale.total_amount).toLocaleString()}
              </p>

              <p className="text-sm text-muted-foreground">
                ⚠️ Note: Implement sale-item selection UI if required.
              </p>
            </div>
          )}

          {/* NOTES */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about the return..."
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={!saleId || !reason}>
              Process Return
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
