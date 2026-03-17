"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Truck, BarChart3, ChevronLeft, Download, Calendar, TrendingUp, TrendingDown, Euro, Package, AlertCircle, Clock, Flame } from "lucide-react";
import { LangToggle } from "@/components/ui/LangToggle";
import { useLang } from "@/lib/i18n";
import { fetchVehicles, computeKPIs, BRANCHES } from "@/lib/data-supabase";
import { Vehicle } from "@/types";

const DEMO_USER = { name: "Thomas de Vries", role: "Manager", initials: "TD" };

type ReportPeriod = "march" | "february" | "january";

const HISTORICAL_DATA: Record<ReportPeriod, { vehicles: number; revenue: number; avgDays: number }> = {
  march: { vehicles: 24, revenue: 1250000, avgDays: 38 },
  february: { vehicles: 22, revenue: 980000, avgDays: 42 },
  january: { vehicles: 21, revenue: 890000, avgDays: 45 },
};

export default function ReportsPage() {
  const router = useRouter();
  const { t, fmt } = useLang();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("march");

  useMemo(() => {
    fetchVehicles().then(data => {
      setVehicles(data);
      setLoading(false);
    });
  }, []);

  const branchStats = useMemo(() => {
    const stats: Record<string, { vehicles: number; totalValue: number; avgDays: number; critical: number }> = {};
    BRANCHES.forEach(branch => {
      const branchVehicles = vehicles.filter(v => v.branch === branch);
      stats[branch] = {
        vehicles: branchVehicles.length,
        totalValue: branchVehicles.reduce((s, v) => s + v.price, 0),
        avgDays: Math.round(branchVehicles.reduce((s, v) => s + v.days_in_stock, 0) / (branchVehicles.length || 1)),
        critical: branchVehicles.filter(v => v.days_in_stock > 90).length,
      };
    });
    return stats;
  }, [vehicles]);

  const kpi = useMemo(() => computeKPIs(vehicles), [vehicles]);
  const historical = HISTORICAL_DATA[selectedPeriod];

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Branch", "Brand", "Type", "Price", "Days in Stock", "Status", "Mileage", "Year"];
    const rows = vehicles.map(v => [
      v.id, v.name, v.branch, v.brand, v.type, v.price, v.days_in_stock, v.status, v.mileage, v.year
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E2E8F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E2E8F0]">
      <header className="bg-white border-b border-border flex items-center px-4 py-2.5 gap-3">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /> {t('nav.back')}
        </button>
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Den Engelsen" className="h-8 w-auto" />
          <div>
            <div className="text-sm font-semibold leading-tight">StockInsight</div>
            <div className="text-[10px] text-muted-foreground leading-tight">Den Engelsen Commercial Vehicles</div>
          </div>
        </div>
        <div className="flex-1" />
        <LangToggle />
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-medium">{DEMO_USER.name}</div>
            <div className="text-[10px] text-muted-foreground">{DEMO_USER.role} · {t('label.allBranches')}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold">
            {DEMO_USER.initials}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-xl font-bold mb-6">{t('nav.reports')}</h1>
        
        <div className="grid gap-6">
          {/* KPI Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-brand" />
                <span className="text-xs text-muted-foreground">{t('kpi.totalVehicles')}</span>
              </div>
              <div className="text-2xl font-bold">{kpi.total_vehicles}</div>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-red-500" />
                <span className="text-xs text-muted-foreground">{t('kpi.totalInterestCost')}</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{fmt(kpi.total_interest_cost)}</div>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">{t('kpi.actionRequired')}</span>
              </div>
              <div className="text-2xl font-bold">{kpi.needs_action}</div>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{t('kpi.avgDays')}</span>
              </div>
              <div className="text-2xl font-bold">{kpi.avg_days}d</div>
            </div>
          </div>

          {/* Monthly Stock Report */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">{t('reports.monthlyStock')}</h2>
                <p className="text-xs text-muted-foreground">{t('reports.stockOverview')}</p>
              </div>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex gap-2 mb-4">
              {(["march", "february", "january"] as ReportPeriod[]).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    selectedPeriod === period 
                      ? "bg-brand text-white" 
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {t(`reports.${period}`)} 2026
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold">{historical.vehicles}</div>
                <div className="text-xs text-muted-foreground">Vehicles in stock</div>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold">{fmt(historical.revenue)}</div>
                <div className="text-xs text-muted-foreground">Total value</div>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold">{historical.avgDays}d</div>
                <div className="text-xs text-muted-foreground">Avg. days in stock</div>
              </div>
            </div>
          </div>

          {/* Interest Cost Analysis */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">{t('reports.interestCost')}</h2>
                <p className="text-xs text-muted-foreground">{t('reports.financialImpact')}</p>
              </div>
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
              <div>
                <div className="text-xs text-red-600">{t('reports.totalInterest')}</div>
                <div className="text-3xl font-bold text-red-700">{fmt(kpi.total_interest_cost)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-red-600">Daily cost</div>
                <div className="text-xl font-semibold text-red-700">{fmt(Math.round(kpi.total_interest_cost / 30))}/day</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between p-2 bg-secondary/50 rounded">
                <span className="text-muted-foreground">Above market</span>
                <span className="font-medium">+{kpi.avg_market_delta}%</span>
              </div>
              <div className="flex justify-between p-2 bg-secondary/50 rounded">
                <span className="text-muted-foreground">Critical vehicles</span>
                <span className="font-medium text-red-600">{kpi.critical}</span>
              </div>
            </div>
          </div>

          {/* Branch Performance */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">{t('reports.branchPerformance')}</h2>
                <p className="text-xs text-muted-foreground">{t('reports.performanceByLocation')}</p>
              </div>
              <Truck className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {Object.entries(branchStats).map(([branch, stats]) => (
                <div key={branch} className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-brand/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{branch}</div>
                      <div className="text-xs text-muted-foreground">{stats.vehicles} vehicles</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{fmt(stats.totalValue)}</div>
                    <div className="text-xs text-muted-foreground">Avg: {stats.avgDays}d</div>
                  </div>
                  {stats.critical > 0 && (
                    <div className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      {stats.critical} urgent
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Export Data */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">{t('reports.exportData')}</h2>
                <p className="text-xs text-muted-foreground">{t('reports.downloadReports')}</p>
              </div>
              <Download className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleExportCSV}
                className="px-4 py-2 text-sm font-medium brand-gradient text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                {t('reports.exportCSV')}
              </button>
              <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors">
                {t('reports.exportPDF')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
