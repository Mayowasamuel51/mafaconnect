import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { TRANSACTION_TYPES } from "@/lib/transactionUtils";





export function useTransactions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          customers(*),
          locations(*),
          sale_items(
            *,
            products(*)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createTransaction = useMutation({
    mutationFn: async (transactionData: TransactionData) => {
      console.log('🔐 Starting transaction creation...');
      
      // Verify authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('👤 User check:', { userId: user?.id, error: authError });
      
      if (!user) {
        console.error('❌ Authentication failed: No user found');
        throw new Error('You must be logged in to create transactions');
      }

      // Verify user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      console.log('👥 User roles:', { roles: userRoles, error: rolesError });
      
      const isStaff = userRoles?.some(r => 
        ['admin', 'manager', 'sales_agent'].includes(r.role)
      );
      
      if (!isStaff) {
        console.error('❌ Permission denied: User is not staff', { userRoles });
        throw new Error('You do not have permission to create transactions. Staff access required.');
      }
      
      console.log('✅ Authentication verified. Creating transaction...');

      const config = TRANSACTION_TYPES[transactionData.transactionType];
      
      // Validate required fields
      if (config.requiresCustomer && !transactionData.customerId) {
        throw new Error("Customer is required for this transaction type");
      }
      if (config.requiresLocation && !transactionData.locationId) {
        throw new Error("Location is required for this transaction type");
      }

      // Validate stock for immediate stock update types
      if (config.updatesStock === 'immediate' && transactionData.locationId) {
        for (const item of transactionData.items) {
          const { data: stockData } = await supabase
            .from("product_locations")
            .select("stock_qty")
            .eq("product_id", item.productId)
            .eq("location_id", transactionData.locationId)
            .single();

          if (!stockData || stockData.stock_qty < item.quantity) {
            const { data: productData } = await supabase
              .from("products")
              .select("name")
              .eq("id", item.productId)
              .single();
            
            throw new Error(
              `Insufficient stock for ${productData?.name}. Available: ${stockData?.stock_qty || 0}, Required: ${item.quantity}`
            );
          }
        }
      }

      const subtotal = transactionData.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const taxAmount = subtotal * 0.075; // 7.5% VAT
      const discountAmount = transactionData.discount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;

      // Generate invoice number for invoice/credit_sale types
      let invoiceNumber = null;
      if (transactionData.transactionType === 'invoice' || transactionData.transactionType === 'credit_sale') {
        const { data: invoiceNumData } = await supabase.rpc('generate_invoice_number');
        invoiceNumber = invoiceNumData;
      }

      const { data: transaction, error: transactionError } = await supabase
        .from("sales")
        .insert({
          customer_id: transactionData.customerId,
          location_id: transactionData.locationId,
          sales_agent_id: user.id,
          transaction_type: transactionData.transactionType,
          invoice_number: invoiceNumber,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: transactionData.dueDate,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          payment_method: transactionData.paymentMethod || 'cash',
          status: config.defaultStatus,
          notes: transactionData.notes,
        })
        .select()
        .single();

      if (transactionError) {
        console.error('❌ Error creating sale:', transactionError);
        throw new Error(`Failed to create transaction: ${transactionError.message}`);
      }
      
      console.log('✅ Sale created:', transaction.id);

      // Insert transaction items
      const transactionItems = transactionData.items.map((item) => ({
        sale_id: transaction.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.quantity * item.unitPrice,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(transactionItems);

      if (itemsError) {
        console.error('❌ Error creating sale items:', itemsError);
        throw new Error(`Failed to add items to transaction: ${itemsError.message}`);
      }
      
      console.log('✅ Sale items created');

      // Update stock for immediate update types
      if (config.updatesStock === 'immediate' && transactionData.locationId) {
        for (const item of transactionData.items) {
          // Get current location stock
          const { data: locationStock } = await supabase
            .from("product_locations")
            .select("stock_qty")
            .eq("product_id", item.productId)
            .eq("location_id", transactionData.locationId)
            .single();

          if (locationStock) {
            // Update location stock
            await supabase
              .from("product_locations")
              .update({
                stock_qty: locationStock.stock_qty - item.quantity,
              })
              .eq("product_id", item.productId)
              .eq("location_id", transactionData.locationId);
          }

          // Get current global stock
          const { data: globalStock } = await supabase
            .from("products")
            .select("stock_qty")
            .eq("id", item.productId)
            .single();

          if (globalStock) {
            // Update global stock
            await supabase
              .from("products")
              .update({
                stock_qty: globalStock.stock_qty - item.quantity,
              })
              .eq("id", item.productId);
          }
        }

        // Award loyalty points if customer is present
        if (transactionData.customerId) {
          const { data: loyaltyAccount } = await supabase
            .from("loyalty_accounts")
            .select("id, points_balance")
            .eq("customer_id", transactionData.customerId)
            .single();

          if (loyaltyAccount) {
            const pointsEarned = Math.floor(totalAmount / 100);
            await supabase
              .from("loyalty_accounts")
              .update({
                points_balance: loyaltyAccount.points_balance + pointsEarned,
              })
              .eq("id", loyaltyAccount.id);

            await supabase.from("loyalty_transactions").insert({
              loyalty_account_id: loyaltyAccount.id,
              type: "earn",
              points: pointsEarned,
              reference_id: transaction.id,
              note: `Points earned from ${transactionData.transactionType}`,
            });
          }
        }
      }

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["product-locations"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
    },
    onError: (error) => {
      console.error('❌ Transaction creation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create transaction",
        variant: "destructive",
      });
    },
  });

  const updateTransactionStatus = useMutation({
    mutationFn: async ({ id, status }: { id; status: TransactionStatus }) => {
      const { error } = await supabase
        .from("sales")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Success",
        description: "Status updated successfully",
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

  return {
    transactions,
    isLoading,
    createTransaction: createTransaction.mutate,
    updateTransactionStatus: updateTransactionStatus.mutate,
    isCreating: createTransaction.isPending,
  };
}
