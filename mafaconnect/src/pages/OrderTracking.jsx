import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/uimain/card";
import { Button } from "@/components/uimain/button";
import { OrderStatusTimeline } from "@/components/OrderStatusTimeline";
import { formatCurrency } from "@/lib/transactionUtils";
import { useCustomerOrders } from "@/hooks/useCustomerOrders";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/uimain/skeleton";
import { Badge } from "@/components/uimain/Badge";

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById } = useCustomerOrders();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        try {
          const data = await getOrderById(orderId);
          setOrder(data);
        } catch (error) {
          console.error("Error fetching order:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/customer-orders">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold mb-2">Order {order.order_number}</h1>
        <Badge variant="secondary" className="capitalize">
          {order.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusTimeline
                currentStatus={order.status}
                statusHistory={order.history}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-semibold">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.line_total)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(order.total_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Address</p>
                <p className="text-sm">{order.shipping_address}</p>
                <p className="text-sm">{order.shipping_city}, {order.shipping_state}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="text-sm">{order.contact_phone}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
