import { format } from "date-fns";
import { Download, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/uimain/dialog";
import { Button } from "@/components/uimain/button";
import { Badge } from "@/components/uimain/Badge";
import { Separator } from "@/components/uimain/separator";
import { TRANSACTION_TYPES, STATUS_CONFIG, formatCurrency, isOverdue } from "@/lib/transactionUtils";

import { useTransactions } from "@/hooks/useTransactions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";



export function TransactionDetailsDialog({
  open,
  onOpenChange,
  transaction,
}: TransactionDetailsDialogProps) {
  const { updateTransactionStatus } = useTransactions();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  if (!transaction) return null;

  const typeConfig = TRANSACTION_TYPES[transaction.transaction_type;
  const statusConfig = STATUS_CONFIG[transaction.status;
  const overdue = isOverdue(transaction.due_date, transaction.status);

  const handleStatusChange = (newStatus: TransactionStatus) => {
    updateTransactionStatus({ id: transaction.id, status: newStatus });
  };

  const downloadPDF = async () => {
    try {
      setIsDownloading(true);

      // Fetch store settings for business details
      const { data: storeSettings } = await supabase
        .from("store_settings")
        .select("*")
        .in("setting_key", ["business_name", "business_address", "business_phone", "business_email"]);

      const settings = {};
      storeSettings?.forEach(s => {
        settings[s.setting_key] = s.setting_value;
      });

      const businessName = settings.business_name || "MAFA Connect";
      const businessAddress = settings.business_address || "";
      const businessPhone = settings.business_phone || "";
      const businessEmail = settings.business_email || "";

      // Generate transaction HTML
      const transactionHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${transaction.invoice_number || `Transaction #${transaction.id.slice(0, 8)}`}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #16a34a; }
            .info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .info div { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #16a34a; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
            .totals { margin-left: auto; width: 300px; }
            .totals div { display: flex; justify-content: space-between; padding: 8px 0; }
            .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
            .status-completed { background: #dcfce7; color: #166534; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${businessName}</h1>
            <p>${businessAddress}</p>
            <p>Phone: ${businessPhone} | Email: ${businessEmail}</p>
          </div>

          <div class="info">
            <div>
              <h3>${typeConfig?.label || "Transaction"}</h3>
              <p><strong>Transaction ID:</strong> ${transaction.invoice_number || transaction.id.slice(0, 8)}</p>
              <p><strong>Date:</strong> ${format(new Date(transaction.created_at), "MMMM do, yyyy")}</p>
              ${transaction.due_date ? `<p><strong>Due Date:</strong> ${format(new Date(transaction.due_date), "MMMM do, yyyy")}</p>` : ''}
            </div>
            <div style="text-align: right;">
              ${transaction.customers ? `
                <h3>Customer</h3>
                <p><strong>${transaction.customers.name}</strong></p>
                ${transaction.customers.email ? `<p>${transaction.customers.email}</p>` : ''}
              ` : ''}
              ${transaction.locations ? `
                <h3>Location</h3>
                <p><strong>${transaction.locations.name}</strong></p>
              ` : ''}
              <p><strong>Payment Method:</strong><br>${transaction.payment_method?.replace("_", " ")}</p>
              <span class="status-badge status-completed">${statusConfig?.label || transaction.status}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${transaction.sale_items?.map((item) => `
                <tr>
                  <td>${item.products?.name || "Product"}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${formatCurrency(item.unit_price)}</td>
                  <td style="text-align: right;">${formatCurrency(item.line_total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div>
              <span>Subtotal:</span>
              <span>${formatCurrency(transaction.subtotal || 0)}</span>
            </div>
            ${transaction.discount_amount > 0 ? `
            <div>
              <span>Discount:</span>
              <span>-${formatCurrency(transaction.discount_amount)}</span>
            </div>
            ` : ''}
            <div>
              <span>Tax:</span>
              <span>${formatCurrency(transaction.tax_amount)}</span>
            </div>
            <div class="total-row">
              <span>TOTAL:</span>
              <span>${formatCurrency(transaction.total_amount)}</span>
            </div>
          </div>

          ${transaction.notes ? `
            <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
              <strong>Notes:</strong> ${transaction.notes}
            </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${format(new Date(), "MMMM do, yyyy 'at' h:mm a")}</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([transactionHTML], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${transaction.invoice_number || `Transaction_${transaction.id.slice(0, 8)}`}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Transaction downloaded! Open the file and print/save");
    } catch (error) {
      console.error("Error downloading transaction:", error);
      toast.error("Failed to download transaction");
    } finally {
      setIsDownloading(false);
    }
  };

  const sendEmail = async () => {
    try {
      setIsSendingEmail(true);

      if (!transaction.customers?.email) {
        toast.error("No customer email found");
        return;
      }

      const { error } = await supabase.functions.invoke("send-receipt", {
        body: {
          saleId: transaction.id,
        },
      });

      if (error) throw error;

      toast.success(`Receipt sent to ${transaction.customers.email}`);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send receipt email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <DialogTitle>
                {transaction.invoice_number || `Transaction #${transaction.id.slice(0, 8)}`}
              </DialogTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{typeConfig?.label}</Badge>
                <Badge variant={overdue ? "destructive" : statusConfig?.variant}>
                  {overdue ? "Overdue" : statusConfig?.label}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Date</div>
              <div className="font-medium">
                {format(new Date(transaction.created_at), "PPP")}
              </div>
            </div>
            {transaction.due_date && (
              <div>
                <div className="text-sm text-muted-foreground">Due Date</div>
                <div className={`font-medium ${overdue ? "text-destructive" : ""}`}>
                  {format(new Date(transaction.due_date), "PPP")}
                </div>
              </div>
            )}
            {transaction.customers && (
              <div>
                <div className="text-sm text-muted-foreground">Customer</div>
                <div className="font-medium">{transaction.customers.name}</div>
                {transaction.customers.email && (
                  <div className="text-sm text-muted-foreground">
                    {transaction.customers.email}
                  </div>
                )}
              </div>
            )}
            {transaction.locations && (
              <div>
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="font-medium">{transaction.locations.name}</div>
                <div className="text-sm text-muted-foreground">
                  {transaction.locations.state}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Payment Method</div>
              <div className="font-medium capitalize">
                {transaction.payment_method?.replace("_", " ")}
              </div>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-3">Items</h3>
            <div className="space-y-2">
              {transaction.sale_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {item.products?.name || "Product"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </div>
                  </div>
                  <div className="font-semibold">{formatCurrency(item.line_total)}</div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(transaction.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(transaction.tax_amount)}</span>
            </div>
            {transaction.discount_amount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Discount:</span>
                <span>-{formatCurrency(transaction.discount_amount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>{formatCurrency(transaction.total_amount)}</span>
            </div>
          </div>

          {transaction.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{transaction.notes}</p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadPDF}
              disabled={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download PDF"}
            </Button>
            {transaction.customers?.email && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={sendEmail}
                disabled={isSendingEmail}
              >
                <Mail className="mr-2 h-4 w-4" />
                {isSendingEmail ? "Sending..." : "Send Email"}
              </Button>
            )}
            {transaction.status === "draft" && (
              <Button
                size="sm"
                onClick={() => handleStatusChange("sent")}
              >
                Mark
              </Button>
            )}
            {transaction.status === "sent" && (
              <Button
                size="sm"
                onClick={() => handleStatusChange("paid")}
              >
                Mark
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
