import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/uimain/dialog";
import { Button } from "@/components/uimain/button";
import { Input } from "@/components/uimain/Input";
import { Label } from "@/components/uimain/label";
import { Textarea } from "@/components/uimain/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/uimain/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";



export function RewardDialog({ open, onOpenChange }: RewardDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [pointsCost, setPointsCost] = React.useState("");
  const [rewardType, setRewardType] = React.useState("discount");
  const [stockLimit, setStockLimit] = React.useState("");
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("rewards").insert({
        title,
        description,
        points_cost: parseInt(pointsCost),
        reward_type: rewardType,
        stock_limit: stockLimit ? parseInt(stockLimit) ,
        active: true,
      });

      if (error) throw error;

      toast.success("Reward created successfully!");
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      
      setTitle("");
      setDescription("");
      setPointsCost("");
      setRewardType("discount");
      setStockLimit("");
      onOpenChange(false);
    } catch (error) {
      toast.error(error.message || "Failed to create reward");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Reward</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Reward Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 10% Discount Voucher"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this reward..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="points">Points Cost *</Label>
              <Input
                id="points"
                type="number"
                value={pointsCost}
                onChange={(e) => setPointsCost(e.target.value)}
                placeholder="500"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Reward Type *</Label>
              <Select value={rewardType} onValueChange={setRewardType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Discount</SelectItem>
                  <SelectItem value="product">Free Product</SelectItem>
                  <SelectItem value="voucher">Voucher</SelectItem>
                  <SelectItem value="service">Free Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock Limit (Optional)</Label>
            <Input
              id="stock"
              type="number"
              value={stockLimit}
              onChange={(e) => setStockLimit(e.target.value)}
              placeholder="Leave empty for unlimited"
              min="1"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Reward
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
