import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useInvoices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          customers(*),
          sales(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (invoiceData: {
      customerId?;
      saleId?;
      dueDate;
      items: Array<{
        productId?;
        description;
        quantity;
        unitPrice;
      }>;
      notes?;
      discount?;
      tax?;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const subtotal = invoiceData.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const taxAmount = invoiceData.tax || 0;
      const discountAmount = invoiceData.discount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          customer_id: invoiceData.customerId,
          sale_id: invoiceData.saleId,
          due_date: invoiceData.dueDate,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          notes: invoiceData.notes,
          created_by: user.id,
          status: "draft",
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const invoiceItems = invoiceData.items.map((item) => ({
        invoice_id: invoice.id,
        product_id: item.productId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.quantity * item.unitPrice,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({
      id,
      invoiceData,
    }: {
      id;
      invoiceData: {
        customerId?;
        dueDate;
        items: Array<{
          productId?;
          description;
          quantity;
          unitPrice;
        }>;
        notes?;
        discount?;
        tax?;
      };
    }) => {
      const subtotal = invoiceData.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const taxAmount = invoiceData.tax || 0;
      const discountAmount = invoiceData.discount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;

      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({
          customer_id: invoiceData.customerId,
          due_date: invoiceData.dueDate,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          notes: invoiceData.notes,
        })
        .eq("id", id);

      if (invoiceError) throw invoiceError;

      // Delete existing items
      await supabase.from("invoice_items").delete().eq("invoice_id", id);

      // Insert new items
      const invoiceItems = invoiceData.items.map((item) => ({
        invoice_id: id,
        product_id: item.productId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.quantity * item.unitPrice,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(invoiceItems);

      if (itemsError) throw itemsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateInvoiceStatus = useMutation({
    mutationFn: async ({ id, status }: { id; status: string }) => {
      const { error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Success",
        description: "Invoice status updated",
      });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id) => {
      // Delete items first
      await supabase.from("invoice_items").delete().eq("invoice_id", id);
      
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
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
