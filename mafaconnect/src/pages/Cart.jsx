import { Link } from "react-router-dom";
import { Button } from "@/components/uimain/button";
import { Card, CardContent } from "@/components/uimain/card";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/transactionUtils";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { SwipeToDelete } from "@/components/uimain/swipe-to-delete";

export default function Cart() {
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { getSetting } = useStoreSettings();

  const taxRate = getSetting("tax_rate")?.value || 0;
  const shippingFee = getSetting("shipping_fee");
  const freeShippingThreshold = shippingFee?.free_threshold || 50000;
  const shippingCost =
    cartTotal >= freeShippingThreshold ? 0 : shippingFee?.value || 0;

  const taxAmount = (cartTotal * taxRate) / 100;
  const total = cartTotal + taxAmount + shippingCost;

  const handleQuantityChange = (itemId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty > 0) {
      updateQuantity({ itemId, quantity: newQty });
    }
  };

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShoppingCart className="h-24 w-24 text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">
          Start adding products to your cart to continue shopping
        </p>
        <Button asChild size="lg">
          <Link to="/shop">
            Browse Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 pb-24 sm:pb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {cart.items.length} item{cart.items.length !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <SwipeToDelete
              key={item.id}
              onDelete={() => removeFromCart(item.id)}
              deleteText="Remove"
              deleteIcon={<Trash2 className="h-5 w-5" />}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-24 h-24 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">
                        {item.product?.name?.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h3 className="font-semibold mb-1">{item.product?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            SKU: {item.product?.sku}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-11 w-11"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11"
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11"
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            disabled={item.quantity >= (item.product?.stock_qty || 0)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.product?.sale_price || 0)} each
                          </p>
                          <p className="font-bold">
                            {formatCurrency(
                              (item.product?.sale_price || 0) * item.quantity
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SwipeToDelete>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-4">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Order Summary</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tax ({taxRate}% VAT)
                  </span>
                  <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-primary">Free</span>
                    ) : (
                      formatCurrency(shippingCost)
                    )}
                  </span>
                </div>
                {cartTotal < freeShippingThreshold && shippingCost > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add {formatCurrency(freeShippingThreshold - cartTotal)} more for free
                    shipping
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Button asChild size="lg" className="w-full h-12">
                <Link to="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button variant="outline" asChild size="lg" className="w-full h-12">
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
