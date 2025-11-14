import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useInvoices } from "@/hooks/useInvoices";
import { FileText, Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { InvoiceDialog } from "@/components/InvoiceDialog";
import { InvoiceDetailsDialog } from "@/components/InvoiceDetailsDialog";
import { ExportButton } from "@/components/ExportButton";

export default function Invoices() {
  const { invoices, isLoading, updateInvoiceStatus, deleteInvoice } = useInvoices();

  const [searchQuery, setSearchQuery] = useState("");
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [dialogMode, setDialogMode] = useState("create");
  const [deleteId, setDeleteId] = useState(null);

  const filteredInvoices = invoices?.filter((inv) =>
    inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.customers?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = () => {
    setDialogMode("create");
    setSelectedInvoiceId(null);
    setShowInvoiceDialog(true);
  };

  const handleEdit = (id) => {
    setDialogMode("edit");
    setSelectedInvoiceId(id);
    setShowInvoiceDialog(true);
  };

  const handleView = (id) => {
    setSelectedInvoiceId(id);
    setShowDetailsDialog(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteInvoice(deleteId);
      setDeleteId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-success text-success-foreground";
      case "sent":
        return "bg-primary text-primary-foreground";
      case "overdue":
        return "bg-destructive text-destructive-foreground";
      case "cancelled":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Manage invoices and billing</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={invoices || []}
            filename="invoices"
            headers={["Invoice Number", "Customer", "Total Amount", "Status", "Due Date"]}
          />
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* SEARCH + LIST */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading invoices...</div>
          ) : filteredInvoices?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No invoices found" : "No invoices yet"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices?.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{invoice.invoice_number}</p>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {invoice.customers?.name || "Walk-in"} • Due:{" "}
                        {format(new Date(invoice.due_date), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold">
                      ₦{Number(invoice.total_amount).toLocaleString()}
                    </p>

                    <div className="flex gap-2 mt-2">
                      {/* View */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(invoice.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Edit & Send (only draft) */}
                      {invoice.status === "draft" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(invoice.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateInvoiceStatus({ id: invoice.id, status: "sent" })
                            }
                          >
                            Send
                          </Button>
                        </>
                      )}

                      {/* Mark Paid */}
                      {invoice.status === "sent" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateInvoiceStatus({ id: invoice.id, status: "paid" })
                          }
                        >
                          Mark Paid
                        </Button>
                      )}

                      {/* Delete (only draft) */}
                      {invoice.status === "draft" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(invoice.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE / EDIT DIALOG */}
      <InvoiceDialog
        open={showInvoiceDialog}
        onOpenChange={setShowInvoiceDialog}
        invoiceId={selectedInvoiceId}
        mode={dialogMode}
      />

      {/* VIEW DETAILS DIALOG */}
      <InvoiceDetailsDialog
        invoiceId={selectedInvoiceId}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        onEdit={() => {
          setShowDetailsDialog(false);
          handleEdit(selectedInvoiceId);
        }}
      />

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
