import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export function useCart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch cart with items
  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get or create cart
      let { data: cartData, error: cartError } = await supabase
        .from("carts")
        .select("*")
        .eq("customer_id", user.id)
        .single();

      if (cartError && cartError.code === "PGRST116") {
        // Cart doesn't exist, create it
        const { data: newCart, error: createError } = await supabase
          .from("carts")
          .insert({ customer_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        cartData = newCart;
      } else if (cartError) {
        throw cartError;
      }

      // Fetch cart items with product details
      const { data: items, error: itemsError } = await supabase
        .from("cart_items")
        .select(`
          *,
          product:products (
            id,
            name,
            sku,
            sale_price,
            stock_qty,
            active
          )
        `)
        .eq("cart_id", cartData.id);

      if (itemsError) throw itemsError;

      return {
        ...cartData,
        items: items || [],
      };
    },
    enabled: !!user,
  });

  // Calculate cart totals
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cart?.items?.reduce(
    (sum, item) => sum + (item.product?.sale_price || 0) * item.quantity,
    0
  ) || 0;

  // Add to cart mutation
  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity }: { productId; quantity: number }) => {
      if (!user || !cart) throw new Error("No user or cart found");

      // Check if item already exists
      const existingItem = cart.items.find((item) => item.product_id === productId);

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from("cart_items")
          .insert({
            cart_id: cart.id,
            product_id: productId,
            quantity,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding to cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update quantity mutation
  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId; quantity: number }) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", itemId);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove from cart mutation
  const removeFromCart = useMutation({
    mutationFn: async (itemId) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast({
        title: "Removed from cart",
        description: "Product has been removed from your cart.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error removing item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Clear cart mutation
  const clearCart = useMutation({
    mutationFn: async () => {
      if (!cart) throw new Error("No cart found");

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cart.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      // Invalidate products and locations to refresh stock
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-locations"] });
    },
    onError: (error) => {
      toast({
        title: "Error clearing cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    cart,
    itemCount,
    cartTotal,
    isLoading,
    addToCart: addToCart.mutate,
    updateQuantity: updateQuantity.mutate,
    removeFromCart: removeFromCart.mutate,
    clearCart: clearCart.mutate,
    isAddingToCart: addToCart.isPending,
  };
}
