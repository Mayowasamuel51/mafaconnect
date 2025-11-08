import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Gift, Search, TrendingUp, Award } from "lucide-react";
import mafaLogo from "../assets/mafa-logo.png";

// Replace these imports with your UI library or plain HTML
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/Card";
import { Card } from "@/components/ui/Card";
import { CardContent } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/Card";
import { CardDescription } from "@/components/ui/Card";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/Card";
// import { Input } from "../components/Input";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
// import { Badge } from "lucide-react";
// import { Button } from "../components/Button";
// import { Badge } from "../components/Badge";

export default function CustomerPortal() {
  const [phone, setPhone] = useState("");
  const [searchedPhone, setSearchedPhone] = useState("");
  const [customer, setCustomer] = useState(null);
  const [loyaltyAccount, setLoyaltyAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [rewards, setRewards] = useState([
    { id: 1, title: "₦500 Discount", description: "Get ₦500 off your next order", points_cost: 100, reward_type: "discount" },
    { id: 2, title: "Free Product Sample", description: "Enjoy a free product sample on your next visit", points_cost: 200, reward_type: "gift" },
    { id: 3, title: "₦1000 Voucher", description: "Redeem ₦1000 shopping voucher", points_cost: 300, reward_type: "voucher" },
  ]);

  const handleSearch = () => {
    setSearchedPhone(phone);
    // Mock search logic
    if (phone.trim() === "08012345678") {
      const mockCustomer = { id: 1, name: "John Doe", phone: "08012345678", email: "john@example.com" };
      const mockLoyalty = { id: 1, customer_id: 1, points_balance: 240, tier: "Gold" };
      const mockTransactions = [
        { id: 1, type: "Purchase", points: 50, created_at: "2025-10-20" },
        { id: 2, type: "Reward Redemption", points: -100, created_at: "2025-10-18" },
        { id: 3, type: "Referral Bonus", points: 150, created_at: "2025-10-10" },
      ];

      setCustomer(mockCustomer);
      setLoyaltyAccount(mockLoyalty);
      setTransactions(mockTransactions);
    } else {
      setCustomer(null);
      setLoyaltyAccount(null);
      setTransactions([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src={mafaLogo} alt="MAFA Logo" className="h-8 w-8" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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

      <div className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Customer Loyalty Portal
            </h1>
            <p className="text-muted-foreground">Check your points and rewards</p>
          </div>

          {/* Search */}
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Your Account
              </CardTitle>
              <CardDescription>Enter your phone number to view your loyalty details</CardDescription>
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

          {/* Customer Details */}
          {customer && (
            <>
              {/* Profile + Points */}
              <Card className="mb-8 shadow-lg border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    {customer.name}
                  </CardTitle>
                  <CardDescription>{customer.email || customer.phone}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <p className="text-sm text-muted-foreground">Points Balance</p>
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
                          <p className="text-sm text-muted-foreground">Current Tier</p>
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
                    {rewards.map((reward) => (
                      <Card key={reward.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <h3 className="font-semibold mb-2">{reward.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {reward.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{reward.points_cost} pts</Badge>
                            <Badge
                              variant={reward.reward_type === "discount" ? "default" : "secondary"}
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
                    {transactions.length > 0 ? (
                      transactions.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">{t.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(t.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={t.points > 0 ? "default" : "secondary"}>
                            {t.points > 0 ? "+" : ""}
                            {t.points} pts
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No recent transactions
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!customer && searchedPhone && (
            <p className="text-center text-red-500 font-medium">
              No customer found for {searchedPhone}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
