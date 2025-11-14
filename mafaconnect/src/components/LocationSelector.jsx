import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocations } from "@/hooks/useLocations";
import { MapPin } from "lucide-react";

export function LocationSelector({
  value,
  onValueChange,
  placeholder = "Select location",
  filterByState,
  className,
}) {
  const { locations, isLoading } = useLocations();

  const filteredLocations = locations?.filter(
    (loc) => loc.active && (!filterByState || loc.state === filterByState)
  );

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading locations...
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>

      <SelectContent>
        {filteredLocations?.map((location) => (
          <SelectItem key={location.id} value={location.id}>
            <div className="flex flex-col">
              <span className="font-medium">{location.name}</span>
              {location.state && (
                <span className="text-xs text-muted-foreground">
                  {location.state}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
