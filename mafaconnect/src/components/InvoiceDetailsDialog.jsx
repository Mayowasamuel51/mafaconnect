import React from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, Edit, Mail } from "lucide-react";

const API_URL = import.meta.env.VITE_HOME_OO;

export function InvoiceDetailsDialog({
  invoiceId,
  open,
  onOpenChange,
  onEdit,
}) {
  // 🔥 Fetch invoice by ID (NO SUPABASE)
  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      const res = await axios.get(`${API_URL}/invoices/${invoiceId}`);
      return res.data;
    },
    enabled: !!invoiceId && open,
  });

  // Status colors for badge
  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-success text-success-foreground";
      case "sent":
        return "bg-primary text-primary-foreground";
      case "overdue":
        return "bg-destructive text-destructive-foreground";
      case "cancelled":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  if (!invoice || isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="text-center py-8">Loading invoice details...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Invoice Details</DialogTitle>
            <div className="flex gap-2">
              {invoice.status === "draft" && onEdit && (
                <Button size="sm" variant="outline" onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              )}
              <Button size="sm" variant="outline">
                <Mail className="mr-2 h-4 w-4" /> Send
              </Button>
              <Button size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{invoice.invoice_number}</h2>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status}
              </Badge>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">Issue Date</p>
              <p className="font-semibold">
                {format(new Date(invoice.issue_date), "MMM dd, yyyy")}
              </p>

              <p className="text-sm text-muted-foreground mt-2">Due Date</p>
              <p className="font-semibold">
                {format(new Date(invoice.due_date), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div>
            <p className="text-sm text-muted-foreground">Bill To</p>
            <p className="font-semibold text-lg">
              {invoice.customers?.name || "Walk-in Customer"}
            </p>

            {invoice.customers?.email && (
              <p className="text-sm text-muted-foreground">
                {invoice.customers.email}
              </p>
            )}
            {invoice.customers?.phone && (
              <p className="text-sm text-muted-foreground">
                {invoice.customers.phone}
              </p>
            )}
          </div>

          <Separator />

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-4">Items</h3>
            <div className="space-y-2">
              {invoice.invoice_items?.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 p-3 bg-accent/50 rounded-lg"
                >
                  <div className="col-span-6">
                    <p className="font-medium">{item.description}</p>
                  </div>

                  <div className="col-span-2 text-center">
                    <p className="text-sm text-muted-foreground">Qty</p>
                    <p className="font-medium">{item.quantity}</p>
                  </div>

                  <div className="col-span-2 text-center">
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium">
                      ₦{Number(item.unit_price).toLocaleString()}
                    </p>
                  </div>

                  <div className="col-span-2 text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-medium">
                      ₦{Number(item.line_total).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                ₦{Number(invoice.subtotal).toLocaleString()}
              </span>
            </div>

            {invoice.tax_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">
                  ₦{Number(invoice.tax_amount).toLocaleString()}
                </span>
              </div>
            )}

            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Discount</span>
                <span className="font-medium">
                  -₦{Number(invoice.discount_amount).toLocaleString()}
                </span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span>
                ₦{Number(invoice.total_amount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <p className="text-sm">{invoice.notes}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
