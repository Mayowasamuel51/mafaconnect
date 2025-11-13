import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download, Upload, Database } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";
import { useSales } from "@/hooks/useSales";
import { useToast } from "@/hooks/use-toast";

export default function BulkOperations() {
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { sales } = useSales();
  const { toast } = useToast();

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast({
        title: "No data",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return "";
            if (typeof value === "object") return JSON.stringify(value);
            return `"${value}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date()
      .toISOString()
      .split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `${filename} has been exported successfully.`,
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Export section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download your data in CSV format
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => exportToCSV(products || [], "products")}
          >
            <Database className="h-4 w-4 mr-2" />
            Export Products
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => exportToCSV(customers || [], "customers")}
          >
            <Database className="h-4 w-4 mr-2" />
            Export Customers
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => exportToCSV(sales || [], "sales")}
          >
            <Database className="h-4 w-4 mr-2" />
            Export Sales
          </Button>
        </CardContent>
      </Card>

      {/* Import section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Bulk import data from CSV files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            Import functionality coming soon. You’ll be able to bulk upload
            products, customers, and other data from CSV files.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// import React from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/uimain/Card";
// import { Button } from "@/components/uimain/Button";
// import { Download, Upload, Database } from "lucide-react";
// import { useProducts } from "@/hooks/useProducts";
// import { useCustomers } from "@/hooks/useCustomers";
// import { useSales } from "@/hooks/useSales";
// import { useToast } from "@/hooks/use-toast";

// export default function BulkOperations() {
//   const { products } = useProducts();
//   const { customers } = useCustomers();
//   const { sales } = useSales();
//   const { toast } = useToast();

//   const exportToCSV = (data, filename) => {
//     if (!data || data.length === 0) {
//       toast({
//         title: "No data",
//         description: "No data available to export",
//         variant: "destructive",
//       });
//       return;
//     }

//     const headers = Object.keys(data[0]);
//     const csv = [
//       headers.join(","),
//       ...data.map((row) =>
//         headers
//           .map((header) => {
//             const value = row[header];
//             if (value === null || value === undefined) return "";
//             if (typeof value === "object") return JSON.stringify(value);
//             return `"${value}"`;
//           })
//           .join(",")
//       ),
//     ].join("\n");

//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);

//     toast({
//       title: "Export successful",
//       description: `${filename} has been exported successfully`,
//     });
//   };

//   return (
//     <div className="grid gap-6 md:grid-cols-2">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Download className="h-5 w-5" />
//             Export Data
//           </CardTitle>
//           <CardDescription>Download your data in CSV format</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           <Button
//             variant="outline"
//             className="w-full justify-start"
//             onClick={() => exportToCSV(products || [], "products")}
//           >
//             <Database className="h-4 w-4 mr-2" />
//             Export Products
//           </Button>
//           <Button
//             variant="outline"
//             className="w-full justify-start"
//             onClick={() => exportToCSV(customers || [], "customers")}
//           >
//             <Database className="h-4 w-4 mr-2" />
//             Export Customers
//           </Button>
//           <Button
//             variant="outline"
//             className="w-full justify-start"
//             onClick={() => exportToCSV(sales || [], "sales")}
//           >
//             <Database className="h-4 w-4 mr-2" />
//             Export Sales
//           </Button>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Upload className="h-5 w-5" />
//             Import Data
//           </CardTitle>
//           <CardDescription>Bulk import data from CSV files</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="text-muted-foreground text-sm">
//             Import functionality coming soon. This will allow you to bulk upload products, customers, and other data from CSV files.
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/uimain/card";
// import { Button } from "@/components/uimain/button";
// import { Download, Upload, Database } from "lucide-react";
// import { useProducts } from "@/hooks/useProducts";
// import { useCustomers } from "@/hooks/useCustomers";
// import { useSales } from "@/hooks/useSales";
// import { useToast } from "@/hooks/use-toast";

// export function BulkOperations() {
//   const { products } = useProducts();
//   const { customers } = useCustomers();
//   const { sales } = useSales();
//   const { toast } = useToast();

//   const exportToCSV = (data: any[], filename) => {
//     if (!data || data.length === 0) {
//       toast({
//         title: "No data",
//         description: "No data available to export",
//         variant: "destructive",
//       });
//       return;
//     }

//     const headers = Object.keys(data[0]);
//     const csv = [
//       headers.join(","),
//       ...data.map((row) =>
//         headers.map((header) => {
//           const value = row[header];
//           if (value === null || value === undefined) return "";
//           if (typeof value === "object") return JSON.stringify(value);
//           return `"${value}"`;
//         }).join(",")
//       ),
//     ].join("\n");

//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);

//     toast({
//       title: "Export successful",
//       description: `${filename} has been exported successfully`,
//     });
//   };

//   return (
//     <div className="grid gap-6 md:grid-cols-2">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Download className="h-5 w-5" />
//             Export Data
//           </CardTitle>
//           <CardDescription>Download your data in CSV format</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           <Button
//             variant="outline"
//             className="w-full justify-start"
//             onClick={() => exportToCSV(products || [], "products")}
//           >
//             <Database className="h-4 w-4 mr-2" />
//             Export Products
//           </Button>
//           <Button
//             variant="outline"
//             className="w-full justify-start"
//             onClick={() => exportToCSV(customers || [], "customers")}
//           >
//             <Database className="h-4 w-4 mr-2" />
//             Export Customers
//           </Button>
//           <Button
//             variant="outline"
//             className="w-full justify-start"
//             onClick={() => exportToCSV(sales || [], "sales")}
//           >
//             <Database className="h-4 w-4 mr-2" />
//             Export Sales
//           </Button>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Upload className="h-5 w-5" />
//             Import Data
//           </CardTitle>
//           <CardDescription>Bulk import data from CSV files</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="text-muted-foreground text-sm">
//             Import functionality coming soon. This will allow you to bulk upload products, customers, and other data from CSV files.
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
