import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/uimain/card";
import { Button } from "@/components/uimain/button";
import { CheckCircle2, Package } from "lucide-react";
import { formatCurrency } from "@/lib/transactionUtils";
import { useCustomerOrders } from "@/hooks/useCustomerOrders";
import { Skeleton } from "@/components/uimain/skeleton";

export default function OrderConfirmation() {
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
        <h1 className="text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your order. We'll send you updates order progresses.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Order Number</p>
            <p className="text-2xl font-bold">{order.order_number}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Amount</p>
              <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment Method</p>
              <p className="font-semibold capitalize">{order.payment_method.replace('_', ' ')}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Delivery Address</p>
            <p className="text-sm">{order.shipping_address}</p>
            <p className="text-sm">{order.shipping_city}, {order.shipping_state}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button asChild className="flex-1">
          <Link to={`/orders/${order.id}`}>
            <Package className="mr-2 h-4 w-4" />
            Track Order
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
