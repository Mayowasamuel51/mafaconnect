import React from "react";
import { Card, CardContent, CardHeader } from "@/components/uimain/card";
import { Button } from "@/components/uimain/button";
import { Input } from "@/components/uimain/Input";
import { Badge } from "@/components/uimain/Badge";
import { useSuppliers } from "@/hooks/useSuppliers";
import { Truck, Plus, Search, Mail, Phone } from "lucide-react";
import { SupplierDialog } from "@/components/SupplierDialog";

export default function Suppliers() {
  const { suppliers, isLoading } = useSuppliers();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showDialog, setShowDialog] = React.useState(false);

  const filteredSuppliers = suppliers?.filter((sup) =>
    sup.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Suppliers</h1>
            <p className="text-muted-foreground">Manage your suppliers and vendors</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Supplier
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading suppliers...</div>
            )  = == 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No suppliers found" : "No suppliers yet"}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSuppliers?.map((supplier) => (
                  <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <Truck className="h-8 w-8 text-primary mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{supplier.name}</h3>
                              <Badge variant={supplier.active ? "default" : "secondary"}>
                                {supplier.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            {supplier.contact_person && (
                              <p className="text-sm text-muted-foreground mb-1">
                                Contact: {supplier.contact_person}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-4 mt-2">
                              {supplier.email && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {supplier.email}
                                </div>
                              )}
                              {supplier.phone && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {supplier.phone}
                                </div>
                              )}
                            </div>
                            {supplier.payment_terms && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Payment Terms: {supplier.payment_terms}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      <SupplierDialog open={showDialog} onOpenChange={setShowDialog} />
    </div>
  );
}
