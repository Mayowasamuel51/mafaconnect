import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/uimain/card";
import { Badge } from "@/components/uimain/Badge";
import { Button } from "@/components/uimain/button";
import { Input } from "@/components/uimain/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/uimain/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/uimain/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/uimain/table";
import { formatCurrency } from "@/lib/transactionUtils";
import { format } from "date-fns";
import { Search, Eye, Package, DollarSign, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/uimain/textarea";
import { Label } from "@/components/uimain/label";
import { Alert, AlertDescription } from "@/components/uimain/alert";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  processing: "secondary",
  packed: "default",
  shipped: "default",
  out_for_delivery: "default",
  delivered: "default",
  cancelled: "destructive",
};

export default function CustomerOrderManagement() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["customer-orders-management", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("customer_orders")
        .select(`
          *,
          items:customer_order_items (
            id,
            quantity,
            product_name
          )
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const filteredOrders = orders?.filter((order) =>
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.contact_phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;

    setIsConfirmingPayment(true);
    try {
      const { error } = await supabase.functions.invoke("confirm-payment", {
        body: {
          order_id: selectedOrder.id,
          payment_reference: paymentReference || undefined,
        },
      });

      if (error) throw error;

      toast({
        title: "Payment confirmed",
        description: "Stock has been deducted and payment marked",
      });

      setPaymentReference("");
      refetch();
    } catch (error) {
      toast({
        title: "Error confirming payment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke("update-order-status", {
        body: {
          order_id: selectedOrder.id,
          new_status: newStatus,
          notes: statusNotes,
        },
      });

      if (error) throw error;

      toast({
        title: "Status updated",
        description: "Order status has been updated successfully",
      });

      setIsDialogOpen(false);
      setNewStatus("");
      setStatusNotes("");
      refetch();
    } catch (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const needsPaymentConfirmation = (order) => {
    return (
      order.payment_status === "pending" &&
      ["bank_transfer", "cash_on_delivery", "pay_on_pickup"].includes(order.payment_method)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Customer Order Management</h1>
        <p className="text-muted-foreground">
          Manage and track customer orders from all channels
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders?.filter((o) => o.status === "pending").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">To Ship</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders?.filter((o) => ["confirmed", "processing", "packed"].includes(o.status)).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders?.filter((o) => 
                o.status === "delivered" && 
                format(new Date(o.updated_at), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
              ).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">Loading orders...</div>
          ) : filteredOrders && filteredOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.contact_phone}</p>
                        {order.contact_email && (
                          <p className="text-sm text-muted-foreground">{order.contact_email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(order.created_at), "PP")}</TableCell>
                    <TableCell>{order.items?.length || 0}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      {needsPaymentConfirmation(order) ? (
                        <Badge variant="outline" className="border-warning text-warning">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-success">
                          Paid
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE_VARIANT[order.status] || "secondary"}>
                        {order.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Customer orders will appear here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Management Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Payment Confirmation Alert */}
              {needsPaymentConfirmation(selectedOrder) && (
                <Alert className="border-warning bg-warning/10">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-sm">
                    <div className="space-y-2">
                      <p className="font-semibold">Payment Confirmation Required</p>
                      <p className="text-xs text-muted-foreground">
                        For {selectedOrder.payment_method.replace("_", " ")} orders:
                      </p>
                      <ol className="text-xs space-y-1 ml-4 list-decimal">
                        <li>⏳ Stock is currently RESERVED</li>
                        <li>💰 Confirm payment below to DEDUCT stock</li>
                        <li>📦 Then update status to delivered</li>
                      </ol>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Payment Confirmation Section */}
              {needsPaymentConfirmation(selectedOrder) && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-warning" />
                    <h3 className="font-semibold">Confirm Payment</h3>
                  </div>
                  <div>
                    <Label htmlFor="payment-reference">Payment Reference (Optional)</Label>
                    <Input
                      id="payment-reference"
                      placeholder="Enter payment reference or transaction ID..."
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={isConfirmingPayment}
                    className="w-full"
                    variant="default"
                  >
                    {isConfirmingPayment ? "Processing..." : "Confirm Payment Received"}
                  </Button>
                </div>
              )}

              {/* Invoice Information */}
              {selectedOrder.sale_id && (
                <div>
                  <h3 className="font-semibold mb-2">Invoice</h3>
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <p className="font-semibold text-success">✓ Invoice Generated</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          Customer can view their invoice in the Customer Portal
                        </p>
                      </div>
                      <Badge variant="default" className="bg-success">
                        Available
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.contact_phone}</p>
                  <p><span className="text-muted-foreground">Email:</span> {selectedOrder.contact_email || "N/A"}</p>
                  <p><span className="text-muted-foreground">Payment Method:</span> {selectedOrder.payment_method.replace("_", " ")}</p>
                  <p><span className="text-muted-foreground">Payment Status:</span> {selectedOrder.payment_status}</p>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <div className="text-sm">
                  <p>{selectedOrder.shipping_address}</p>
                  <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state}</p>
                  {selectedOrder.delivery_notes && (
                    <p className="text-muted-foreground mt-2">
                      Notes: {selectedOrder.delivery_notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product_name} × {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Update Status */}
              <div>
                <Label htmlFor="status">Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter((opt) => opt.value !== "all").map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about the status update..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                />
              </div>

              <Button
                onClick={handleUpdateStatus}
                disabled={isUpdating || newStatus === selectedOrder.status}
                className="w-full"
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
