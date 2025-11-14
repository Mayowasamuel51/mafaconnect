import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Plus, Search, Receipt, Loader2, X } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { useProducts } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";
import { useLocations } from "@/hooks/useLocations";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Sales() {
  const isMobile = useIsMobile();
  const { sales, isLoading, createSale } = useSales();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { locations } = useLocations();

  const [showNewSale, setShowNewSale] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Add a product to cart
  const handleAddProduct = () => {
    if (!currentProduct) return;
    const product = products?.find((p) => p.id === currentProduct);
    if (!product) return;

    setSelectedProducts((prev) => [
      ...prev,
      {
        product_id: currentProduct,
        quantity: currentQuantity,
        unit_price: Number(product.sale_price),
      },
    ]);
    setCurrentProduct("");
    setCurrentQuantity(1);
  };

  // 🔹 Remove a product from cart
  const handleRemoveProduct = (index) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  // 🔹 Calculate subtotal
  const subtotal = selectedProducts.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  // 🔹 Create new sale via API
  const handleCreateSale = async () => {
    if (selectedProducts.length === 0 || !paymentMethod) return;

    await createSale.mutateAsync({
      customer_id: customerId || undefined,
      location_id: locationId || undefined,
      items: selectedProducts,
      payment_method: paymentMethod,
      discount_amount: discount,
    });

    setShowNewSale(false);
    setCustomerId("");
    setLocationId("");
    setPaymentMethod("");
    setSelectedProducts([]);
    setDiscount(0);
  };

  // 🔹 Search & filter sales
  const filteredSales = sales?.filter((sale) => {
    const customer = sale.customers;
    const query = searchQuery.toLowerCase();
    return (
      customer?.name?.toLowerCase().includes(query) ||
      sale.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">Sales</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create new transactions and view sales history
          </p>
        </div>
        <Button
          onClick={() => setShowNewSale(!showNewSale)}
          className="bg-gradient-primary shadow-md hover:shadow-lg transition-all h-11 w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      {/* 🧾 New Sale (Desktop) */}
      {showNewSale && !isMobile && (
        <Card className="shadow-elevated border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>New Sale Transaction</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowNewSale(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6">
              {/* Customer / Location / Payment */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Customer (Optional)</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Walk-in customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location (Optional)</Label>
                  <Select value={locationId} onValueChange={setLocationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations
                        ?.filter((l) => l.active)
                        .map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                            {l.state && ` - ${l.state}`}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Add Products */}
              <div className="space-y-4">
                <Label>Add Products</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <Select value={currentProduct} onValueChange={setCurrentProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} - ₦{Number(p.sale_price).toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                    min="1"
                  />
                </div>
                <Button onClick={handleAddProduct} variant="outline" className="w-full">
                  Add to Cart
                </Button>
              </div>

              {/* Cart */}
              {selectedProducts.length > 0 && (
                <div className="space-y-2">
                  <Label>Cart Items</Label>
                  <div className="space-y-2 p-4 bg-secondary/50 rounded-lg">
                    {selectedProducts.map((item, i) => {
                      const product = products?.find((p) => p.id === item.product_id);
                      return (
                        <div key={i} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{product?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} × ₦{item.unit_price.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-semibold">
                              ₦{(item.quantity * item.unit_price).toLocaleString()}
                            </p>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveProduct(i)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Discount + Total */}
              <div className="space-y-2">
                <Label>Discount Amount (₦)</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  min="0"
                />
              </div>

              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                <p className="text-lg font-semibold">Total:</p>
                <div className="text-right">
                  {discount > 0 && (
                    <p className="text-sm text-muted-foreground line-through">
                      ₦{subtotal.toLocaleString()}
                    </p>
                  )}
                  <p className="text-2xl font-bold">
                    ₦{(subtotal - discount).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowNewSale(false)} className="h-11">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSale}
                  disabled={
                    selectedProducts.length === 0 ||
                    !paymentMethod ||
                    createSale.isPending
                  }
                  className="bg-gradient-primary h-11"
                >
                  {createSale.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Complete Sale
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🧾 Sales History */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl">Sales History</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-10 h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredSales && filteredSales.length > 0 ? (
            <div className="space-y-4">
              {filteredSales.map((sale) => {
                const customer = sale.customers;
                const saleItems = sale.sale_items;
                return (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-gradient-primary">
                        <Receipt className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {sale.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customer?.name || "Walk-in"} • {saleItems?.length || 0} items
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(sale.created_at), "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-foreground">
                        ₦{Number(sale.total_amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {sale.payment_method}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No sales found matching your search."
                : "No sales yet. Create your first sale!"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
