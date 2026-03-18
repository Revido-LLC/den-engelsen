"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Download,
  Package,
  Clock,
  Flame,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { LangToggle } from "@/components/ui/LangToggle";
import { useLang } from "@/lib/i18n";
import { fetchVehicles, computeKPIs } from "@/lib/data-supabase";
import { Vehicle } from "@/types";
import {
  getMonthlyData,
  getBranchData,
  getAgingDistribution,
  getMarketPositionData,
  MonthlyData,
} from "@/lib/reports-data";

// ── Constants ───────────────────────────────────────────────────────────────

const DEMO_USER = { name: "Thomas de Vries", role: "Manager", initials: "TD" };

const BRAND = "#143954";
const ACCENT_RED = "#ff253a";

type Period = "3M" | "6M" | "12M";

// ── Custom tooltip ──────────────────────────────────────────────────────────

function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg border border-border shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">
            {formatter ? formatter(entry.value) : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Page component ──────────────────────────────────────────────────────────

export default function ReportsPage() {
  const router = useRouter();
  const { t, fmt, lang } = useLang();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("6M");

  useEffect(() => {
    fetchVehicles().then((data) => {
      setVehicles(data);
      setLoading(false);
    });
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────

  const kpi = useMemo(() => computeKPIs(vehicles), [vehicles]);

  const monthlyRaw = useMemo(() => getMonthlyData(), []);
  const monthly: MonthlyData[] = useMemo(() => {
    if (period === "3M") return monthlyRaw.slice(-3);
    return monthlyRaw; // 6M and 12M show all 6 months of available data
  }, [monthlyRaw, period]);

  const branchData = useMemo(() => getBranchData(vehicles), [vehicles]);
  const agingData = useMemo(() => getAgingDistribution(vehicles), [vehicles]);
  const marketData = useMemo(
    () => getMarketPositionData(vehicles),
    [vehicles]
  );

  // KPI deltas (current month vs previous month)
  const currentMonth = monthlyRaw[monthlyRaw.length - 1];
  const prevMonth = monthlyRaw[monthlyRaw.length - 2];
  const vehicleDelta = currentMonth.vehicles - prevMonth.vehicles;
  const interestDelta = currentMonth.interestCost - prevMonth.interestCost;
  const daysDelta = currentMonth.avgDays - prevMonth.avgDays;
  const soldDelta = currentMonth.sold - prevMonth.sold;

  // Interest target line (5 % below peak)
  const interestTarget = Math.round(
    Math.max(...monthlyRaw.map((m) => m.interestCost)) * 0.7
  );
  const interestWithTarget = monthly.map((m) => ({
    ...m,
    target: interestTarget,
  }));

  // ── CSV export ──────────────────────────────────────────────────────────

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Branch",
      "Brand",
      "Type",
      "Price",
      "Days in Stock",
      "Status",
      "Mileage",
      "Year",
    ];
    const rows = vehicles.map((v) => [
      v.id,
      v.name,
      v.branch,
      v.brand,
      v.type,
      v.price,
      v.days_in_stock,
      v.status,
      v.mileage,
      v.year,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── EUR formatter for charts ────────────────────────────────────────────

  const eurFmt = (v: number) =>
    new Intl.NumberFormat(lang === "nl" ? "nl-NL" : "en-GB", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v);

  const kFmt = (v: number) =>
    v >= 1000 ? `€${Math.round(v / 1000)}k` : `€${v}`;

  // ── Loading state ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E2E8F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-border/60 flex items-center px-4 lg:px-6 py-3 gap-3">
        <div className="flex items-center gap-3">
          <img src="/logo-shield.svg" alt="Den Engelsen" className="h-9 w-9" />
          <div className="hidden sm:block">
            <div className="text-sm font-bold tracking-tight leading-tight">VoorraadInzicht</div>
            <div className="text-[10px] text-muted-foreground leading-tight tracking-wide uppercase">Den Engelsen Bedrijfswagens</div>
          </div>
        </div>
        <div className="hidden lg:block w-px h-6 bg-border/60 mx-2" />
        <nav className="hidden lg:flex items-center gap-0.5">
          <button onClick={() => router.push("/dashboard")} className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/80 transition-colors">{t("nav.dashboard")}</button>
          <button onClick={() => router.push("/reports")} className="px-3.5 py-1.5 text-xs font-semibold text-brand bg-brand/8 rounded-md border border-brand/15">{t("nav.reports")}</button>
          <button onClick={() => router.push("/settings")} className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/80 transition-colors">{t("nav.settings")}</button>
        </nav>
        <div className="lg:hidden">
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> {t("nav.back")}
          </button>
        </div>
        <div className="flex-1" />
        <LangToggle />
        <div className="hidden sm:flex items-center gap-2.5">
          <div className="text-right">
            <div className="text-xs font-semibold">{DEMO_USER.name}</div>
            <div className="text-[10px] text-muted-foreground">
              {DEMO_USER.role} · {t("label.allBranches")}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full brand-gradient text-white flex items-center justify-center text-xs font-semibold shadow-sm">
            {DEMO_USER.initials}
          </div>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Title + period + export */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {lang === "nl" ? "Rapporten & Analyse" : "Reports & Analysis"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {lang === "nl"
                ? "Inzicht in voorraadprestaties, kosten en marktpositionering"
                : "Insight into inventory performance, costs and market positioning"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Period selector */}
            <div className="flex bg-white rounded-lg border border-border p-0.5">
              {(["3M", "6M", "12M"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                    period === p
                      ? "bg-[#143954] text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            {/* Export */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-white border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {t("reports.exportCSV")}
            </button>
          </div>
        </div>

        {/* ── KPI cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            icon={<Package className="w-4 h-4" />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            label={t("kpi.totalVehicles")}
            value={String(kpi.total_vehicles)}
            delta={vehicleDelta}
            deltaLabel={lang === "nl" ? "vs vorige maand" : "vs last month"}
            positiveIsGood={true}
          />
          <KPICard
            icon={<Flame className="w-4 h-4" />}
            iconBg="bg-red-50"
            iconColor="text-red-500"
            label={t("kpi.totalInterestCost")}
            value={fmt(kpi.total_interest_cost)}
            delta={interestDelta}
            deltaLabel={lang === "nl" ? "vs vorige maand" : "vs last month"}
            positiveIsGood={false}
            deltaFormat={eurFmt}
          />
          <KPICard
            icon={<Clock className="w-4 h-4" />}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            label={t("kpi.avgDays")}
            value={`${kpi.avg_days}d`}
            delta={daysDelta}
            deltaLabel={lang === "nl" ? "vs vorige maand" : "vs last month"}
            positiveIsGood={false}
          />
          <KPICard
            icon={<ShoppingCart className="w-4 h-4" />}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            label={lang === "nl" ? "Verkocht deze maand" : "Sold this month"}
            value={String(currentMonth.sold)}
            delta={soldDelta}
            deltaLabel={lang === "nl" ? "vs vorige maand" : "vs last month"}
            positiveIsGood={true}
          />
        </div>

        {/* ── Charts grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1 — Stock Aging Distribution */}
          <ChartCard
            title={
              lang === "nl"
                ? "Voorraadveroudering"
                : "Stock Aging Distribution"
            }
            subtitle={
              lang === "nl"
                ? "Aantal voertuigen per leeftijdscategorie"
                : "Number of vehicles by days-in-stock bucket"
            }
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={agingData}
                margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload as unknown as Array<{ name: string; value: number; color: string }>}
                      label={label as string}
                    />
                  )}
                />
                <Bar
                  dataKey="count"
                  name={lang === "nl" ? "Voertuigen" : "Vehicles"}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                >
                  {agingData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 2 — Monthly Interest Cost Trend */}
          <ChartCard
            title={
              lang === "nl"
                ? "Rentekosten Trend"
                : "Monthly Interest Cost Trend"
            }
            subtitle={
              lang === "nl"
                ? "Maandelijkse rentekosten vs doel"
                : "Monthly carrying cost vs target"
            }
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={interestWithTarget}
                margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
              >
                <defs>
                  <linearGradient
                    id="interestGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={BRAND} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={BRAND} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={kFmt}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload as unknown as Array<{ name: string; value: number; color: string }>}
                      label={label as string}
                      formatter={eurFmt}
                    />
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="interestCost"
                  name={
                    lang === "nl" ? "Rentekosten" : "Interest Cost"
                  }
                  stroke={BRAND}
                  strokeWidth={2.5}
                  fill="url(#interestGradient)"
                  dot={{ r: 4, fill: BRAND, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: BRAND }}
                  animationDuration={1200}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name={lang === "nl" ? "Doel" : "Target"}
                  stroke={ACCENT_RED}
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  dot={false}
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 3 — Branch Performance (horizontal bars) */}
          <ChartCard
            title={
              lang === "nl" ? "Vestigingsprestaties" : "Branch Performance"
            }
            subtitle={
              lang === "nl"
                ? "Totale voorraadwaarde per vestiging"
                : "Total inventory value by branch"
            }
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={branchData}
                layout="vertical"
                margin={{ top: 4, right: 24, bottom: 0, left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  type="number"
                  tickFormatter={kFmt}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="branch"
                  width={76}
                  tick={{ fontSize: 11, fill: "#334155", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload as unknown as Array<{ name: string; value: number; color: string }>}
                      label={label as string}
                      formatter={eurFmt}
                    />
                  )}
                />
                <Bar
                  dataKey="totalValue"
                  name={lang === "nl" ? "Voorraadwaarde" : "Inventory Value"}
                  radius={[0, 6, 6, 0]}
                  maxBarSize={28}
                >
                  {branchData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={BRAND}
                      fillOpacity={1 - i * 0.12}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 4 — Vehicle Turnover (sold vs added) */}
          <ChartCard
            title={
              lang === "nl" ? "Voertuigomloop" : "Vehicle Turnover"
            }
            subtitle={
              lang === "nl"
                ? "Maandelijks verkocht vs nieuw toegevoegd"
                : "Monthly sold vs newly added"
            }
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={monthly}
                margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload as unknown as Array<{ name: string; value: number; color: string }>}
                      label={label as string}
                    />
                  )}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="sold"
                  name={lang === "nl" ? "Verkocht" : "Sold"}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1200}
                />
                <Line
                  type="monotone"
                  dataKey="added"
                  name={lang === "nl" ? "Toegevoegd" : "Added"}
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 5 — Market Position (donut) */}
          <ChartCard
            title={
              lang === "nl" ? "Marktpositie" : "Market Position"
            }
            subtitle={
              lang === "nl"
                ? "Prijspositionering t.o.v. concurrentie"
                : "Price positioning vs competition"
            }
          >
            <div className="flex flex-col items-center">
              <div className="relative w-full" style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={marketData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="label"
                      animationDuration={1000}
                      label={false}
                      labelLine={false}
                    >
                      {marketData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => (
                        <ChartTooltipContent
                          active={active}
                          payload={payload as unknown as Array<{ name: string; value: number; color: string }>}
                          label={
                            lang === "nl" ? "Marktpositie" : "Market Position"
                          }
                        />
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold">{vehicles.length}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {lang === "nl" ? "voertuigen" : "vehicles"}
                  </span>
                </div>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-5 -mt-2">
                {marketData.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {lang === "nl"
                        ? seg.label === "Above market"
                          ? "Boven markt"
                          : seg.label === "At market"
                          ? "Op markt"
                          : "Onder markt"
                        : seg.label}
                    </span>
                    <span className="text-xs font-semibold">{seg.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* 6 — Revenue & Stock Growth */}
          <ChartCard
            title={
              lang === "nl" ? "Omzet & Voorraadgroei" : "Revenue & Stock Growth"
            }
            subtitle={
              lang === "nl"
                ? "Maandelijkse omzet en voorraadniveau"
                : "Monthly revenue and stock level"
            }
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={monthly}
                margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="revenue"
                  tickFormatter={kFmt}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="stock"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[10, 30]}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload as unknown as Array<{ name: string; value: number; color: string }>}
                      label={label as string}
                      formatter={(v) =>
                        v >= 1000 ? eurFmt(v) : String(v)
                      }
                    />
                  )}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  name={lang === "nl" ? "Omzet" : "Revenue"}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                  animationDuration={1200}
                />
                <Line
                  yAxisId="stock"
                  type="monotone"
                  dataKey="vehicles"
                  name={lang === "nl" ? "Voorraad" : "Stock"}
                  stroke={BRAND}
                  strokeWidth={2}
                  dot={{ r: 3, fill: BRAND, strokeWidth: 0 }}
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Export footer ────────────────────────────────────────────── */}
        <div className="mt-8 bg-white rounded-xl border border-border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold">
              {t("reports.exportData")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("reports.downloadReports")}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#143954] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              {t("reports.exportCSV")}
            </button>
            <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors">
              {t("reports.exportPDF")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Subcomponents ───────────────────────────────────────────────────────────

function KPICard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  delta,
  deltaLabel,
  positiveIsGood,
  deltaFormat,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  delta: number;
  deltaLabel: string;
  positiveIsGood: boolean;
  deltaFormat?: (v: number) => string;
}) {
  const isGood = positiveIsGood ? delta >= 0 : delta <= 0;
  const arrow = delta > 0 ? (
    <ArrowUpRight className="w-3 h-3" />
  ) : delta < 0 ? (
    <ArrowDownRight className="w-3 h-3" />
  ) : null;

  const deltaStr = deltaFormat
    ? deltaFormat(Math.abs(delta))
    : Math.abs(delta).toString();

  return (
    <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}>
          {icon}
        </div>
        {delta !== 0 && (
          <div
            className={`flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-md ${
              isGood
                ? "text-green-700 bg-green-50"
                : "text-red-600 bg-red-50"
            }`}
          >
            {arrow}
            {deltaStr}
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          {label}
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-6 animate-fade-in">
      <div className="mb-5">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
