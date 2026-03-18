"use client";
import { KPISnapshot } from "@/types";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { AlertCircle, TrendingDown, Clock, Package, BarChart3, Flame } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function useAnimatedNumber(target: number, duration = 800) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    // Always cancel any previous animation
    cancelAnimationFrame(rafRef.current);

    const from = 0; // always animate from 0 on first meaningful value
    if (target === 0) { setCurrent(0); return; }

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(from + (target - from) * eased);
      setCurrent(value);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setCurrent(target); // ensure final value is exact
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}

interface Props { kpi: KPISnapshot; }

export function KPIBar({ kpi }: Props) {
  const { t, fmt, fmtDays } = useLang();

  const animVehicles = useAnimatedNumber(kpi.total_vehicles);
  const animInterest = useAnimatedNumber(kpi.total_interest_cost);
  const animAction = useAnimatedNumber(kpi.needs_action);
  const animCritical = useAnimatedNumber(kpi.critical);
  const animAvgDays = useAnimatedNumber(kpi.avg_days);
  const animMarketDelta = useAnimatedNumber(kpi.avg_market_delta);

  const items = [
    {
      icon: <Package className="w-4 h-4" />,
      label: t("kpi.totalVehicles"),
      value: String(animVehicles),
      color: "text-foreground",
      bg: "bg-secondary/60",
      border: "border-transparent",
    },
    {
      icon: <Flame className="w-4 h-4" />,
      label: t("kpi.totalInterestCost"),
      value: fmt(animInterest),
      color: "text-brand-red",
      bg: "bg-red-50",
      border: "border-red-100",
      bold: true,
    },
    {
      icon: <AlertCircle className="w-4 h-4" />,
      label: t("kpi.actionRequired"),
      value: String(animAction),
      color: kpi.needs_action > 0 ? "text-amber-700" : "text-emerald-700",
      bg: kpi.needs_action > 0 ? "bg-amber-50" : "bg-emerald-50",
      border: kpi.needs_action > 0 ? "border-amber-100" : "border-emerald-100",
    },
    {
      icon: <TrendingDown className="w-4 h-4" />,
      label: t("kpi.critical"),
      value: String(animCritical),
      color: kpi.critical > 0 ? "text-red-700" : "text-emerald-700",
      bg: kpi.critical > 0 ? "bg-red-50" : "bg-emerald-50",
      border: kpi.critical > 0 ? "border-red-100" : "border-emerald-100",
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: t("kpi.avgDays"),
      value: fmtDays(animAvgDays),
      color: "text-foreground",
      bg: "bg-secondary/60",
      border: "border-transparent",
    },
    {
      icon: <BarChart3 className="w-4 h-4" />,
      label: t("kpi.aboveMarket"),
      value: `+${animMarketDelta}%`,
      color: "text-brand-red",
      bg: "bg-red-50",
      border: "border-red-100",
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-border/40 px-4 lg:px-6 py-3 flex-shrink-0">
      <div className="flex items-center gap-3 overflow-x-auto thin-scroll pb-0.5 snap-x snap-mandatory">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 flex-shrink-0 snap-start">
            <div className={cn(
              "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border",
              item.bg, item.border
            )}>
              <span className={cn("flex-shrink-0 opacity-70", item.color)}>{item.icon}</span>
              <div>
                <div className="text-[10px] text-muted-foreground leading-tight whitespace-nowrap uppercase tracking-wider">{item.label}</div>
                <div className={cn(
                  "text-lg leading-tight interest-counter font-semibold -mt-0.5",
                  item.color
                )}>{item.value}</div>
              </div>
            </div>
            {i < items.length - 1 && <div className="w-px h-8 bg-border/40 flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
