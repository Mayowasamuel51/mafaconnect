import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_HOME_OO; // example: https://api.yourapp.com/api

export function useInvoices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // -----------------------------
  // 🔹 FETCH ALL INVOICES
  // -----------------------------
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/invoices`);
      return res.data;
    },
  });

  // -----------------------------
  // 🔹 CREATE INVOICE
  // -----------------------------
  const createInvoice = useMutation({
    mutationFn: async (invoiceData) => {
      const subtotal = invoiceData.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );

      const taxAmount = invoiceData.tax || 0;
      const discountAmount = invoiceData.discount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;

      const payload = {
        customer_id: invoiceData.customerId || null,
        sale_id: invoiceData.saleId || null,
        due_date: invoiceData.dueDate,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        notes: invoiceData.notes,
        items: invoiceData.items.map((item) => ({
          product_id: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
      };

      const res = await axios.post(`${API_URL}/invoices`, payload);
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
      toast({
        title: "Invoice created 🎉",
        description: "Your invoice has been created successfully.",
      });
    },

    onError: (err) => {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    },
  });

  // -----------------------------
  // 🔹 UPDATE INVOICE
  // -----------------------------
  const updateInvoice = useMutation({
    mutationFn: async ({ id, invoiceData }) => {
      const subtotal = invoiceData.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );

      const taxAmount = invoiceData.tax || 0;
      const discountAmount = invoiceData.discount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;

      const payload = {
        customer_id: invoiceData.customerId,
        due_date: invoiceData.dueDate,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        notes: invoiceData.notes,
        items: invoiceData.items.map((item) => ({
          product_id: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
      };

      const res = await axios.put(`${API_URL}/invoices/${id}`, payload);
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
      toast({
        title: "Invoice Updated",
        description: "Changes saved successfully.",
      });
    },

    onError: (err) => {
      toast({
        title: "Update failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    },
  });

  // -----------------------------
  // 🔹 UPDATE STATUS (sent, paid)
  // -----------------------------
  const updateInvoiceStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await axios.patch(`${API_URL}/invoices/${id}/status`, {
        status,
      });

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
      toast({
        title: "Status Updated",
        description: "Invoice status has been changed.",
      });
    },
  });

  // -----------------------------
  // 🔹 DELETE INVOICE
  // -----------------------------
  const deleteInvoice = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/invoices/${id}`);
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
      toast({
        title: "Invoice Deleted",
        description: "Invoice removed successfully.",
      });
    },

    onError: (err) => {
      toast({
        title: "Deletion failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    },
  });

  return {
    invoices,
    isLoading,
    createInvoice: createInvoice.mutate,
    updateInvoice: updateInvoice.mutate,
    updateInvoiceStatus: updateInvoiceStatus.mutate,
    deleteInvoice: deleteInvoice.mutate,
  };
}
