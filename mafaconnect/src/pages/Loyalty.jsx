import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Gift, Award, TrendingUp, Coins, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRewards } from "@/hooks/useRewards";
import { useLoyaltyStats } from "@/hooks/useLoyaltyStats";
import { useAuth } from "@/hooks/useAuth";
import { RewardDialog } from "@/components/RewardDialog";
import { LoyaltyTransactionDialog } from "@/components/LoyaltyTransactionDialog";
import { format } from "date-fns";

async function fetchAPI(url) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function Loyalty() {
  const { rewards, isLoading } = useRewards();
  const { stats } = useLoyaltyStats();
  const { user, isStaff } = useAuth();

  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);

  // 🔹 Fetch current user's loyalty account
  const {
    data: loyaltyAccount,
    isLoading: loadingAccount,
  } = useQuery({
    queryKey: ["customer-loyalty-account", user?.id],
    queryFn: async () =>
      fetchAPI(`/api/loyalty/accounts/${user?.id}`), // expects { id, tier, points_balance }
    enabled: !!user?.id && !isStaff,
  });

  // 🔹 Fetch recent transactions
  const { data: recentTransactions } = useQuery({
    queryKey: ["customer-loyalty-transactions", loyaltyAccount?.id],
    queryFn: async () =>
      fetchAPI(`/api/loyalty/transactions?account_id=${loyaltyAccount?.id}`),
    enabled: !!loyaltyAccount?.id && !isStaff,
  });

  if (isLoading || (!isStaff && loadingAccount)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const tierConfig = [
    {
      name: "Bronze",
      minPoints: 0,
      maxPoints: 999,
      benefits: ["Earn 1 point per ₦100", "Basic rewards access"],
      color: "text-secondary-foreground",
    },
    {
      name: "Silver",
      minPoints: 1000,
      maxPoints: 2999,
      benefits: [
        "Earn 1.25 points per ₦100",
        "Priority support",
        "Exclusive rewards",
      ],
      color: "text-muted-foreground",
    },
    {
      name: "Gold",
      minPoints: 3000,
      maxPoints: 4999,
      benefits: [
        "Earn 1.5 points per ₦100",
        "Premium support",
        "Birthday bonus",
      ],
      color: "text-warning",
    },
    {
      name: "Platinum",
      minPoints: 5000,
      maxPoints: Infinity,
      benefits: [
        "Earn 2 points per ₦100",
        "VIP support",
        "Free shipping",
        "Early access",
      ],
      color: "text-accent",
    },
  ];

  // 🔸 Customer view
  if (!isStaff) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Loyalty & Rewards</h1>
          <p className="text-muted-foreground">Earn points and redeem rewards</p>
        </div>

        {/* Customer Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Balance</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loyaltyAccount?.points_balance || 0}
              </div>
              <p className="text-xs text-muted-foreground">Available to redeem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Tier</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loyaltyAccount?.tier || "Silver"}
              </div>
              <p className="text-xs text-muted-foreground">Member status</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentTransactions
                  ?.filter((t) => t.type === "earn")
                  .reduce((sum, t) => sum + t.points, 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">All time points</p>
            </CardContent>
          </Card>
        </div>

        {/* Tiers */}
        <Card>
          <CardHeader>
            <CardTitle>Loyalty Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {tierConfig.map((tier) => (
                <div
                  key={tier.name}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    loyaltyAccount?.tier === tier.name
                      ? "bg-primary/10 border-primary"
                      : "bg-secondary/30 border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Award className={`h-5 w-5 ${tier.color}`} />
                    <h3 className={`text-lg font-bold ${tier.color}`}>
                      {tier.name}
                    </h3>
                    {loyaltyAccount?.tier === tier.name && (
                      <Badge variant="default" className="ml-auto">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {tier.minPoints.toLocaleString()} -{" "}
                    {tier.maxPoints?.toLocaleString() || "∞"} points
                  </p>
                  <ul className="space-y-1">
                    {tier.benefits.map((b, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-1">•</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards */}
        <Card>
          <CardHeader>
            <CardTitle>Available Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {rewards?.filter((r) => r.active).map((reward) => (
                <div key={reward.id} className="p-4 rounded-lg bg-card border">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-primary">
                      <Gift className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{reward.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {reward.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-accent/10 text-accent">
                      {reward.points_cost.toLocaleString()} points
                    </Badge>
                    {reward.stock_limit && (
                      <span className="text-sm text-muted-foreground">
                        {reward.stock_limit} left
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions?.length > 0 ? (
              <div className="space-y-2">
                {recentTransactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium capitalize">{t.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(t.created_at), "MMM d, yyyy")}
                      </p>
                      {t.note && (
                        <p className="text-sm text-muted-foreground">{t.note}</p>
                      )}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        t.type === "earn"
                          ? "text-success"
                          : "text-muted-foreground"
                      }`}
                    >
                      {t.type === "earn" ? "+" : "-"}
                      {t.points}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No transactions yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🔸 Staff View
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Loyalty Program
          </h1>
          <p className="text-muted-foreground">
            Manage rewards and loyalty tiers
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowTransactionDialog(true)}
            variant="outline"
            className="shadow-md hover:shadow-lg transition-all"
          >
            <Coins className="mr-2 h-4 w-4" /> Points Transaction
          </Button>
          <Button
            onClick={() => setShowRewardDialog(true)}
            className="bg-gradient-primary shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Reward
          </Button>
        </div>
      </div>

      <RewardDialog open={showRewardDialog} onOpenChange={setShowRewardDialog} />
      <LoyaltyTransactionDialog
        open={showTransactionDialog}
        onOpenChange={setShowTransactionDialog}
      />

      {/* Staff Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Points Distributed</p>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stats?.totalPointsDistributed?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success/10">
                <Gift className="h-5 w-5 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">Rewards Redeemed</p>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stats?.rewardsRedeemed?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Award className="h-5 w-5 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">Active Members</p>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stats?.activeMembers?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
