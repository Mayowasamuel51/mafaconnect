import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/uimain/card";
import { Button } from "@/components/uimain/button";
import { Badge } from "@/components/uimain/Badge";
import { Plus, Gift, Award, TrendingUp, Coins, Loader2 } from "lucide-react";
import { useRewards } from "@/hooks/useRewards";
import { useLoyaltyStats } from "@/hooks/useLoyaltyStats";
import { useAuth } from "@/hookss/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RewardDialog } from "@/components/RewardDialog";
import { LoyaltyTransactionDialog } from "@/components/LoyaltyTransactionDialog";
import { format } from "date-fns";

export default function Loyalty() {
  const { rewards, isLoading } = useRewards();
  const { stats } = useLoyaltyStats();
  const { user, isStaff } = useAuth();
  const [showRewardDialog, setShowRewardDialog] = React.useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = React.useState(false);

  // Fetch customer's loyalty account
  const { data: loyaltyAccount, isLoading: loadingAccount } = useQuery({
    queryKey: ["customer-loyalty-account", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_accounts")
        .select("*")
        .eq("customer_id", user?.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !isStaff,
  });

  // Fetch customer's recent transactions
  const { data: recentTransactions } = useQuery({
    queryKey: ["customer-loyalty-transactions", loyaltyAccount?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_transactions")
        .select("*")
        .eq("loyalty_account_id", loyaltyAccount?.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
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
      benefits: ["Earn 1.25 points per ₦100", "Priority support", "Exclusive rewards"],
      color: "text-muted-foreground",
    },
    {
      name: "Gold",
      minPoints: 3000,
      maxPoints: 4999,
      benefits: ["Earn 1.5 points per ₦100", "Premium support", "Birthday bonus"],
      color: "text-warning",
    },
    {
      name: "Platinum",
      minPoints: 5000,
      maxPoints,
      benefits: ["Earn 2 points per ₦100", "VIP support", "Free shipping", "Early access"],
      color: "text-accent",
    },
  ];

  // Customer View
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
              <div className="text-2xl font-bold">{loyaltyAccount?.points_balance || 0}</div>
              <p className="text-xs text-muted-foreground">Available to redeem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Tier</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loyaltyAccount?.tier || "Silver"}</div>
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
                {recentTransactions?.filter(t => t.type === 'earn').reduce((sum, t) => sum + t.points, 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">All time points</p>
            </CardContent>
          </Card>
        </div>

        {/* Tier Information */}
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
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-secondary/30 border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Award className={`h-5 w-5 ${tier.color}`} />
                    <h3 className={`text-lg font-bold ${tier.color}`}>{tier.name}</h3>
                    {loyaltyAccount?.tier === tier.name && (
                      <Badge variant="default" className="ml-auto">Current</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {tier.minPoints.toLocaleString()} - {tier.maxPoints?.toLocaleString() || "∞"} points
                  </p>
                  <ul className="space-y-1">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Rewards */}
        <Card>
          <CardHeader>
            <CardTitle>Available Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {rewards?.filter(r => r.active).map((reward) => (
                <div
                  key={reward.id}
                  className="p-4 rounded-lg bg-card border"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-primary">
                      <Gift className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{reward.title}</h3>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
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
            {recentTransactions && recentTransactions.length > 0 ? (
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium capitalize">{transaction.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.created_at), "MMM d, yyyy")}
                      </p>
                      {transaction.note && (
                        <p className="text-sm text-muted-foreground">{transaction.note}</p>
                      )}
                    </div>
                    <div className={`text-lg font-bold ${
                      transaction.type === 'earn' ? 'text-success' : 'text-muted-foreground'
                    }`}>
                      {transaction.type === 'earn' ? '+' : '-'}{transaction.points}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Staff View
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Loyalty Program</h1>
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
            <Coins className="mr-2 h-4 w-4" />
            Points Transaction
          </Button>
          <Button 
            onClick={() => setShowRewardDialog(true)}
            className="bg-gradient-primary shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Reward
          </Button>
        </div>
      </div>

      <RewardDialog open={showRewardDialog} onOpenChange={setShowRewardDialog} />
      <LoyaltyTransactionDialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog} />

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
              {stats?.totalPointsDistributed.toLocaleString() || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">All time</p>
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
              {stats?.rewardsRedeemed.toLocaleString() || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">All time</p>
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
              {stats?.activeMembers.toLocaleString() || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">All tiers</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Loyalty Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tierConfig.map((tier) => (
              <div
                key={tier.name}
                className="p-6 rounded-xl border-2 bg-secondary/30 hover:bg-secondary/50 transition-all"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Award className={`h-6 w-6 ${tier.color}`} />
                  <h3 className={`text-xl font-bold ${tier.color}`}>
                    {tier.name}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {tier.minPoints.toLocaleString()} - {tier.maxPoints?.toLocaleString() || "∞"} points
                </p>
                <ul className="space-y-2">
                  {tier.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Available Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {rewards?.map((reward) => (
              <div
                key={reward.id}
                className="p-6 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-primary">
                      <Gift className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {reward.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {reward.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                      {reward.points_cost.toLocaleString()} points
                    </Badge>
                    {reward.stock_limit && (
                      <span className="text-sm text-muted-foreground">
                        Stock: {reward.stock_limit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
