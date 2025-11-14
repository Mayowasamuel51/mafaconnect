import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useStockTransfers } from "@/hooks/useStockTransfers";
import { StockTransferDialog } from "@/components/StockTransferDialog";
import { ArrowRight, ArrowRightLeft, Check, Clock, Package, X } from "lucide-react";
import { format } from "date-fns";

export default function StockTransfers() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const {
    stockTransfers,
    isLoading,
    isError,
    error,
    approveTransfer,
    completeTransfer,
    cancelTransfer,
  } = useStockTransfers();

  // ✅ Moved Record typing → plain JS object
  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: "secondary", icon: Clock },
      approved: { variant: "default", icon: Check },
      in_transit: { variant: "default", icon: Package },
      completed: { variant: "default", icon: Check },
      cancelled: { variant: "destructive", icon: X },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading transfers...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-destructive text-4xl">⚠️</div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Error Loading Transfers</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {error instanceof Error ? error.message : "Failed to load stock transfers"}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Stock Transfers</h1>
          <p className="text-muted-foreground">
            Manage inventory transfers between locations
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Package className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>

      <div className="grid gap-4">
        {stockTransfers && stockTransfers.length > 0 ? (
          stockTransfers.map((transfer) => (
            <Card key={transfer.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{transfer.product?.name}</CardTitle>
                    <CardDescription>
                      {transfer.movement_number} • {transfer.quantity} units
                    </CardDescription>
                  </div>
                  {getStatusBadge(transfer.status)}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Locations */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{transfer.from_location?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {transfer.from_location?.state}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 mx-4 text-muted-foreground" />
                    <div className="flex-1 text-right">
                      <p className="font-medium">{transfer.to_location?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {transfer.to_location?.state}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p>{format(new Date(transfer.created_at), "PPp")}</p>
                    </div>
                    {transfer.expected_delivery && (
                      <div>
                        <p className="text-muted-foreground">Expected Delivery</p>
                        <p>{format(new Date(transfer.expected_delivery), "PP")}</p>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {transfer.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm">{transfer.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {transfer.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => approveTransfer(transfer.id)}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelTransfer(transfer.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {transfer.status === "approved" && (
                    <Button size="sm" onClick={() => completeTransfer(transfer.id)}>
                      Mark as Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12 space-y-4">
              <ArrowRightLeft className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
              <div>
                <h3 className="text-lg font-semibold mb-2">No Stock Transfers Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Before creating transfers, make sure you have:
                </p>
              </div>

              {/* Instructions */}
              <div className="space-y-2 text-sm text-muted-foreground max-w-lg mx-auto">
                <div className="flex items-start gap-2 text-left">
                  <span className="font-semibold text-foreground">1.</span>
                  <p>
                    <strong className="text-foreground">Multiple Locations:</strong> Create at least 2 locations (warehouse, stores, etc.)
                    <Button
                      variant="link"
                      className="h-auto p-0 ml-1"
                      onClick={() => navigate("/locations")}
                    >
                      View Locations
                    </Button>
                  </p>
                </div>
                <div className="flex items-start gap-2 text-left">
                  <span className="font-semibold text-foreground">2.</span>
                  <p>
                    <strong className="text-foreground">Products Assigned to Locations:</strong> Go to Products and assign them to locations with initial stock
                    <Button
                      variant="link"
                      className="h-auto p-0 ml-1"
                      onClick={() => navigate("/products")}
                    >
                      View Products
                    </Button>
                  </p>
                </div>
                <div className="flex items-start gap-2 text-left">
                  <span className="font-semibold text-foreground">3.</span>
                  <p>
                    <strong className="text-foreground">Create Transfer:</strong> Click "New Transfer" to move products between locations
                  </p>
                </div>
              </div>

              <Button onClick={() => setDialogOpen(true)} size="lg" className="mt-4">
                <Package className="mr-2 h-4 w-4" />
                Create Your First Transfer
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog */}
      <StockTransferDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
