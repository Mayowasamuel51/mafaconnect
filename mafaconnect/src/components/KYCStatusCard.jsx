import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

export function KYCStatusCard({ kycStatus, customerType, kycNotes }) {
  const getStatusConfig = () => {
    switch (kycStatus) {
      case "approved":
        return {
          icon: CheckCircle,
          iconColor: "text-green-500",
          bgColor: "bg-green-50 dark:bg-green-950/30",
          borderColor: "border-green-200 dark:border-green-800",
          label: "Verified",
          badgeVariant: "default",
          message: "Your KYC has been approved. You can now place orders.",
          showAction: false,
        };
      case "submitted":
        return {
          icon: Clock,
          iconColor: "text-blue-500",
          bgColor: "bg-blue-50 dark:bg-blue-950/30",
          borderColor: "border-blue-200 dark:border-blue-800",
          label: "Under Review",
          badgeVariant: "secondary",
          message:
            "Your documents are being reviewed. We'll notify you once complete.",
          showAction: false,
        };
      case "rejected":
        return {
          icon: XCircle,
          iconColor: "text-red-500",
          bgColor: "bg-red-50 dark:bg-red-950/30",
          borderColor: "border-red-200 dark:border-red-800",
          label: "Resubmission Required",
          badgeVariant: "destructive",
          message:
            kycNotes ||
            "Your submission was rejected. Please review and resubmit.",
          showAction: true,
        };
      default:
        return {
          icon: AlertCircle,
          iconColor: "text-yellow-500",
          bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          label: "Action Required",
          badgeVariant: "outline",
          message: `Complete your ${
            customerType === "corporate" ? "corporate" : "individual"
          } KYC to start ordering.`,
          showAction: true,
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <Card className={`${config.bgColor} border-2 ${config.borderColor}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            KYC Verification Status
          </CardTitle>
          <Badge variant={config.badgeVariant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
        <CardDescription className="capitalize">
          {customerType} Customer Account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <StatusIcon className={`h-6 w-6 ${config.iconColor} mt-0.5`} />
          <p className="text-sm text-muted-foreground flex-1">
            {config.message}
          </p>
        </div>

        {config.showAction && (
          <Link to="/kyc-onboarding">
            <Button
              className="w-full"
              variant={kycStatus === "rejected" ? "destructive" : "default"}
            >
              {kycStatus === "rejected"
                ? "Resubmit Documents"
                : "Complete KYC Now"}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
