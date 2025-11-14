import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";

export function LoyaltyTransactionDialog({ open, onOpenChange }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [customerId, setCustomerId] = React.useState("");
  const [points, setPoints] = React.useState("");
  const [type, setType] = React.useState("earn");
  const [note, setNote] = React.useState("");
  const { customers } = useCustomers();
  const queryClient = useQueryClient();

  // ---- Generic API helper ----
  const api = async (url, method = "GET", body) => {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const customer = customers?.find(c => c.id === customerId);
      const loyaltyAccount = customer?.loyalty_accounts?.[0];

      if (!loyaltyAccount) {
        throw new Error("Customer doesn't have a loyalty account");
      }

      const pointsValue = parseInt(points);
      const actualPoints = type === "redeem" ? -pointsValue : pointsValue;

      // ------------------------------
      // 1️⃣ CREATE loyalty transaction
      // ------------------------------
      await api("/api/loyalty/transactions", "POST", {
        loyaltyAccountId: loyaltyAccount.id,
        points: actualPoints,
        type: type === "earn" ? "manual_credit" : "manual_debit",
        note,
      });

      // ------------------------------
      // 2️⃣ UPDATE loyalty balance
      // ------------------------------
      await api(`/api/loyalty/accounts/${loyaltyAccount.id}`, "PUT", {
        points_balance: loyaltyAccount.points_balance + actualPoints,
      });

      toast.success(
        type === "earn" ? "Points awarded successfully!" : "Points redeemed successfully!"
      );

      // Refresh React Query caches
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-stats"] });

      // Reset fields
      setCustomerId("");
      setPoints("");
      setType("earn");
      setNote("");

      onOpenChange(false);
    } catch (error) {
      toast.error(error.message || "Failed to process transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Loyalty Points Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Customer */}
          <div className="space-y-2">
            <Label>Select Customer *</Label>
            <Select value={customerId} onValueChange={setCustomerId} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a customer" />
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

          {/* Type + Points */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Transaction Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earn">Award Points</SelectItem>
                  <SelectItem value="redeem">Redeem Points</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Points *</Label>
              <Input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="100"
                min={1}
                required
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label>Note (Optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for transaction..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !customerId}
              className="bg-gradient-primary"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {type === "earn" ? "Award Points" : "Redeem Points"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
