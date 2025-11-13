import { MetricCard } from "@/components/MetricCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSales } from "@/hooks/useSales";
import { useProducts } from "@/hooks/useProducts";

export default function Dashboard() {
  const { analytics, isLoading: analyticsLoading } = useAnalytics();
  const { sales, isLoading: salesLoading } = useSales();
  const { products, isLoading: productsLoading } = useProducts();

  const recentSales = sales?.slice(0, 4).map((sale) => ({
    id: sale.id,
    customer: sale.customers?.name || "Walk-in Customer",
    amount: Number(sale.total_amount),
    items: sale.sale_items?.length || 0,
    time: new Date(sale.created_at).toLocaleString(),
  })) || [];

  const topProducts = products
    ?.filter((p) => p.active)
    .sort((a, b) => b.stock_qty - a.stock_qty)
    .slice(0, 4)
    .map((p) => ({
      name: p.name,
      sales: p.stock_qty,
      revenue: Number(p.sale_price) * p.stock_qty,
    })) || [];

  if (analyticsLoading || salesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={`₦${analytics?.totalRevenue.toLocaleString() || "0"}`}
          change="+12.5% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="text-primary"
        />
        <MetricCard
          title="Total Sales"
          value={analytics?.salesCount.toString() || "0"}
          change="+8.2% from last month"
          changeType="positive"
          icon={ShoppingBag}
          iconColor="text-success"
        />
        <MetricCard
          title="Active Customers"
          value={analytics?.customerCount.toString() || "0"}
          change="+18 new this week"
          changeType="positive"
          icon={Users}
          iconColor="text-accent"
        />
        <MetricCard
          title="Loyalty Points"
          value={`${((analytics?.totalPoints || 0) / 1000).toFixed(1)}K`}
          change="Distributed this month"
          changeType="neutral"
          icon={TrendingUp}
          iconColor="text-warning"
        />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Recent Sales */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl font-semibold">Recent Sales</CardTitle>
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{sale.customer}</p>
                    <p className="text-sm text-muted-foreground">
                      {sale.items} items • {sale.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ₦{sale.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl font-semibold">Top Products</CardTitle>
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} sales
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-foreground">
                      ₦{product.revenue.toLocaleString()}
                    </p>
                  </div>
                  {index < topProducts.length - 1 && (
                    <div className="h-px bg-border" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
