// src/utils/transactions.js

// 🔹 Transaction type categories
export const TRANSACTION_TYPES = {
  cash_sale: {
    label: "Cash Sale",
    description: "Immediate POS transaction with instant payment",
    requiresLocation: true,
    requiresCustomer: false,
    requiresDueDate: false,
    updatesStock: "immediate",
    defaultStatus: "completed",
    allowedStatusFlow: ["draft", "completed", "cancelled", "refunded"],
  },
  credit_sale: {
    label: "Credit Sale",
    description: "Sale with payment terms - pay later",
    requiresLocation: true,
    requiresCustomer: true,
    requiresDueDate: true,
    updatesStock: "immediate",
    defaultStatus: "sent",
    allowedStatusFlow: ["draft", "sent", "paid", "overdue", "cancelled", "refunded"],
  },
  invoice: {
    label: "Invoice",
    description: "Billing document for products/services",
    requiresLocation: false,
    requiresCustomer: true,
    requiresDueDate: true,
    updatesStock: "on_payment",
    defaultStatus: "draft",
    allowedStatusFlow: ["draft", "sent", "paid", "overdue", "cancelled"],
  },
  quote: {
    label: "Quote",
    description: "Estimate only - no payment or stock update",
    requiresLocation: false,
    requiresCustomer: true,
    requiresDueDate: false,
    updatesStock: "never",
    defaultStatus: "draft",
    allowedStatusFlow: ["draft", "sent", "cancelled"],
  },
};

// 🔹 Transaction status configurations
export const STATUS_CONFIG = {
  draft: { label: "Draft", variant: "outline" },
  pending: { label: "Pending", variant: "secondary" },
  completed: { label: "Completed", variant: "default" },
  sent: { label: "Sent", variant: "secondary" },
  paid: { label: "Paid", variant: "default" },
  overdue: { label: "Overdue", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "outline" },
  refunded: { label: "Refunded", variant: "destructive" },
};

// 🔹 Payment term options
export function getPaymentTermsOptions() {
  return [
    { value: "immediate", label: "Immediate" },
    { value: "net_7", label: "Net 7 days" },
    { value: "net_15", label: "Net 15 days" },
    { value: "net_30", label: "Net 30 days" },
    { value: "net_60", label: "Net 60 days" },
    { value: "net_90", label: "Net 90 days" },
  ];
}

// 🔹 Calculate due date based on payment term
export function calculateDueDate(paymentTerms) {
  const today = new Date();
  const daysMap = {
    immediate: 0,
    net_7: 7,
    net_15: 15,
    net_30: 30,
    net_60: 60,
    net_90: 90,
  };

  const days = daysMap[paymentTerms];
  if (days === undefined) return null;

  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + days);
  return dueDate;
}

// 🔹 Format currency (USD-friendly, can change to NGN or USD)
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // changed to USD as per your preference
  }).format(amount);
}

// 🔹 Check if transaction is overdue
export function isOverdue(dueDate, status) {
  if (!dueDate || ["paid", "completed", "cancelled"].includes(status)) {
    return false;
  }
  return new Date(dueDate) < new Date();
}
