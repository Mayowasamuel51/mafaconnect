import React from "react";
import { useProducts } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

export function LowStockAlert() {
  const { products } = useProducts();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!products) return;

    const lowStockProducts = products.filter(
      p => p.stock_qty <= p.reorder_level && p.active
    );

    if (lowStockProducts.length > 0) {
      toast({
        title: "Low Stock Alert",
        description: `${lowStockProducts.length} product(s) need restocking`,
        variant: "destructive",
        action: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
          </div>
        ),
      });
    }
  }, [products, toast]);

  return null;
}
