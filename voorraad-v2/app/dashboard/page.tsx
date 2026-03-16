"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchVehicles, computeKPIs, BRANCHES } from "@/lib/data-supabase";
import { Vehicle, FilterState } from "@/types";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { LangToggle } from "@/components/ui/LangToggle";
import { KPIBar } from "@/components/dashboard/KPIBar";
import { VehicleCard } from "@/components/dashboard/VehicleCard";
import { VehicleDetail } from "@/components/dashboard/VehicleDetail";
import { Search, Filter, X, ChevronDown, Truck, BarChart3 } from "lucide-react";

const DEMO_USER = { name: "Thomas de Vries", role: "Manager", initials: "TD" };

const BRAND_OPTIONS = [
  ["all", "All brands"],
  ["MAN", "MAN"],
  ["VW", "VW"],
  ["Ford", "Ford"],
  ["Renault", "Renault"],
  ["Mercedes-Benz", "Merc."],
  ["Peugeot", "Peugeot"],
  ["Citroën", "Citroën"],
  ["Toyota", "Toyota"],
  ["Škoda", "Škoda"],
  ["Opel", "Opel"],
] as [string, string][];

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLang();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({ branch:"all", type:"all", brand:"all", status:"all", search:"" });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchVehicles().then(data => {
      setVehicles(data);
      if (data.length > 0) setSelectedId(data[0].id);
      setLoading(false);
    });
  }, []);

  const getFilteredVehicles = () => {
    if (!vehicles || vehicles.length === 0) return [];
    let v = [...vehicles];
    if (filters.branch !== "all") v = v.filter(x => x.branch === filters.branch);
    if (filters.type !== "all") v = v.filter(x => x.type === filters.type);
    if (filters.brand !== "all") v = v.filter(x => x.brand === filters.brand);
    if (filters.status !== "all") v = v.filter(x => x.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      v = v.filter(x =>
        x.name.toLowerCase().includes(q) ||
        x.id.toLowerCase().includes(q) ||
        x.branch.toLowerCase().includes(q)
      );
    }
    return v;
  };

  const filtered = getFilteredVehicles();
  const kpi = computeKPIs(filtered);
  const selected = vehicles.find(v => v.id === selectedId) ?? null;
  const activeFilters = [filters.branch, filters.type, filters.brand, filters.status].filter(f => f !== "all").length;

  const toggleAction = (vehicleId: string, actionId: string, completed: boolean) => {
    setVehicles(prev => prev.map(v => {
      if (v.id !== vehicleId) return v;
      const newActions = (v.action_items ?? []).map(a =>
        a.id === actionId
          ? { ...a, completed, completed_by: completed ? DEMO_USER.name : null, completed_at: completed ? new Date().toISOString() : null }
          : a
      );
      return { ...v, action_items: newActions, pending_actions: newActions.filter(a => !a.completed).length };
    }));
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F2F3F5]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F2F3F5]">
      <header className="bg-white border-b border-border flex items-center px-4 py-2.5 gap-3 flex-shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center text-white font-bold text-xs">DE</div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold leading-tight">StockInsight</div>
            <div className="text-[10px] text-muted-foreground leading-tight">Den Engelsen Commercial Vehicles</div>
          </div>
        </div>
        <div className="hidden md:block w-px h-5 bg-border mx-1" />
        <nav className="hidden md:flex items-center gap-1">
          <button onClick={() => router.push('/dashboard')} className="px-3 py-1.5 text-xs font-medium text-brand bg-brand/5 rounded-md">{t('nav.dashboard')}</button>
          <button onClick={() => router.push('/reports')} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors">{t('nav.reports')}</button>
          <button onClick={() => router.push('/settings')} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors">{t('nav.settings')}</button>
        </nav>
        <div className="flex-1" />
        <LangToggle />
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-medium">{DEMO_USER.name}</div>
            <div className="text-[10px] text-muted-foreground">{t('label.manager')} · {t('label.allBranches')}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold">
            {DEMO_USER.initials}
          </div>
        </div>
      </header>

      <KPIBar kpi={kpi} />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[340px] flex-shrink-0 flex flex-col bg-white border-r border-border overflow-hidden">
          <div className="p-3 border-b border-border space-y-2 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('filter.search')}
                value={filters.search}
                onChange={e => setFilters(f => ({...f, search: e.target.value}))}
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-secondary rounded-md border-0 outline-none focus:ring-1 focus:ring-brand/30 placeholder:text-muted-foreground"
              />
              {filters.search && (
                <button onClick={() => setFilters(f => ({...f, search:""}))} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(s => !s)}
              className={cn("flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md w-full transition-colors",
                showFilters || activeFilters > 0 ? "bg-brand/5 text-brand" : "text-muted-foreground hover:bg-secondary")}
            >
              <Filter className="w-3 h-3" />
              {t('filter.filters')}
              {activeFilters > 0 && <span className="bg-brand text-white rounded-full px-1.5 text-[10px] leading-4">{activeFilters}</span>}
              <ChevronDown className={cn("w-3 h-3 ml-auto transition-transform", showFilters && "rotate-180")} />
            </button>

            {showFilters && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 animate-fade-in">
                {[
                  { key:"branch", label: t('filter.branch'), opts:[["all", t('filter.allBranches')], ...BRANCHES.map(b=>[b,b])] as [string,string][] },
                  { key:"type", label: t('filter.type'), opts:[["all", t('filter.allTypes')],["truck", t('filter.truck')],["van", t('filter.van')]] as [string,string][] },
                  { key:"brand", label: t('filter.brand'), opts: BRAND_OPTIONS as [string,string][] },
                  { key:"status", label: t('filter.status'), opts:[["all", t('filter.allStatuses')],["green", t('filter.green')],["amber", t('filter.amber')],["red", t('filter.red')]] as [string,string][] },
                ].map(({key, label, opts}) => (
                  <div key={key}>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-0.5">{label}</label>
                    <select
                      value={(filters as any)[key]}
                      onChange={e => setFilters(f => ({...f, [key]: e.target.value}))}
                      className="w-full text-xs bg-secondary border-0 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-brand/30 truncate"
                    >
                      {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
                {activeFilters > 0 && (
                  <button
                    onClick={() => setFilters({branch:"all",type:"all",brand:"all",status:"all",search:""})}
                    className="col-span-2 text-xs text-brand hover:underline text-left px-1"
                  >
                    {t('filter.clearFilters')}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="px-3 py-2 flex items-center justify-between flex-shrink-0 border-b border-border/50">
            <span className="text-[10px] text-muted-foreground">{filtered.length} {t('vehicleList.count')}</span>
            <span className="text-[10px] text-muted-foreground">{t('vehicleList.sortedBy')} ↓</span>
          </div>

          <div className="flex-1 overflow-y-auto thin-scroll">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                <Truck className="w-8 h-8 opacity-20" />
                <span className="text-xs">{t('vehicleList.noVehicles')}</span>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map(v => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    isSelected={selectedId === v.id}
                    onClick={() => setSelectedId(v.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-hidden">
          {selected ? (
            <VehicleDetail vehicle={selected} onToggleAction={toggleAction} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">{t('vehicleList.selectVehicle')}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
