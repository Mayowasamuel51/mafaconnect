import React from "react";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { format } from "date-fns";

export function ExportButton({ data, filename, headers }) {
  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    // Convert header text to object keys
    const convertHeaderToKey = (header) => {
      return header.toLowerCase().replace(/ /g, "_");
    };

    // Create CSV content
    const csvContent = [
      headers.join(","),

      ...data.map((row) =>
        headers
          .map((header) => {
            const key = convertHeaderToKey(header);
            const value = row[key];

            // Escape commas and quotes safely
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }

            return value ?? "";
          })
          .join(",")
      )
    ].join("\n");

    // Create blob for downloading file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" onClick={exportToCSV}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
