import { Button } from "@/components/uimain/button";
import { Download } from "lucide-react";
import { format } from "date-fns";



export function ExportButton({ data, filename, headers }: ExportButtonProps) {
  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header.toLowerCase().replace(/ /g, "_")];
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",")
      )
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" onClick={exportToCSV}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
