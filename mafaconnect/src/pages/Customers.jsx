import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserPlus, Search, User, Award, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerDialog } from "@/components/CustomerDialog";

export default function Customers() {
  const { customers, isLoading } = useCustomers();
  const [showDialog, setShowDialog] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredCustomers = customers?.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case "Platinum":
        return "bg-accent/10 text-accent border-accent/20";
      case "Gold":
        return "bg-warning/10 text-warning border-warning/20";
      case "Silver":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-secondary text-secondary-foreground border-border";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">Customers</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage customer profiles and loyalty status
          </p>
        </div>
        <Button 
          onClick={() => setShowDialog(true)}
          className="bg-gradient-primary shadow-md hover:shadow-lg transition-all h-11 w-full sm:w-auto"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <CustomerDialog open={showDialog} onOpenChange={setShowDialog} />

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl">Customer Directory</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-10 h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCustomers?.map((customer) => {
              const loyaltyAccount = customer.loyalty_accounts?.[0];
              return (
                <div
                  key={customer.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-gradient-primary flex-shrink-0">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                        <p className="font-semibold text-foreground">
                          {customer.name}
                        </p>
                        <Badge variant="outline" className={getTierColor(loyaltyAccount?.tier || "Silver")}>
                          <Award className="h-3 w-3 mr-1" />
                          {loyaltyAccount?.tier || "Silver"}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {customer.email || "No email"} {customer.phone && `• ${customer.phone}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground mb-1">Points</p>
                    <p className="font-semibold text-accent">
                      {loyaltyAccount?.points_balance?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
