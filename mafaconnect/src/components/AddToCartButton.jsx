import { useState } from "react";
import { Button } from "@/components/uimain/button";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";



export function AddToCartButton({
  productId,
  stockQty,
  defaultQuantity = 1,
  variant = "default",
  size = "default",
  className,
}: AddToCartButtonProps) {
  const { addToCart, isAddingToCart } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = () => {
    if (stockQty < defaultQuantity) {
      return;
    }

    addToCart({ productId, quantity: defaultQuantity });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const isOutOfStock = stockQty === 0;

  if (isOutOfStock) {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        Out of Stock
      </Button>
    );
  }

  if (showSuccess) {
    return (
      <Button variant="default" size={size} disabled className={cn("gap-2", className)}>
        <Check className="h-4 w-4" />
        Added
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAddToCart}
      disabled={isAddingToCart}
      className={cn("gap-2", className)}
    >
      <ShoppingCart className="h-4 w-4" />
      Add to Cart
    </Button>
  );
}
