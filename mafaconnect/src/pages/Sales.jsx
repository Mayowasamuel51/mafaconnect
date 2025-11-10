import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/uimain/card";
import { Button } from "@/components/uimain/button";
import { Input } from "@/components/uimain/Input";
import { Label } from "@/components/uimain/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/uimain/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/uimain/drawer";
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
  
  const [showNewSale, setShowNewSale] = React.useState(false);
  const [customerId, setCustomerId] = React.useState("");
  const [locationId, setLocationId] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("");
  const [selectedProducts, setSelectedProducts] = React.useState<Array<{
    product_id;
    quantity;
    unit_price;
  }>>([]);
  const [currentProduct, setCurrentProduct] = React.useState("");
  const [currentQuantity, setCurrentQuantity] = React.useState(1);
  const [discount, setDiscount] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleAddProduct = () => {
    if (!currentProduct) return;
    
    const product = products?.find(p => p.id === currentProduct);
    if (!product) return;

    setSelectedProducts([
      ...selectedProducts,
      {
        product_id: currentProduct,
        quantity: currentQuantity,
        unit_price: Number(product.sale_price),
      },
    ]);
    setCurrentProduct("");
    setCurrentQuantity(1);
  };

  const handleRemoveProduct = (index) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const subtotal = selectedProducts.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const handleCreateSale = async () => {
    if (selectedProducts.length === 0) return;
    if (!paymentMethod) return;

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

  const filteredSales = sales?.filter(sale => {
    const customer = sale.customers;
    const searchLower = searchQuery.toLowerCase();
    return (
      customer?.name?.toLowerCase().includes(searchLower) ||
      sale.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-8 p-4 sm:p-6">
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

      {/* New Sale Form - Desktop Card */}
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
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Customer (Optional)</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Walk-in customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
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
                      {locations?.filter(loc => loc.active).map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                          {location.state && ` - ${location.state}`}
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

              <div className="space-y-4">
                <Label>Add Products</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <Select value={currentProduct} onValueChange={setCurrentProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ₦{Number(product.sale_price).toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={currentQuantity}
                      onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                </div>
                <Button onClick={handleAddProduct} variant="outline" className="w-full">
                  Add to Cart
                </Button>
              </div>

              {selectedProducts.length > 0 && (
                <div className="space-y-2">
                  <Label>Cart Items</Label>
                  <div className="space-y-2 p-4 bg-secondary/50 rounded-lg">
                    {selectedProducts.map((item, index) => {
                      const product = products?.find(p => p.id === item.product_id);
                      return (
                        <div key={index} className="flex justify-between items-center">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveProduct(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
                <Button
                  variant="outline"
                  onClick={() => setShowNewSale(false)}
                  className="h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSale}
                  disabled={selectedProducts.length === 0 || !paymentMethod || createSale.isPending}
                  className="bg-gradient-primary h-11"
                >
                  {createSale.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Sale
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Sale Form - Mobile Drawer */}
      <Drawer open={showNewSale && isMobile} onOpenChange={setShowNewSale}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>New Sale Transaction</DrawerTitle>
            <DrawerDescription>Create a new sale and add products</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4">
            <div className="grid gap-6 pb-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Customer (Optional)</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Walk-in customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location (Optional)</Label>
                  <Select value={locationId} onValueChange={setLocationId}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations?.filter(loc => loc.active).map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                          {location.state && ` - ${location.state}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="h-11">
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

              <div className="space-y-4">
                <Label>Add Products</Label>
                <div className="space-y-3">
                  <Select value={currentProduct} onValueChange={setCurrentProduct}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ₦{Number(product.sale_price).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                    min="1"
                    className="h-11"
                  />
                </div>
                <Button onClick={handleAddProduct} variant="outline" className="w-full h-11">
                  Add to Cart
                </Button>
              </div>

              {selectedProducts.length > 0 && (
                <div className="space-y-2">
                  <Label>Cart Items</Label>
                  <div className="space-y-2 p-4 bg-secondary/50 rounded-lg">
                    {selectedProducts.map((item, index) => {
                      const product = products?.find(p => p.id === item.product_id);
                      return (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{product?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} × ₦{item.unit_price.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-semibold text-sm">
                              ₦{(item.quantity * item.unit_price).toLocaleString()}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveProduct(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Discount Amount (₦)</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  min="0"
                  className="h-11"
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
            </div>
          </div>
          <DrawerFooter className="pt-2">
            <Button
              onClick={handleCreateSale}
              disabled={selectedProducts.length === 0 || !paymentMethod || createSale.isPending}
              className="bg-gradient-primary h-12 w-full"
            >
              {createSale.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Sale
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="h-12">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

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
              {searchQuery ? "No sales found matching your search." : "No sales yet. Create your first sale!"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
