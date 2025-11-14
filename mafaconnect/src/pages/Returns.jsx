import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useReturns } from "@/hooks/useReturns"; // <-- now API-based, not supabase
import { PackageX, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { ReturnDialog } from "@/components/ReturnDialog";

export default function Returns() {
  const { returns, isLoading, processReturn } = useReturns();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [showNewReturn, setShowNewReturn] = React.useState(false);

  const filteredReturns = returns?.filter(
    (ret) =>
      ret.return_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.customers?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "approved":
        return "bg-primary text-primary-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-warning text-warning-foreground";
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Returns & Refunds</h1>
          <p className="text-muted-foreground">Process customer returns</p>
        </div>
        <Button onClick={() => setShowNewReturn(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Return
        </Button>
      </div>

      {/* Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search returns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading returns...</div>
          ) : filteredReturns?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No returns found" : "No returns yet"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReturns?.map((ret) => (
                <div
                  key={ret.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-4 flex-1">
                    <PackageX className="h-8 w-8 text-destructive" />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{ret.return_number}</p>
                        <Badge className={getStatusColor(ret.status)}>
                          {ret.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {ret.customers?.name || "Walk-in"} •{" "}
                        {format(new Date(ret.return_date), "MMM dd, yyyy")}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Reason: {ret.reason}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      ₦{Number(ret.refund_amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      via {ret.refund_method}
                    </p>

                    {/* ACTION BUTTONS */}
                    {ret.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            processReturn({
                              id: ret.id,
                              status: "approved",
                              restock: false,
                            })
                          }
                        >
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            processReturn({
                              id: ret.id,
                              status: "rejected",
                              restock: false,
                            })
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    {ret.status === "approved" && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          processReturn({
                            id: ret.id,
                            status: "completed",
                            restock: true,
                          })
                        }
                      >
                        Complete & Restock
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ReturnDialog open={showNewReturn} onOpenChange={setShowNewReturn} />
    </div>
  );
}
