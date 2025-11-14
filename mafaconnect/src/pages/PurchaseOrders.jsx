import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { ShoppingBag, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { PurchaseOrderDialog } from "@/components/PurchaseOrderDialog";

export default function PurchaseOrders() {
  const { purchaseOrders, isLoading, receivePurchaseOrder } = usePurchaseOrders();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showDialog, setShowDialog] = React.useState(false);

  const filteredPOs = purchaseOrders?.filter((po) =>
    (po.po_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (po.suppliers?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "received":
        return "bg-success text-success-foreground";
      case "sent":
        return "bg-primary text-primary-foreground";
      case "partial":
        return "bg-warning text-warning-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage purchase orders from suppliers</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New PO
        </Button>
      </div>

      {/* Search + Table */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search purchase orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading purchase orders...</div>
          ) : filteredPOs?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No purchase orders found" : "No purchase orders yet"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPOs?.map((po) => (
                <div
                  key={po.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <ShoppingBag className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      {/* PO Number + Status */}
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{po.po_number}</p>
                        <Badge className={getStatusColor(po.status)}>
                          {po.status}
                        </Badge>
                      </div>

                      {/* Supplier + Location */}
                      <p className="text-sm text-muted-foreground">
                        {po.suppliers?.name}
                        {po.locations && ` • ${po.locations.name}`}
                      </p>

                      {/* Dates */}
                      <p className="text-sm text-muted-foreground">
                        Order: {format(new Date(po.order_date), "MMM dd, yyyy")}
                        {po.expected_delivery &&
                          ` • Expected: ${format(new Date(po.expected_delivery), "MMM dd, yyyy")}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      ₦{Number(po.total_amount).toLocaleString()}
                    </p>

                    {(po.status === "draft" || po.status === "sent") && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          receivePurchaseOrder({
                            id: po.id,
                            locationId: po.location_id || undefined,
                          })
                        }
                      >
                        Receive Goods
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <PurchaseOrderDialog open={showDialog} onOpenChange={setShowDialog} />
    </div>
  );
}
