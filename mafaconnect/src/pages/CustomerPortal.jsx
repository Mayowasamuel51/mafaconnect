import React from "react";
import { Card } from "@/components/ui/Card";
import { CardContent } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/Card";
import { CardTitle } from "@/components/ui/Card";
import { CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Gift, Search, TrendingUp, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api"; // <-- your Node API helper
import { Link } from "react-router-dom";
import mafaLogo from "@/assets/mafa-logo.png";

export default function CustomerPortal() {
  const [phone, setPhone] = React.useState("");
  const [searchedPhone, setSearchedPhone] = React.useState("");

  // 🔹 1. Fetch customer info
  const { data: customer } = useQuery({
    queryKey: ["user", searchedPhone],
    queryFn: async () => {
      if (!searchedPhone) return null;
      const response = await apiGet(`/api/customers?phone=${searchedPhone}`);
      return response.data || null;
    },
    enabled: !!searchedPhone,
  });

  // 🔹 2. Fetch loyalty account
  const { data: loyaltyAccount } = useQuery({
    queryKey: ["loyalty", customer?.id],
    queryFn: async () => {
      if (!customer?.id) return null;
      const response = await apiGet(`/api/loyalty/accounts/${customer.id}`);
      return response.data || null;
    },
    enabled: !!customer?.id,
  });

  // 🔹 3. Fetch loyalty transactions
  const { data: transactions } = useQuery({
    queryKey: ["loyalty-transactions", loyaltyAccount?.id],
    queryFn: async () => {
      if (!loyaltyAccount?.id) return [];
      const response = await apiGet(
        `/api/loyalty/transactions/${loyaltyAccount.id}`
      );
      return response.data || [];
    },
    enabled: !!loyaltyAccount?.id,
  });

  // 🔹 4. Fetch rewards
  const { data: rewards } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const response = await apiGet(`/api/rewards`);
      return response.data || [];
    },
  });

  const handleSearch = () => {
    setSearchedPhone(phone.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src={mafaLogo} alt="MAFA Logo" className="h-8 w-8" />
            <h2 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MAFA Connect
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="outline" size="sm" className="gap-2">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Customer Loyalty Portal
            </h1>
            <p className="text-muted-foreground">
              Check your points and rewards
            </p>
          </div>

          {/* Search */}
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Your Account
              </CardTitle>
              <CardDescription>
                Enter your phone number to view your loyalty details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </CardContent>
          </Card>

          {/* Customer Data */}
          {customer && (
            <>
              <Card className="mb-8 shadow-lg border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    {customer.name}
                  </CardTitle>
                  <CardDescription>
                    {customer.email || customer.phone}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <p className="text-sm text-muted-foreground">
                            Points Balance
                          </p>
                          <p className="text-3xl font-bold">
                            {loyaltyAccount?.points_balance || 0}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Award className="h-8 w-8 mx-auto mb-2 text-accent" />
                          <p className="text-sm text-muted-foreground">
                            Current Tier
                          </p>
                          <Badge className="mt-2" variant="secondary">
                            {loyaltyAccount?.tier || "Silver"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Rewards */}
              <Card className="mb-8 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Available Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rewards?.map((reward) => (
                      <Card
                        key={reward.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="pt-6">
                          <h3 className="font-semibold mb-2">
                            {reward.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {reward.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">
                              {reward.points_cost} points
                            </Badge>
                            <Badge
                              variant={
                                reward.reward_type === "discount"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {reward.reward_type}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Transactions */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {transactions?.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{transaction.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(
                              transaction.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            transaction.points > 0 ? "default" : "secondary"
                          }
                        >
                          {transaction.points > 0 ? "+" : ""}
                          {transaction.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
