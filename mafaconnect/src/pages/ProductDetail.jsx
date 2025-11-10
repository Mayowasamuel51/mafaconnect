import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/uimain/button";
import { Badge } from "@/components/uimain/Badge";
import { Card, CardContent } from "@/components/uimain/card";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatCurrency } from "@/lib/transactionUtils";
import { ArrowLeft, Package } from "lucide-react";
import { Skeleton } from "@/components/uimain/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hookss/useAuth";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isStaff } = useAuth();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (isStaff) {
          // Staff can see full product details including cost_price
          const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("id", id)
            .maybeSingle();

          if (error) throw error;
          setProduct(data);
        } else {
          // Non-staff users get products without cost_price
          const { data, error } = await supabase
            .rpc("get_public_products");

          if (error) throw error;
          const productData = data?.find((p) => p.id === id);
          setProduct(productData);
        }
      } catch (error) {
        toast({
          title: "Error loading product",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, isStaff, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/shop">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const isLowStock = product.stock_qty > 0 && product.stock_qty <= 10;
  const isOutOfStock = product.stock_qty === 0;

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/shop">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shop
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
          <div className="text-6xl font-bold text-muted-foreground">
            {product.name.substring(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">
              {formatCurrency(product.sale_price)}
            </span>
            {isLowStock && (
              <Badge variant="destructive">Only {product.stock_qty} left!</Badge>
            )}
            {isOutOfStock && <Badge variant="outline">Out of Stock</Badge>}
            {!isLowStock && !isOutOfStock && (
              <Badge variant="default">In Stock ({product.stock_qty})</Badge>
            )}
          </div>

          {product.description && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Product Details</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">SKU</dt>
                  <dd className="font-medium">{product.sku}</dd>
                </div>
                {isStaff && product.cost_price !== undefined && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Cost Price</dt>
                    <dd className="font-medium">{formatCurrency(product.cost_price)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sale Price</dt>
                  <dd className="font-medium">{formatCurrency(product.sale_price)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Stock Quantity</dt>
                  <dd className="font-medium">{product.stock_qty} units</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Reorder Level</dt>
                  <dd className="font-medium">{product.reorder_level} units</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <div className="flex items-center gap-2 border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}
                disabled={quantity >= product.stock_qty}
              >
                +
              </Button>
            </div>
            <AddToCartButton
              productId={product.id}
              stockQty={product.stock_qty}
              defaultQuantity={quantity}
              size="lg"
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
