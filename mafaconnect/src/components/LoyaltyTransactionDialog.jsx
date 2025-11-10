import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/uimain/dialog";
import { Button } from "@/components/uimain/button";
import { Input } from "@/components/uimain/Input";
import { Label } from "@/components/uimain/label";
import { Textarea } from "@/components/uimain/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/uimain/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";



export function LoyaltyTransactionDialog({ open, onOpenChange }: LoyaltyTransactionDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [customerId, setCustomerId] = React.useState("");
  const [points, setPoints] = React.useState("");
  const [type, setType] = React.useState("earn");
  const [note, setNote] = React.useState("");
  const { customers } = useCustomers();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
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

      // Create transaction
      const { error: txError } = await supabase.from("loyalty_transactions").insert({
        loyalty_account_id: loyaltyAccount.id,
        points: actualPoints,
        type = == "earn" ? "manual_credit" : "manual_debit",
        note,
      });

      if (txError) throw txError;

      // Update balance
      const newBalance = loyaltyAccount.points_balance + actualPoints;
      const { error: updateError } = await supabase
        .from("loyalty_accounts")
        .update({ points_balance: newBalance })
        .eq("id", loyaltyAccount.id);

      if (updateError) throw updateError;

      toast.success(`${type === "earn" ? "Points awarded" : "Points redeemed"} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-stats"] });
      
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
          <div className="space-y-2">
            <Label htmlFor="customer">Select Customer *</Label>
            <Select value={customerId} onValueChange={setCustomerId} required>
              <SelectTrigger id="customer">
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type *</Label>
              <Select value={type} onValueChange={(v) => setType(v as "earn" | "redeem")}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earn">Award Points</SelectItem>
                  <SelectItem value="redeem">Redeem Points</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Points *</Label>
              <Input
                id="points"
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="100"
                min="1"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for transaction..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !customerId} className="bg-gradient-primary">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {type === "earn" ? "Award Points" : "Redeem Points"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
