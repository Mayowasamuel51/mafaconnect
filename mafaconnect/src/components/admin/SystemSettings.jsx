import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useLoyaltyConfig } from "@/hooks/useLoyaltyConfig";
import { Settings, Save } from "lucide-react";

export function SystemSettings() {
  const { config, isLoading, updateConfig } = useLoyaltyConfig();
  const [formData, setFormData] = useState({
    points_per_currency: 0,
    currency_symbol: "",
    expiry_days: 0,
    multiplier: 0,
  });

  useEffect(() => {
    if (config) {
      setFormData({
        points_per_currency: config.points_per_currency || 0,
        currency_symbol: config.currency_symbol || "",
        expiry_days: config.expiry_days || 0,
        multiplier: Number(config.multiplier) || 0,
      });
    }
  }, [config]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateConfig(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Loyalty Program Settings
          </CardTitle>
          <CardDescription>Configure loyalty points and reward system</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Points per currency */}
              <div className="space-y-2">
                <Label htmlFor="points_per_currency">Points per Currency Unit</Label>
                <Input
                  id="points_per_currency"
                  type="number"
                  value={formData.points_per_currency}
                  onChange={(e) =>
                    setFormData({ ...formData, points_per_currency: parseInt(e.target.value) || 0 })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  How many points customers earn per {formData.currency_symbol || "$"}1 spent
                </p>
              </div>

              {/* Currency symbol */}
              <div className="space-y-2">
                <Label htmlFor="currency_symbol">Currency Symbol</Label>
                <Input
                  id="currency_symbol"
                  value={formData.currency_symbol}
                  onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                />
              </div>

              {/* Expiry days */}
              <div className="space-y-2">
                <Label htmlFor="expiry_days">Points Expiry (Days)</Label>
                <Input
                  id="expiry_days"
                  type="number"
                  value={formData.expiry_days}
                  onChange={(e) =>
                    setFormData({ ...formData, expiry_days: parseInt(e.target.value) || 0 })
                  }
                />
                <p className="text-sm text-muted-foreground">Days until earned points expire</p>
              </div>

              {/* Multiplier */}
              <div className="space-y-2">
                <Label htmlFor="multiplier">Points Multiplier</Label>
                <Input
                  id="multiplier"
                  type="number"
                  step="0.1"
                  value={formData.multiplier}
                  onChange={(e) =>
                    setFormData({ ...formData, multiplier: parseFloat(e.target.value) || 0 })
                  }
                />
                <p className="text-sm text-muted-foreground">Bonus multiplier for promotions</p>
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Manage your business profile and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            Additional business settings coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
