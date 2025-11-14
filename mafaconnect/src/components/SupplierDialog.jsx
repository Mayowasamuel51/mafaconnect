import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { useSuppliers } from "@/hooks/useSuppliers";

export function SupplierDialog({ open, onOpenChange }) {
  const { createSupplier } = useSuppliers();

  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setName("");
    setContactPerson("");
    setEmail("");
    setPhone("");
    setAddress("");
    setPaymentTerms("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (!name) return;

    createSupplier({
      name,
      contact_person: contactPerson || undefined,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      payment_terms: paymentTerms || undefined,
      notes: notes || undefined,
    });

    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Supplier Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ABC Supplies Ltd"
              />
            </div>

            <div>
              <Label>Contact Person</Label>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="supplier@example.com"
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234..."
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Industrial Ave, City"
            />
          </div>

          {/* Payment Terms */}
          <div>
            <Label>Payment Terms</Label>
            <Input
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="Net 30, COD, etc."
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional information..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={!name}>
              Create Supplier
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
