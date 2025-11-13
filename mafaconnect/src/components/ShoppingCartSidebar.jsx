import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Minus, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/transactionUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SwipeToDelete } from "@/components/ui/swipe-to-delete";

export function ShoppingCartSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, itemCount, cartTotal, updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (itemId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty > 0) {
      updateQuantity({ itemId, quantity: newQty });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Shopping Cart</span>
            {itemCount > 0 && (
              <Badge variant="secondary">{itemCount} items</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {!cart || cart.items?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Start adding products to your cart
            </p>
            <Button asChild onClick={() => setIsOpen(false)}>
              <Link to="/shop">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-8rem)]">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                {cart.items.map((item) => (
                  <SwipeToDelete
                    key={item.id}
                    onDelete={() => removeFromCart(item.id)}
                    deleteThreshold={80}
                    deleteIcon={<Trash2 className="h-4 w-4" />}
                  >
                    <div className="flex gap-4 border-b pb-4 bg-background">
                      <div className="w-16 h-16 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          {item.product?.name?.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                          {item.product?.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {formatCurrency(item.product?.sale_price || 0)}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 border rounded">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                              disabled={item.quantity >= (item.product?.stock_qty || 0)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency((item.product?.sale_price || 0) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </SwipeToDelete>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="grid gap-2">
                <Button asChild size="lg" onClick={() => setIsOpen(false)}>
                  <Link to="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link to="/cart">View Cart</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
