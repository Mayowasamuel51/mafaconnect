import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function CustomerDialog({ open, onOpenChange }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    external_id: "",
  });

  // 🔹 REST API helper
  const createCustomer = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create customer");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Customer Created",
        description: "Customer and loyalty account created successfully.",
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error Creating Customer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 🔹 Reset helper
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      external_id: "",
    });
  };

  // 🔹 Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    createCustomer.mutate({
      name: formData.name.trim(),
      email: formData.email || null,
      phone: formData.phone || null,
      external_id: formData.external_id || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Customer Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {/* External ID */}
          <div className="space-y-2">
            <Label htmlFor="external_id">External ID</Label>
            <Input
              id="external_id"
              value={formData.external_id}
              onChange={(e) =>
                setFormData({ ...formData, external_id: e.target.value })
              }
              placeholder="Optional external system ID"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCustomer.isPending}>
              {createCustomer.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Customer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
