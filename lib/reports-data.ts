import { Vehicle } from "@/types";

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface MonthlyData {
  month: string;        // "Oct", "Nov", etc.
  fullMonth: string;    // "October 2025"
  vehicles: number;     // total in stock
  sold: number;         // vehicles sold that month
  added: number;        // vehicles added that month
  interestCost: number; // total interest that month
  avgDays: number;      // avg days in stock
  revenue: number;      // sales revenue
}

export interface BranchData {
  branch: string;
  vehicles: number;
  avgDays: number;
  totalValue: number;
  interestCost: number;
  critical: number;
  sold: number;
}

export interface AgingBucket {
  range: string;        // "0-15d", "15-30d", etc.
  count: number;
  color: string;        // hex color for the chart bar
}

export interface MarketPositionSegment {
  label: string;
  value: number;
  color: string;
}

// ── Monthly trend data (Oct 2025 → Mar 2026) ───────────────────────────────
// Story: stock growing 18→24, interest peaked Jan then trending down,
// avg days improving 45→38, revenue growing, sold vehicles increasing

const MONTHLY_DATA: MonthlyData[] = [
  {
    month: "Oct",
    fullMonth: "October 2025",
    vehicles: 18,
    sold: 5,
    added: 7,
    interestCost: 4820,
    avgDays: 45,
    revenue: 285000,
  },
  {
    month: "Nov",
    fullMonth: "November 2025",
    vehicles: 19,
    sold: 6,
    added: 7,
    interestCost: 5340,
    avgDays: 44,
    revenue: 342000,
  },
  {
    month: "Dec",
    fullMonth: "December 2025",
    vehicles: 20,
    sold: 4,
    added: 5,
    interestCost: 5890,
    avgDays: 46,
    revenue: 224000,
  },
  {
    month: "Jan",
    fullMonth: "January 2026",
    vehicles: 21,
    sold: 7,
    added: 8,
    interestCost: 6420,   // peak — tool wasn't in use yet
    avgDays: 45,
    revenue: 398000,
  },
  {
    month: "Feb",
    fullMonth: "February 2026",
    vehicles: 22,
    sold: 8,
    added: 9,
    interestCost: 5180,   // tool launched → immediate drop
    avgDays: 42,
    revenue: 468000,
  },
  {
    month: "Mar",
    fullMonth: "March 2026",
    vehicles: 24,
    sold: 9,
    added: 11,
    interestCost: 4150,   // continuing improvement
    avgDays: 38,
    revenue: 537000,
  },
];

// ── Public getters ──────────────────────────────────────────────────────────

export function getMonthlyData(): MonthlyData[] {
  return MONTHLY_DATA;
}

/**
 * Compute per-branch stats from the live vehicle list.
 * Sold numbers are simulated per branch.
 */
export function getBranchData(vehicles: Vehicle[]): BranchData[] {
  const branches = ["Duiven", "Eindhoven", "Nijmegen", "Venlo", "Stein", "Tiel"];
  // Simulated sold-this-month per branch (sums to 9 matching March data)
  const soldMap: Record<string, number> = {
    Duiven: 2,
    Eindhoven: 2,
    Nijmegen: 1,
    Venlo: 2,
    Stein: 1,
    Tiel: 1,
  };

  return branches.map((branch) => {
    const bv = vehicles.filter((v) => v.branch === branch);
    const count = bv.length;
    return {
      branch,
      vehicles: count,
      avgDays: count
        ? Math.round(bv.reduce((s, v) => s + v.days_in_stock, 0) / count)
        : 0,
      totalValue: bv.reduce((s, v) => s + v.price, 0),
      interestCost: bv.reduce((s, v) => s + v.interest_cost, 0),
      critical: bv.filter((v) => v.days_in_stock > 90).length,
      sold: soldMap[branch] ?? 1,
    };
  });
}

/**
 * Build aging-distribution buckets from the live vehicle list.
 */
export function getAgingDistribution(vehicles: Vehicle[]): AgingBucket[] {
  const buckets: { range: string; min: number; max: number; color: string }[] = [
    { range: "0-15d",  min: 0,  max: 15,  color: "#10b981" },
    { range: "15-30d", min: 15, max: 30,  color: "#34d399" },
    { range: "30-45d", min: 30, max: 45,  color: "#f59e0b" },
    { range: "45-60d", min: 45, max: 60,  color: "#f97316" },
    { range: "60-90d", min: 60, max: 90,  color: "#ef4444" },
    { range: "90d+",   min: 90, max: 9999, color: "#991b1b" },
  ];

  return buckets.map(({ range, min, max, color }) => ({
    range,
    count: vehicles.filter(
      (v) => v.days_in_stock >= min && v.days_in_stock < max
    ).length,
    color,
  }));
}

/**
 * Classify vehicles as above / at / below market based on market_delta_pct.
 */
export function getMarketPositionData(
  vehicles: Vehicle[]
): MarketPositionSegment[] {
  const above = vehicles.filter((v) => v.market_delta_pct > 3).length;
  const atMarket = vehicles.filter(
    (v) => v.market_delta_pct >= -3 && v.market_delta_pct <= 3
  ).length;
  const below = vehicles.filter((v) => v.market_delta_pct < -3).length;

  return [
    { label: "Above market", value: above, color: "#ef4444" },
    { label: "At market",    value: atMarket, color: "#f59e0b" },
    { label: "Below market", value: below, color: "#10b981" },
  ];
}
