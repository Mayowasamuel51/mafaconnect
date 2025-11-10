import { Card, CardContent, CardHeader, CardTitle } from "@/components/uimain/card";
import { Button } from "@/components/uimain/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

;
  orderNumber;
}

export function BankDetailsCard({ bankDetails, orderNumber }: BankDetailsCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast({
      title: "Copied to clipboard",
      description: `${field} has been copied`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="text-lg">Bank Transfer Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-muted rounded">
            <div>
              <p className="text-xs text-muted-foreground">Bank Name</p>
              <p className="font-semibold">{bankDetails.bank_name}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bankDetails.bank_name, "Bank Name")}
            >
              {copied === "Bank Name" ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex justify-between items-center p-2 bg-muted rounded">
            <div>
              <p className="text-xs text-muted-foreground">Account Number</p>
              <p className="font-semibold text-lg">{bankDetails.account_number}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bankDetails.account_number, "Account Number")}
            >
              {copied === "Account Number" ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex justify-between items-center p-2 bg-muted rounded">
            <div>
              <p className="text-xs text-muted-foreground">Account Name</p>
              <p className="font-semibold">{bankDetails.account_name}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bankDetails.account_name, "Account Name")}
            >
              {copied === "Account Name" ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex justify-between items-center p-2 bg-accent rounded">
            <div>
              <p className="text-xs text-muted-foreground">Transfer Reference</p>
              <p className="font-semibold">{orderNumber}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(orderNumber, "Reference")}
            >
              {copied === "Reference" ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Please use the order number transfer reference for faster processing.
        </p>
      </CardContent>
    </Card>
  );
}
