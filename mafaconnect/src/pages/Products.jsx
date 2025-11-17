import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Search, Package } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { ProductDialog } from "@/components/ProductDialog";

export default function Products() {
  const { products, isLoading } = useProducts();
  const { isStaff } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
console.log(products)
  // ============================
  //   SEARCH LOGIC
  // ============================
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery.trim()) return products;

    return products.filter((p) =>
      (p.name + p.sku)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    
  }, [products, searchQuery]);

  return (
    <div className="p-4 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>

        {isStaff && (
          <Button onClick={() => setShowDialog(true)}>
            Add Product
          </Button>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* PRODUCT LIST */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No matching products found
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded overflow-hidden border">
                    {p.images?.length > 0 ? (
                      <img
                        src={p.images[0].image_url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">SKU: {p.sku}</p>

                    {isStaff && (
                      <p className="text-sm mt-1 font-semibold">
                        ₦{Number(p.sale_price).toLocaleString()}
                      </p>
                    )}

                    {!isStaff && p.stock_qty > 0 && (
                      <Badge className="bg-success/10 text-success">Available</Badge>
                    )}

                    {!isStaff && p.stock_qty === 0 && (
                      <Badge className="bg-destructive/10 text-destructive">Out of Stock</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PRODUCT DIALOG */}
      <ProductDialog open={showDialog} onOpenChange={setShowDialog} />
    </div>
  );
}


// import React, { useState, useMemo } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Package, Search, Plus, AlertCircle, Loader2, MapPin } from "lucide-react";
// import { Badge } from "@/components/ui/Badge";
// import { useProducts } from "@/hooks/useProducts";
// import { useAuth } from "@/hooks/useAuth";
// import { ProductDialog } from "@/components/ProductDialog";
// import { ProductLocationStockDialog } from "@/components/ProductLocationStockDialog";

// export default function Products() {
//   const { products, isLoading } = useProducts();
//   const { isStaff } = useAuth();

//   const [showDialog, setShowDialog] = useState(false);
//   const [showLocationDialog, setShowLocationDialog] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");

//   // 🔹 Filter products by search term
//   const filteredProducts = useMemo(() => {
//     if (!products) return [];
//     return products.filter(
//       (p) =>
//         p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [products, searchQuery]);

//   // 🔹 Loading state
//   // if (isLoading) {
//   //   return (
//   //     <div className="flex items-center justify-center h-64">
//   //       <Loader2 className="h-12 w-12 animate-spin text-primary" />
//   //     </div>
//   //   );
//   // }

//   return (
//     <div className="space-y-4 sm:space-y-8 p-4 sm:p-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">
//             {isStaff ? "Products" : "Product Catalog"}
//           </h1>
//           <p className="text-sm sm:text-base text-muted-foreground">
//             {isStaff
//               ? "Manage your inventory and product catalog"
//               : "Browse our available products"}
//           </p>
//         </div>

//         {isStaff && (
//           <Button
//             onClick={() => setShowDialog(true)}
//             className="bg-gradient-primary shadow-md hover:shadow-lg transition-all h-11 w-full sm:w-auto"
//           >
//             <Plus className="mr-2 h-4 w-4" />
//             Add Product
//           </Button>
//         )}
//       </div>

//       {/* Product creation dialog */}
//       {isStaff && <ProductDialog open={showDialog} onOpenChange={setShowDialog} />}

//       {/* Product List */}
//       <Card className="shadow-card">
//         <CardHeader>
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//             <CardTitle className="text-lg sm:text-xl">
//               {isStaff ? "Product Inventory" : "Available Products"}
//             </CardTitle>

//             <div className="relative w-full sm:w-64">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search products..."
//                 className="pl-10 h-11"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent>
//           {filteredProducts?.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               No products found.
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {filteredProducts.map((product) => (
//                 <div
//                   key={product.id}
//                   className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
//                 >
//                   <div className="flex items-center gap-4 flex-1">
//                     <div className="p-3 rounded-lg bg-gradient-primary">
//                       <Package className="h-5 w-5 text-primary-foreground" />
//                     </div>

//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-1">
//                         <p className="font-semibold text-foreground">
//                           {product.name}
//                         </p>

//                         {isStaff && product.stock_qty <= product.reorder_level && (
//                           <Badge
//                             variant="outline"
//                             className="bg-warning/10 text-warning border-warning/20"
//                           >
//                             <AlertCircle className="h-3 w-3 mr-1" />
//                             Low Stock
//                           </Badge>
//                         )}
//                       </div>

//                       {product.description && (
//                         <p className="text-sm text-muted-foreground mb-1">
//                           {product.description}
//                         </p>
//                       )}
//                       <p className="text-sm text-muted-foreground">
//                         SKU: {product.sku}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Product Stats */}
//                   <div
//                     className={`grid ${
//                       isStaff ? "grid-cols-3" : "grid-cols-1"
//                     } gap-8 text-right`}
//                   >
//                     {isStaff && (
//                       <div>
//                         <p className="text-xs text-muted-foreground mb-1">
//                           Stock
//                         </p>
//                         <p className="font-semibold text-foreground">
//                           {product.stock_qty} units
//                         </p>
//                       </div>
//                     )}

//                     <div>
//                       <p className="text-xs text-muted-foreground mb-1">Price</p>
//                       <p className="font-semibold text-foreground">
//                         ₦{Number(product.sale_price).toLocaleString()}
//                       </p>
//                     </div>

//                     {isStaff && product.cost_price && (
//                       <div>
//                         <p className="text-xs text-muted-foreground mb-1">
//                           Margin
//                         </p>
//                         <p className="font-semibold text-success">
//                           {Math.round(
//                             ((Number(product.sale_price) -
//                               Number(product.cost_price)) /
//                               Number(product.sale_price)) *
//                               100
//                           )}
//                           %
//                         </p>
//                       </div>
//                     )}

//                     {!isStaff && product.stock_qty > 0 && (
//                       <div className="flex items-center justify-end">
//                         <Badge
//                           variant="outline"
//                           className="bg-success/10 text-success"
//                         >
//                           Available
//                         </Badge>
//                       </div>
//                     )}
//                     {!isStaff && product.stock_qty === 0 && (
//                       <div className="flex items-center justify-end">
//                         <Badge
//                           variant="outline"
//                           className="bg-destructive/10 text-destructive"
//                         >
//                           Out of Stock
//                         </Badge>
//                       </div>
//                     )}
//                   </div>

//                   {/* Staff actions */}
//                   {isStaff && (
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => {
//                         setSelectedProduct(product);
//                         setShowLocationDialog(true);
//                       }}
//                       className="sm:ml-4 h-11 w-full sm:w-auto"
//                     >
//                       <MapPin className="h-4 w-4 mr-2" />
//                       Locations
//                     </Button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Stock per Location dialog */}
//       {selectedProduct && (
//         <ProductLocationStockDialog
//           open={showLocationDialog}
//           onOpenChange={setShowLocationDialog}
//           product={selectedProduct}
//         />
//       )}
//     </div>
//   );
// }
