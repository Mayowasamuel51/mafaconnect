import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ProductDialog({ open, onOpenChange }) {
  const { createProduct } = useProducts();

  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    cost_price: "",
    sale_price: "",
    stock_qty: "",
    reorder_level: "50",
    image: null,
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleChange("image", file);
    setPreview(URL.createObjectURL(file));
  };

  const validateFields = () => {
    if (!formData.name.trim()) return "Product name is required.";
    if (!formData.sku.trim()) return "SKU is required.";
    if (!formData.cost_price) return "Cost price is required.";
    if (!formData.sale_price) return "Sale price is required.";
    if (!formData.stock_qty) return "Stock quantity is required.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    const error = validateFields();
    if (error) {
      setFormError(error);
      return;
    }

    try {
      await createProduct.mutateAsync({
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        description: formData.description || "",
        cost_price: Number(formData.cost_price),
        sale_price: Number(formData.sale_price),
        stock_qty: Number(formData.stock_qty),
        reorder_level: Number(formData.reorder_level),
        image: formData.image,
      });

      setSuccessMsg("Product added successfully!");
      setTimeout(() => onOpenChange(false), 1200);

      // Reset form
      setFormData({
        name: "",
        sku: "",
        description: "",
        cost_price: "",
        sale_price: "",
        stock_qty: "",
        reorder_level: "50",
        image: null,
      });
      setPreview(null);

    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-4">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        {/* ERROR MESSAGE */}
        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {/* SUCCESS MESSAGE */}
        {successMsg && (
          <Alert className="bg-green-500/10 border-green-500 text-green-700">
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* IMAGE UPLOAD */}
          <div className="flex items-center gap-3">
            {preview ? (
              <img src={preview} className="h-16 w-16 rounded border object-cover" />
            ) : (
              <div className="h-16 w-16 bg-muted rounded flex items-center justify-center text-xs">
                No Image
              </div>
            )}

            <div className="flex-1">
              <Label>Upload Image</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>
          </div>

          {/* Name */}
          <div>
            <Label>Product Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* SKU */}
          <div>
            <Label>SKU *</Label>
            <Input
              value={formData.sku}
              onChange={(e) => handleChange("sku", e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cost Price *</Label>
              <Input
                type="number"
                value={formData.cost_price}
                onChange={(e) => handleChange("cost_price", e.target.value)}
              />
            </div>

            <div>
              <Label>Sale Price *</Label>
              <Input
                type="number"
                value={formData.sale_price}
                onChange={(e) => handleChange("sale_price", e.target.value)}
              />
            </div>
          </div>

          {/* Stock & reorder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Stock Qty *</Label>
              <Input
                type="number"
                value={formData.stock_qty}
                onChange={(e) => handleChange("stock_qty", e.target.value)}
              />
            </div>

            <div>
              <Label>Reorder Level</Label>
              <Input
                type="number"
                value={formData.reorder_level}
                onChange={(e) => handleChange("reorder_level", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={createProduct.isPending}>
              {createProduct.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// import React, { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Label } from "@/components/ui/Label";
// import { Textarea } from "@/components/ui/textarea";
// import { Loader2 } from "lucide-react";
// import { useProducts } from "@/hooks/useProducts";

// export function ProductDialog({ open, onOpenChange }) {
//   const { createProduct } = useProducts();

//   const [formData, setFormData] = useState({
//     name: "",
//     sku: "",
//     description: "",
//     cost_price: "",
//     sale_price: "",
//     stock_qty: "",
//     reorder_level: "50",
//     image: null,
//   });

//   const [preview, setPreview] = useState(null);

//   const handleChange = (field, value) =>
//     setFormData((prev) => ({ ...prev, [field]: value }));

//   const handleImageUpload = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     handleChange("image", file);
//     setPreview(URL.createObjectURL(file));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     await createProduct.mutateAsync({
//       name: formData.name.trim(),
//       sku: formData.sku.trim(),
//       description: formData.description || "",
//       cost_price: Number(formData.cost_price),
//       sale_price: Number(formData.sale_price),
//       stock_qty: Number(formData.stock_qty),
//       reorder_level: Number(formData.reorder_level),
//       image: formData.image,
//     });

//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[420px] p-4">
//         <DialogHeader>
//           <DialogTitle>Add New Product</DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-3">

//           {/* IMAGE UPLOAD */}
//           <div className="flex items-center gap-3">
//             {preview ? (
//               <img
//                 src={preview}
//                 className="h-16 w-16 rounded border object-cover"
//               />
//             ) : (
//               <div className="h-16 w-16 bg-muted rounded flex items-center justify-center text-xs">
//                 No Image
//               </div>
//             )}

//             <div className="flex-1">
//               <Label>Upload Image</Label>
//               <Input type="file" accept="image/*"  onChange={handleImageUpload} />
//             </div>
//           </div>

//           {/* Product Name */}
//           <div>
//             <Label>Product Name *</Label>
//             <Input
//               value={formData.name}
//               onChange={(e) => handleChange("name", e.target.value)}
//               required
//             />
//           </div>

//           {/* SKU */}
//           <div>
//             <Label>SKU *</Label>
//             <Input
//               value={formData.sku}
//               onChange={(e) => handleChange("sku", e.target.value)}
//               required
//             />
//           </div>

//           {/* Description */}
//           <div>
//             <Label>Description</Label>
//             <Textarea
//               rows={2}
//               value={formData.description}
//               onChange={(e) => handleChange("description", e.target.value)}
//             />
//           </div>

//           {/* Prices */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <Label>Cost Price</Label>
//               <Input
//                 type="number"
//                 value={formData.cost_price}
//                 onChange={(e) => handleChange("cost_price", e.target.value)}
//                 required
//               />
//             </div>

//             <div>
//               <Label>Sale Price</Label>
//               <Input
//                 type="number"
//                 value={formData.sale_price}
//                 onChange={(e) => handleChange("sale_price", e.target.value)}
//                 required
//               />
//             </div>
//           </div>

//           {/* Stock + Reorder */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <Label>Stock Qty *</Label>
//               <Input
//                 type="number"
//                 value={formData.stock_qty}
//                 onChange={(e) => handleChange("stock_qty", e.target.value)}
//                 required
//               />
//             </div>

//             <div>
//               <Label>Reorder Level</Label>
//               <Input
//                 type="number"
//                 value={formData.reorder_level}
//                 onChange={(e) => handleChange("reorder_level", e.target.value)}
//               />
//             </div>
//           </div>

//           <div className="flex justify-end gap-2 pt-2">
//             <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>

//             <Button type="submit" disabled={createProduct.isPending}>
//               {createProduct.isPending && (
//                 <Loader2 className="h-4 w-4 animate-spin mr-2" />
//               )}
//               Add
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }


























// import React, { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Label } from "@/components/ui/Label";
// import { Textarea } from "@/components/ui/textarea";
// import { Loader2 } from "lucide-react";
// import { useProducts } from "@/hooks/useProducts";

// export function ProductDialog({ open, onOpenChange }) {
//   const { createProduct } = useProducts();

//   const [formData, setFormData] = useState({
//     name: "",
//     sku: "",
//     description: "",
//     cost_price: "",
//     sale_price: "",
//     stock_qty: "",
//     reorder_level: "50",
//     image: null,
//   });

//   const [preview, setPreview] = useState(null);

//   const handleChange = (field, value) =>
//     setFormData((prev) => ({ ...prev, [field]: value }));

//   const handleImageUpload = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     handleChange("image", file);
//     setPreview(URL.createObjectURL(file));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     await createProduct.mutateAsync({
//       ...formData,
//       cost_price: Number(formData.cost_price),
//       sale_price: Number(formData.sale_price),
//       stock_qty: Number(formData.stock_qty),
//       reorder_level: Number(formData.reorder_level),
//       active: true,
//     });

//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[420px] p-4">
//         <DialogHeader>
//           <DialogTitle>Add New Product</DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-3">

//           {/* IMAGE UPLOAD (small + compact) */}
//           <div className="flex items-center gap-3">
//             {preview ? (
//               <img
//                 src={preview}
//                 className="h-16 w-16 rounded border object-cover"
//               />
//             ) : (
//               <div className="h-16 w-16 bg-muted rounded flex items-center justify-center text-xs">
//                 No Image
//               </div>
//             )}

//             <div className="flex-1">
//               <Label>Upload Image</Label>
//               <Input type="file" accept="image/*" onChange={handleImageUpload} />
//             </div>
//           </div>

//           <div className="space-y-1">
//             <Label>Product Name *</Label>
//             <Input
//               value={formData.name}
//               onChange={(e) => handleChange("name", e.target.value)}
//               required
//             />
//           </div>

//           <div className="space-y-1">
//             <Label>SKU *</Label>
//             <Input
//               value={formData.sku}
//               onChange={(e) => handleChange("sku", e.target.value)}
//               required
//             />
//           </div>

//           <div className="space-y-1">
//             <Label>Description</Label>
//             <Textarea
//               rows={2}
//               value={formData.description}
//               onChange={(e) => handleChange("description", e.target.value)}
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-1">
//               <Label>Cost Price</Label>
//               <Input
//                 type="number"
//                 value={formData.cost_price}
//                 onChange={(e) => handleChange("cost_price", e.target.value)}
//                 required
//               />
//             </div>
//             <div className="space-y-1">
//               <Label>Sale Price</Label>
//               <Input
//                 type="number"
//                 value={formData.sale_price}
//                 onChange={(e) => handleChange("sale_price", e.target.value)}
//                 required
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-1">
//               <Label>Stock Qty *</Label>
//               <Input
//                 type="number"
//                 value={formData.stock_qty}
//                 onChange={(e) => handleChange("stock_qty", e.target.value)}
//                 required
//               />
//             </div>
//             <div className="space-y-1">
//               <Label>Reorder Level</Label>
//               <Input
//                 type="number"
//                 value={formData.reorder_level}
//                 onChange={(e) => handleChange("reorder_level", e.target.value)}
//               />
//             </div>
//           </div>

//           <div className="flex justify-end gap-2 pt-2">
//             <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={createProduct.isPending}>
//               {createProduct.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
//               Add
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }



// import React, { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Label } from "@/components/ui/Label";
// import { Textarea } from "@/components/ui/textarea";
// import { Loader2 } from "lucide-react";
// import { useProducts } from "@/hooks/useProducts";

// export function ProductDialog({ open, onOpenChange }) {
//   const { createProduct } = useProducts();

//   const [formData, setFormData] = useState({
//     name: "",
//     sku: "",
//     description: "",
//     cost_price: "",
//     sale_price: "",
//     stock_qty: "",
//     reorder_level: "50",
//   });

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     await createProduct.mutateAsync({
//       name: formData.name.trim(),
//       sku: formData.sku.trim(),
//       description: formData.description || null,
//       cost_price: parseFloat(formData.cost_price),
//       sale_price: parseFloat(formData.sale_price),
//       stock_qty: parseInt(formData.stock_qty),
//       reorder_level: parseInt(formData.reorder_level),
//       active: true,
//     });

//     setFormData({
//       name: "",
//       sku: "",
//       description: "",
//       cost_price: "",
//       sale_price: "",
//       stock_qty: "",
//       reorder_level: "50",
//     });

//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[500px]">
//         <DialogHeader>
//           <DialogTitle>Add New Product</DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Product Name */}
//           <div className="space-y-2">
//             <Label htmlFor="name">Product Name *</Label>
//             <Input
//               id="name"
//               value={formData.name}
//               onChange={(e) => handleChange("name", e.target.value)}
//               required
//             />
//           </div>

//           {/* SKU */}
//           <div className="space-y-2">
//             <Label htmlFor="sku">SKU *</Label>
//             <Input
//               id="sku"
//               value={formData.sku}
//               onChange={(e) => handleChange("sku", e.target.value)}
//               required
//             />
//           </div>

//           {/* Description */}
//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               value={formData.description}
//               onChange={(e) => handleChange("description", e.target.value)}
//             />
//           </div>

//           {/* Prices */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="cost_price">Cost Price (₦) *</Label>
//               <Input
//                 id="cost_price"
//                 type="number"
//                 step="0.01"
//                 value={formData.cost_price}
//                 onChange={(e) => handleChange("cost_price", e.target.value)}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="sale_price">Sale Price (₦) *</Label>
//               <Input
//                 id="sale_price"
//                 type="number"
//                 step="0.01"
//                 value={formData.sale_price}
//                 onChange={(e) => handleChange("sale_price", e.target.value)}
//                 required
//               />
//             </div>
//           </div>

//           {/* Stock and Reorder Level */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="stock_qty">Stock Quantity *</Label>
//               <Input
//                 id="stock_qty"
//                 type="number"
//                 value={formData.stock_qty}
//                 onChange={(e) => handleChange("stock_qty", e.target.value)}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="reorder_level">Reorder Level</Label>
//               <Input
//                 id="reorder_level"
//                 type="number"
//                 value={formData.reorder_level}
//                 onChange={(e) => handleChange("reorder_level", e.target.value)}
//               />
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex gap-3 justify-end pt-4">
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={createProduct.isPending}>
//               {createProduct.isPending && (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               )}
//               Add Product
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
