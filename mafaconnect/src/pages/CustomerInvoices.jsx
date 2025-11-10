import React from "react";
import { useAuth } from "@/hookss/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/uimain/card";
import { Badge } from "@/components/uimain/Badge";
import { Input } from "@/components/uimain/Input";
import { Button } from "@/components/uimain/button";
import { Loader2, Search, Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function CustomerInvoices() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["customer-invoices", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          invoice_items(
            *,
            products(name)
          ),
          sales(
            customer_orders(
              order_number,
              id
            )
          )
        `)
        .eq("customer_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const filteredInvoices = React.useMemo(() => {
    if (!invoices) return [];
    if (!searchQuery) return invoices;

    return invoices.filter((invoice) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        invoice.invoice_number.toLowerCase().includes(searchLower) ||
        invoice.status.toLowerCase().includes(searchLower)
      );
    });
  }, [invoices, searchQuery]);

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "default";
      case "sent":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  const downloadInvoice = async (invoice) => {
    try {
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

      // Generate invoice HTML
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
            .invoice-header h1 { margin: 0; color: #16a34a; }
            .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-info div { flex: 1; }
            .invoice-details { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #16a34a; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
            .totals { margin-left: auto; width: 300px; }
            .totals div { display: flex; justify-content: space-between; padding: 8px 0; }
            .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
            .status-paid { background: #dcfce7; color: #166534; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>${businessName}</h1>
            <p>${businessAddress}</p>
            <p>Phone: ${businessPhone} | Email: ${businessEmail}</p>
          </div>

          <div class="invoice-info">
            <div>
              <h3>Invoice To:</h3>
              <p><strong>Customer ID:</strong> ${invoice.customer_id}</p>
              ${invoice.sales?.customer_orders?.[0] ? `<p><strong>Order:</strong> ${invoice.sales.customer_orders[0].order_number}</p>` : ''}
            </div>
            <div style="text-align: right;">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
              <p><strong>Issue Date:</strong> ${format(new Date(invoice.issue_date), "MMM d, yyyy")}</p>
              <p><strong>Due Date:</strong> ${format(new Date(invoice.due_date), "MMM d, yyyy")}</p>
              <span class="status-badge status-paid">${invoice.status.toUpperCase()}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.invoice_items?.map((item) => `
                <tr>
                  <td>${item.description || item.products?.name}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">₦${Number(item.unit_price).toLocaleString()}</td>
                  <td style="text-align: right;">₦${Number(item.line_total).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div>
              <span>Subtotal:</span>
              <span>₦${Number(invoice.total_amount - invoice.tax_amount + invoice.discount_amount).toLocaleString()}</span>
            </div>
            ${invoice.discount_amount > 0 ? `
            <div>
              <span>Discount:</span>
              <span>-₦${Number(invoice.discount_amount).toLocaleString()}</span>
            </div>
            ` : ''}
            ${invoice.tax_amount > 0 ? `
            <div>
              <span>Tax:</span>
              <span>₦${Number(invoice.tax_amount).toLocaleString()}</span>
            </div>
            ` : ''}
            <div class="total-row">
              <span>TOTAL:</span>
              <span>₦${Number(invoice.total_amount).toLocaleString()}</span>
            </div>
          </div>

          ${invoice.notes ? `<div class="invoice-details"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${format(new Date(), "MMM d, yyyy 'at' h:mm a")}</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${invoice.invoice_number}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully! Open the file and print/save");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Invoices</h1>
        <p className="text-muted-foreground">View and manage your invoices</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length > 0 ? (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Invoice #{invoice.invoice_number}
                        </CardTitle>
                        <CardDescription>
                          {invoice.sales?.customer_orders?.[0] && (
                            <>
                              Order: {invoice.sales.customer_orders[0].order_number}
                              {" • "}
                            </>
                          )}
                          Issued: {format(new Date(invoice.issue_date), "MMM d, yyyy")}
                          {" • "}
                          Due: {format(new Date(invoice.due_date), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {invoice.invoice_items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.description || item.products?.name} (x{item.quantity})
                          </span>
                          <span className="font-medium">
                            ₦{Number(item.line_total).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {invoice.discount_amount > 0 && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Discount</span>
                          <span>-₦{Number(invoice.discount_amount).toLocaleString()}</span>
                        </div>
                      )}
                      {invoice.tax_amount > 0 && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Tax</span>
                          <span>₦{Number(invoice.tax_amount).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t font-bold">
                        <span>Total Amount</span>
                        <span>₦{Number(invoice.total_amount).toLocaleString()}</span>
                      </div>
                      {invoice.notes && (
                        <p className="text-sm text-muted-foreground pt-2">
                          Note: {invoice.notes}
                        </p>
                      )}
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => downloadInvoice(invoice)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoice
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery ? "No invoices found matching your search" : "No invoices yet"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
