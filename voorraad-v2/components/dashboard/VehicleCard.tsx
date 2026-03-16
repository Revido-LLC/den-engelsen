"use client";
import { Vehicle } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import { MapPin, Flame } from "lucide-react";

interface Props {
  vehicle: Vehicle;
  isSelected: boolean;
  onClick: () => void;
}

const STATUS_BADGE: Record<string, "green" | "amber" | "red"> = {
  green: "green", amber: "amber", red: "red",
};

export function VehicleCard({ vehicle: v, isSelected, onClick }: Props) {
  const { formatCurrency, formatKm, t } = useLanguage();
  const pct = Math.min(100, (v.days_in_stock / 90) * 100);
  const barClass = v.status === "green" ? "bar-green" : v.status === "amber" ? "bar-amber" : "bar-red";
  const urgencyColor = v.urgency_score > 15000 ? "text-red-600" : v.urgency_score > 7000 ? "text-amber-600" : "text-muted-foreground";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3.5 py-3 border-l-2 transition-all duration-100",
        isSelected
          ? "bg-brand/[0.04] border-l-brand"
          : "border-l-transparent hover:bg-secondary/50 hover:border-l-border"
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Vehicle image */}
        <div className="flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden bg-secondary mt-0.5">
          {v.image_url ? (
            <img 
              src={v.image_url} 
              alt={v.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/400x250/f5f5f5/999?text=No+Image';
              }}
            />
          ) : (
            <img 
              src="https://placehold.co/400x250/f5f5f5/999?text=No+Image"
              alt={v.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + days badge */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-semibold text-foreground truncate leading-snug">{v.name}</span>
            <Badge variant={STATUS_BADGE[v.status]} className="flex-shrink-0 text-[10px] px-1.5 py-0 leading-4">
              {v.days_in_stock}d
            </Badge>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1.5">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
            <span>{v.branch}</span>
            <span className="text-border">·</span>
            <span>{v.year}</span>
            <span className="text-border">·</span>
            <span>{formatKm(v.mileage)}</span>
          </div>

          {/* Days progress bar */}
          <div className="relative h-1 bg-secondary rounded-full overflow-hidden mb-1.5">
            <div className={cn("h-full rounded-full", barClass)} style={{ width: `${pct}%` }} />
          </div>

          {/* Price + interest cost */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-foreground mono">{formatCurrency(v.price)}</span>
            <div className="flex items-center gap-1.5">
              {v.interest_cost > 0 && (
                <span className={cn("flex items-center gap-0.5 text-[10px]", urgencyColor)}>
                  <Flame className="w-2.5 h-2.5" />
                  {formatCurrency(v.interest_cost)}
                </span>
              )}
              {v.pending_actions > 0 && (
                <span className="text-[10px] bg-brand/10 text-brand px-1.5 py-0 rounded-full font-medium leading-4">
                  {v.pending_actions}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
