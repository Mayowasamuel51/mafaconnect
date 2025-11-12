import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/uimain/card";
import { Badge } from "@/components/uimain/Badge";
import { AddToCartButton } from "./AddToCartButton";
import { formatCurrency } from "@/lib/transactionUtils";

;
}

export function ProductCard({ product }: ProductCardProps) {
  const isLowStock = product.stock_qty > 0 && product.stock_qty <= 10;
  const isOutOfStock = product.stock_qty === 0;

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square bg-muted flex items-center justify-center rounded-t-lg overflow-hidden">
          <div className="text-muted-foreground text-sm">
            {product.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </Link>
      <CardContent className="p-3 sm:p-4">
        <Link to={`/products/${product.id}`} className="hover:underline">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1">{product.name}</h3>
        </Link>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2">SKU: {product.sku}</p>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <span className="text-base sm:text-lg font-bold">{formatCurrency(product.sale_price)}</span>
          {isLowStock && (
            <Badge variant="destructive" className="text-xs">
              Low Stock
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="outline" className="text-xs">
              Out of Stock
            </Badge>
          )}
          {!isLowStock && !isOutOfStock && (
            <Badge variant="default" className="text-xs">
              In Stock ({product.stock_qty})
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0">
        <AddToCartButton
          productId={product.id}
          stockQty={product.stock_qty}
          className="w-full h-10 sm:h-11 text-sm sm:text-base"
        />
      </CardFooter>
    </Card>
  );
}
