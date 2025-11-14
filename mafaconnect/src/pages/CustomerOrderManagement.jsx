import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/transactionUtils";
import { format } from "date-fns";
import { Search, Eye, Package, DollarSign, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_URL = import.meta.env.VITE_HOME_OO || "http://localhost:8000/api";

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

const STATUS_BADGE_VARIANT = {
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

  // 🔹 Fetch orders
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["customer-orders-management", statusFilter],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/orders?status=${statusFilter}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch customer orders");
      const data = await res.json();
      return data.orders || data;
    },
  });

  const filteredOrders = orders?.filter((order) =>
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.contact_phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🔹 Confirm payment
  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;
    setIsConfirmingPayment(true);
    try {
      const res = await fetch(`${API_URL}/orders/${selectedOrder.id}/confirm-payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          payment_reference: paymentReference || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to confirm payment");
      }

      toast({
        title: "✅ Payment confirmed",
        description: "Stock has been deducted and payment marked.",
      });
      setPaymentReference("");
      refetch();
    } catch (error) {
      toast({
        title: "❌ Error confirming payment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  // 🔹 Update order status
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_URL}/orders/${selectedOrder.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          new_status: newStatus,
          notes: statusNotes,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update order status");
      }

      toast({
        title: "✅ Status updated",
        description: "Order status updated successfully.",
      });
      setIsDialogOpen(false);
      setNewStatus("");
      setStatusNotes("");
      refetch();
    } catch (error) {
      toast({
        title: "❌ Error updating status",
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Customer Order Management</h1>
        <p className="text-muted-foreground">
          Manage and track customer orders from all channels
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader><CardTitle>Total Orders</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{orders?.length || 0}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{orders?.filter(o => o.status === "pending").length || 0}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>To Ship</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{orders?.filter(o => ["confirmed", "processing", "packed"].includes(o.status)).length || 0}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Delivered Today</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{orders?.filter(o => o.status === "delivered" && format(new Date(o.updated_at), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")).length || 0}</div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by order number or customer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
                    <TableCell>{order.contact_phone}</TableCell>
                    <TableCell>{format(new Date(order.created_at), "PP")}</TableCell>
                    <TableCell>{order.items?.length || 0}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      {needsPaymentConfirmation(order)
                        ? <Badge variant="outline" className="border-warning text-warning"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>
                        : <Badge variant="default" className="bg-success">Paid</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE_VARIANT[order.status] || "secondary"}>
                        {order.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedOrder(order);
                        setNewStatus(order.status);
                        setIsDialogOpen(true);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />Manage
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
          <DialogHeader><DialogTitle>Order {selectedOrder?.order_number}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {needsPaymentConfirmation(selectedOrder) && (
                <Alert className="border-warning bg-warning/10">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <AlertDescription>
                    <p>Payment confirmation required for {selectedOrder.payment_method}</p>
                  </AlertDescription>
                </Alert>
              )}

              {needsPaymentConfirmation(selectedOrder) && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                  <Label>Payment Reference (Optional)</Label>
                  <Input placeholder="Enter payment reference..." value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} />
                  <Button onClick={handleConfirmPayment} disabled={isConfirmingPayment} className="w-full">
                    {isConfirmingPayment ? "Processing..." : "Confirm Payment Received"}
                  </Button>
                </div>
              )}

              <div>
                <Label htmlFor="status">Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter((opt) => opt.value !== "all").map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" placeholder="Add notes..." value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)} />
              </div>

              <Button onClick={handleUpdateStatus} disabled={isUpdating || newStatus === selectedOrder.status} className="w-full">
                {isUpdating ? "Updating..." : "Update Status"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
