import { useMemo } from "react";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Loader2 } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSales } from "@/hooks/useSales";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { ExportButton } from "@/components/ExportButton";

export default function Analytics() {
  const { analytics, isLoading } = useAnalytics();
  const { sales } = useSales();

  // -------------------------------
  // CHART DATA (Last 30 Days)
  // -------------------------------
  const chartData = useMemo(() => {
    if (!sales) return [];

    const last30Days = Array.from({ length: 30 }, (_, i) => ({
      date: format(startOfDay(subDays(new Date(), 29 - i)), "MMM dd"),
      revenue: 0,
      sales: 0,
    }));

    sales.forEach((sale) => {
      const saleDate = format(startOfDay(new Date(sale.created_at)), "MMM dd");
      const dayData = last30Days.find((d) => d.date === saleDate);

      if (dayData) {
        dayData.revenue += Number(sale.total_amount);
        dayData.sales += 1;
      }
    });

    return last30Days;
  }, [sales]);

  // -------------------------------
  // TOP PRODUCTS
  // -------------------------------
  const topProducts = useMemo(() => {
    if (!sales) return [];

    const productStats = new Map();

    sales.forEach((sale) => {
      sale.sale_items?.forEach((item) => {
        const product = item.products;
        const existing = productStats.get(product.id) || {
          name: product.name,
          revenue: 0,
          quantity: 0,
        };

        existing.revenue += Number(item.line_total);
        existing.quantity += item.quantity;
        productStats.set(product.id, existing);
      });
    });

    return Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  return (
    <div className="space-y-4 sm:space-y-8 p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track performance and generate insights
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select defaultValue="30days">
            <SelectTrigger className="h-11 w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
            </SelectContent>
          </Select>

          <ExportButton
            data={sales || []}
            filename="sales_report"
            headers={["Date", "Customer", "Total", "Payment_Method", "Status"]}
          />
        </div>
      </div>

      {/* LOADING */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            {/* Total Revenue */}
            <Card className="shadow-card">
              <CardContent className="p-3 sm:p-6">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Total Revenue</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground mb-2">
                  ₦{analytics?.totalRevenue?.toLocaleString() || 0}
                </p>
                <div className="flex items-center gap-2 text-success">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">All time</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Sales */}
            <Card className="shadow-card">
              <CardContent className="p-3 sm:p-6">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Total Sales</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground mb-2">
                  {analytics?.salesCount || 0}
                </p>
                <div className="flex items-center gap-2 text-success">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">Transactions</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Customers */}
            <Card className="shadow-card">
              <CardContent className="p-3 sm:p-6">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Total Customers</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground mb-2">
                  {analytics?.customerCount || 0}
                </p>
                <div className="flex items-center gap-2 text-success">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">Registered</span>
                </div>
              </CardContent>
            </Card>

            {/* Loyalty Points */}
            <Card className="shadow-card">
              <CardContent className="p-3 sm:p-6">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Loyalty Points</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground mb-2">
                  {analytics?.totalPoints?.toLocaleString() || 0}
                </p>
                <div className="flex items-center gap-2 text-success">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">In circulation</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* REVENUE TREND */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Revenue Trend (Last 30 Days)</CardTitle>
            </CardHeader>

            <CardContent>
              <ChartContainer
                config={{
                  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
                }}
                className="h-[250px] sm:h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* TOP PRODUCTS */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>

            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.name}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.quantity} units sold
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ₦{product.revenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No sales data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
