"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { fetchVehicles, computeKPIs, BRANCHES } from "@/lib/data-supabase";
import { Vehicle, FilterState } from "@/types";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { LangToggle } from "@/components/ui/LangToggle";
import { KPIBar } from "@/components/dashboard/KPIBar";
import { VehicleDetail } from "@/components/dashboard/VehicleDetail";
import { Search, Filter, X, ChevronDown, ChevronRight, ChevronUp, Truck, BarChart3, Menu, ArrowLeft, LayoutGrid, List, AlertTriangle, CheckCircle, Clock, ArrowUpDown, Bell, Sparkles, TrendingDown, BarChart, Zap } from "lucide-react";
import { VehicleImage } from "@/components/ui/VehicleImage";
import { AIChat } from "@/components/dashboard/AIChat";

const DEMO_USER = { name: "Thomas de Vries", role: "Manager", initials: "TD" };

type ViewMode = "grid" | "list";
type GroupBy = "none" | "branch" | "brand" | "status";
type SortBy = "days" | "price" | "mileage" | "name";

export default function DashboardPage() {
  const router = useRouter();
  const { t, fmt, fmtKm, lang } = useLang();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({ branch:"all", type:"all", brand:"all", status:"all", search:"" });
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [sortBy, setSortBy] = useState<SortBy>("days");
  const [sortDesc, setSortDesc] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"overview" | "detail">("overview");

  const BRAND_OPTIONS = [
    ["all", t("filter.allBrands")],
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

  useEffect(() => {
    fetchVehicles().then(data => {
      setVehicles(data);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch vehicles:", err);
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

  const sortedVehicles = useMemo(() => {
    const filtered = getFilteredVehicles();
    return [...filtered].sort((a, b) => {
      let val = 0;
      switch (sortBy) {
        case "days": val = b.days_in_stock - a.days_in_stock; break;
        case "price": val = a.price - b.price; break;
        case "mileage": val = a.mileage - b.mileage; break;
        case "name": val = a.name.localeCompare(b.name); break;
        default: val = 0;
      }
      return sortDesc ? -val : val;
    });
  }, [vehicles, filters, sortBy, sortDesc]);

  const groupedVehicles = useMemo(() => {
    if (groupBy === "none") return { "All Vehicles": sortedVehicles };
    
    const groups: Record<string, Vehicle[]> = {};
    sortedVehicles.forEach(v => {
      let key = "";
      switch (groupBy) {
        case "branch": key = v.branch; break;
        case "brand": key = v.brand; break;
        case "status": 
          key = v.status === "green" ? "Ready to Sell" : v.status === "amber" ? "Needs Attention" : "Urgent";
          break;
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(v);
    });
    return groups;
  }, [sortedVehicles, groupBy]);

  const filtered = getFilteredVehicles();
  const kpi = computeKPIs(filtered);
  const selected = vehicles.find(v => v.id === selectedId) ?? null;
  const activeFilters = [filters.branch, filters.type, filters.brand, filters.status].filter(f => f !== "all").length;
  
  const notifications = useMemo(() => {
    return vehicles.filter(v => v.recommended_price && v.recommended_price < v.price).map(v => ({
      id: v.id,
      name: v.name,
      currentPrice: v.price,
      recommendedPrice: v.recommended_price!,
      savings: v.price - v.recommended_price!,
      days: v.days_in_stock,
    }));
  }, [vehicles]);

  const aiInsights = useMemo(() => {
    const insights: { type: string; title: string; description: string; count: number; icon: string }[] = [];
    
    const priceReductionCount = vehicles.filter(v => v.recommended_price && v.recommended_price < v.price).length;
    if (priceReductionCount > 0) {
      insights.push({
        type: 'price',
        title: lang === 'nl' ? 'Prijsverlaging nodig' : 'Price Reduction Needed',
        description: lang === 'nl' ? `${priceReductionCount} voertuigen kunnen geprijsd worden naar marktadvies` : `${priceReductionCount} vehicles can be priced according to market advice`,
        count: priceReductionCount,
        icon: 'TrendingDown',
      });
    }
    
    const criticalCount = vehicles.filter(v => v.days_in_stock > 90).length;
    if (criticalCount > 0) {
      insights.push({
        type: 'critical',
        title: lang === 'nl' ? 'Urgent in voorraad' : 'Critical in Stock',
        description: lang === 'nl' ? `${criticalCount} voertuigen staan meer dan 90 dagen in voorraad` : `${criticalCount} vehicles have been in stock over 90 days`,
        count: criticalCount,
        icon: 'AlertTriangle',
      });
    }
    
    const actionCount = vehicles.reduce((sum, v) => sum + (v.pending_actions || 0), 0);
    if (actionCount > 0) {
      insights.push({
        type: 'action',
        title: lang === 'nl' ? 'Openstaande acties' : 'Pending Actions',
        description: lang === 'nl' ? `${actionCount} acties wachten op actie` : `${actionCount} actions waiting for attention`,
        count: actionCount,
        icon: 'Clock',
      });
    }
    
    const aboveMarketCount = vehicles.filter(v => v.market_delta_pct && v.market_delta_pct > 0).length;
    if (aboveMarketCount > 0) {
      insights.push({
        type: 'market',
        title: lang === 'nl' ? 'Boven marktprijs' : 'Above Market Price',
        description: lang === 'nl' ? `${aboveMarketCount} voertuigen zijn duurder dan de markt` : `${aboveMarketCount} vehicles are priced above market`,
        count: aboveMarketCount,
        icon: 'BarChart3',
      });
    }
    
    return insights;
  }, [vehicles, lang]);

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

  const handleUpdatePrice = (vehicleId: string, newPrice: number) => {
    setVehicles(prev => prev.map(v => {
      if (v.id !== vehicleId) return v;
      const newActions = (v.action_items ?? []).map(a => 
        a.action_type === 'price_reduction'
          ? { ...a, completed: true, completed_by: DEMO_USER.name, completed_at: new Date().toISOString() }
          : a
      );
      return { ...v, price: newPrice, action_items: newActions, pending_actions: newActions.filter(a => !a.completed).length };
    }));
  };

  const handleVehicleSelect = (id: string) => {
    setSelectedId(id);
    setMobileView("detail");
  };

  const handleBackToOverview = () => {
    setMobileView("overview");
    setSelectedId("");
  };

  const FilterButton = ({ value, current, onClick, label }: { value: string; current: string; onClick: () => void; label: string }) => (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all",
        current === value 
          ? "bg-brand text-white shadow-md" 
          : "bg-white border border-border text-muted-foreground hover:bg-secondary"
      )}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t('general.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="bg-white border-b border-border/60 flex items-center px-4 lg:px-6 py-3 gap-3 flex-shrink-0 z-20">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-1.5 -ml-1 hover:bg-secondary rounded-md"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <img src="/logo-shield.svg" alt="Den Engelsen" className="h-9 w-9" />
          <div className="hidden sm:block">
            <div className="text-sm font-bold tracking-tight leading-tight">VoorraadInzicht</div>
            <div className="text-[10px] text-muted-foreground leading-tight tracking-wide uppercase">Den Engelsen Bedrijfswagens</div>
          </div>
        </div>
        <div className="hidden lg:block w-px h-6 bg-border/60 mx-2" />
        <nav className="hidden lg:flex items-center gap-0.5">
          <button onClick={() => router.push('/dashboard')} className="px-3.5 py-1.5 text-xs font-semibold text-brand bg-brand/8 rounded-md border border-brand/15">{t('nav.dashboard')}</button>
          <button onClick={() => router.push('/reports')} className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/80 transition-colors">{t('nav.reports')}</button>
          <button onClick={() => router.push('/settings')} className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/80 transition-colors">{t('nav.settings')}</button>
        </nav>
        <div className="flex-1" />
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-red text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
                {notifications.length}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-border shadow-2xl z-50 max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-border">
                <h3 className="font-semibold text-sm">{lang === 'nl' ? 'Prijsaanbevelingen' : 'Price Recommendations'}</h3>
                <p className="text-xs text-muted-foreground">{notifications.length} {lang === 'nl' ? 'voertuigen kunnen in prijs verlaagd' : 'vehicles can be price reduced'}</p>
              </div>
              <div className="divide-y divide-border">
                {notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => {
                      handleVehicleSelect(n.id);
                      setNotificationsOpen(false);
                    }}
                    className="w-full p-3 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{n.name}</div>
                        <div className="text-xs text-muted-foreground">{n.days} {t('detail.days')}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-brand-red">-{fmt(n.savings)}</div>
                        <div className="text-xs text-muted-foreground">→ {fmt(n.recommendedPrice)}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <LangToggle />
        <div className="hidden sm:flex items-center gap-2.5">
          <div className="text-right">
            <div className="text-xs font-semibold">{DEMO_USER.name}</div>
            <div className="text-[10px] text-muted-foreground">{t('label.manager')} · {t('label.allBranches')}</div>
          </div>
          <div className="w-9 h-9 rounded-full brand-gradient text-white flex items-center justify-center text-xs font-semibold shadow-sm">
            {DEMO_USER.initials}
          </div>
        </div>
      </header>

      <KPIBar kpi={kpi} />

      <div className="flex flex-1 overflow-hidden relative">
        <main className={cn(
          "flex-1 overflow-hidden absolute lg:relative inset-0 transition-transform duration-300",
          mobileView === "overview" ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}>
          <div className="h-full flex flex-col overflow-hidden">
            <div className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border-b border-border flex-shrink-0">
              <button onClick={handleBackToOverview} className="p-1 hover:bg-secondary rounded-md">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium truncate">{t('vehicleList.selectVehicle')}</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 lg:p-5 space-y-4">
                {/* Search + View Toggle */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={t('filter.searchNew')}
                      value={filters.search}
                      onChange={e => setFilters(f => ({...f, search: e.target.value}))}
                      className="w-full pl-9 pr-9 py-2 text-sm bg-white rounded-lg border border-border outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 placeholder:text-muted-foreground/60"
                    />
                    {filters.search && (
                      <button onClick={() => setFilters(f => ({...f, search:""}))} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 bg-white rounded-lg border border-border p-0.5">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={cn("p-1.5 rounded-md transition-all", viewMode === "grid" ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:bg-secondary")}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={cn("p-1.5 rounded-md transition-all", viewMode === "list" ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:bg-secondary")}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Compact Filter Bar */}
                <div className="flex items-center gap-2 overflow-x-auto thin-scroll pb-0.5">
                  <select
                    value={filters.branch}
                    onChange={e => setFilters(f => ({...f, branch: e.target.value as typeof f.branch}))}
                    className={cn("text-xs font-medium rounded-full px-3 py-1.5 outline-none cursor-pointer transition-all border", filters.branch !== "all" ? "bg-brand text-white border-brand" : "bg-white text-foreground border-border hover:border-brand/40")}
                  >
                    <option value="all">{t('filter.allBranches')}</option>
                    {BRANCHES.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                  <select
                    value={filters.type}
                    onChange={e => setFilters(f => ({...f, type: e.target.value as typeof f.type}))}
                    className={cn("text-xs font-medium rounded-full px-3 py-1.5 outline-none cursor-pointer transition-all border", filters.type !== "all" ? "bg-brand text-white border-brand" : "bg-white text-foreground border-border hover:border-brand/40")}
                  >
                    <option value="all">{t('filter.allTypes')}</option>
                    <option value="truck">{t('filter.truck')}</option>
                    <option value="van">{t('filter.van')}</option>
                  </select>
                  <select
                    value={filters.status}
                    onChange={e => setFilters(f => ({...f, status: e.target.value as typeof f.status}))}
                    className={cn("text-xs font-medium rounded-full px-3 py-1.5 outline-none cursor-pointer transition-all border", filters.status !== "all" ? "bg-brand text-white border-brand" : "bg-white text-foreground border-border hover:border-brand/40")}
                  >
                    <option value="all">{t('filter.allStatuses')}</option>
                    <option value="green">{t('filter.ready')}</option>
                    <option value="amber">{t('filter.attention')}</option>
                    <option value="red">{t('filter.urgent')}</option>
                  </select>

                  {activeFilters > 0 && (
                    <button
                      onClick={() => setFilters({branch:"all",type:"all",brand:"all",status:"all",search:""})}
                      className="text-xs text-brand-red font-medium hover:underline whitespace-nowrap flex-shrink-0"
                    >
                      ✕ {t('filter.clearAll')}
                    </button>
                  )}

                  <div className="w-px h-5 bg-border flex-shrink-0 mx-1 hidden sm:block" />

                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortBy)}
                    className="text-xs font-medium bg-white border border-border rounded-full px-3 py-1.5 outline-none cursor-pointer hover:border-brand/40 transition-all flex-shrink-0"
                  >
                    <option value="days">{sortDesc ? t('filter.daysOldest') : t('filter.daysNewest')}</option>
                    <option value="price">{sortDesc ? t('filter.priceHighLow') : t('filter.priceLowHigh')}</option>
                    <option value="mileage">{sortDesc ? t('filter.mileageHighLow') : t('filter.mileageLowHigh')}</option>
                    <option value="name">{sortDesc ? t('filter.nameZA') : t('filter.nameAZ')}</option>
                  </select>
                  <button
                    onClick={() => setSortDesc(d => !d)}
                    className={cn(
                      "p-1.5 rounded-full border transition-all flex-shrink-0",
                      sortDesc ? "bg-brand text-white border-brand" : "bg-white border-border text-muted-foreground hover:border-brand/40"
                    )}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-px h-5 bg-border flex-shrink-0 mx-1 hidden sm:block" />

                  <select
                    value={groupBy}
                    onChange={e => setGroupBy(e.target.value as GroupBy)}
                    className={cn("text-xs font-medium rounded-full px-3 py-1.5 outline-none cursor-pointer transition-all border flex-shrink-0", groupBy !== "none" ? "bg-brand text-white border-brand" : "bg-white text-foreground border-border hover:border-brand/40")}
                  >
                    <option value="none">{t('filter.noGrouping')}</option>
                    <option value="branch">{t('filter.byBranch')}</option>
                    <option value="brand">{t('filter.byBrand')}</option>
                    <option value="status">{t('filter.byStatus')}</option>
                  </select>
                </div>

                <div className="text-xs text-muted-foreground tracking-wide">
                  {t('filter.showing').replace('X', String(sortedVehicles.length)).replace('Y', String(vehicles.length))}
                </div>

                <div className="space-y-6">
                  {Object.entries(groupedVehicles).map(([groupName, groupVehicles]) => (
                    <div key={groupName}>
                      {groupBy !== "none" && (
                        <div className="flex items-center gap-2 mb-3">
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-semibold">{groupName}</span>
                          <span className="text-xs text-muted-foreground">({groupVehicles.length})</span>
                        </div>
                      )}
                      
                      {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {groupVehicles.map((v, i) => (
                            <button
                              key={v.id}
                              onClick={() => handleVehicleSelect(v.id)}
                              className={cn(
                                "bg-white rounded-2xl overflow-hidden text-left hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group",
                                selectedId === v.id ? "ring-2 ring-brand shadow-lg" : "shadow-sm"
                              )}
                              style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                            >
                              <div className="aspect-[16/10] bg-secondary/30 overflow-hidden relative rounded-b-none">
                                <VehicleImage
                                  src={v.image_url}
                                  alt={v.name}
                                  brand={v.brand}
                                  type={v.type}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 !rounded-b-none"
                                />
                                <div className={cn(
                                  "absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-sm",
                                  v.status === "green" && "bg-emerald-500/90 text-white",
                                  v.status === "amber" && "bg-amber-500/90 text-white",
                                  v.status === "red" && "bg-red-500/90 text-white"
                                )}>
                                  {v.days_in_stock}d
                                </div>
                              </div>
                              <div className="p-3.5 space-y-1.5">
                                <h3 className="font-semibold text-[13px] leading-tight truncate">{v.name}</h3>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <span>{v.branch}</span>
                                  <span className="opacity-40">·</span>
                                  <span>{v.year}</span>
                                  <span className="opacity-40">·</span>
                                  <span>{fmtKm(v.mileage)}</span>
                                </div>
                                <div className="font-bold text-[15px] pt-0.5">{fmt(v.price)}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {groupVehicles.map(v => (
                            <button
                              key={v.id}
                              onClick={() => handleVehicleSelect(v.id)}
                              className={cn(
                                "w-full bg-white rounded-lg border border-border p-3 text-left hover:shadow-md transition-all flex items-center gap-3",
                                selectedId === v.id && "ring-2 ring-brand border-brand"
                              )}
                            >
                              <div className="w-16 h-12 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                                <VehicleImage
                                  src={v.image_url}
                                  alt={v.name}
                                  brand={v.brand}
                                  type={v.type}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-sm truncate pr-2">{v.name}</h3>
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0",
                                    v.status === "green" && "bg-green-100 text-green-700",
                                    v.status === "amber" && "bg-amber-100 text-amber-700",
                                    v.status === "red" && "bg-red-100 text-red-700"
                                  )}>
                                    {v.days_in_stock}d
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                                  <span>{v.branch}</span>
                                  <span>·</span>
                                  <span>{v.year}</span>
                                  <span className="hidden sm:inline">·</span>
                                  <span className="whitespace-nowrap">{fmtKm(v.mileage)}</span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 flex flex-col items-end">
                                <div className="font-bold text-sm">{fmt(v.price)}</div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {sortedVehicles.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Truck className="w-16 h-16 opacity-20 mb-4" />
                    <p className="text-lg font-medium">{t('filter.noVehicles')}</p>
                    <p className="text-sm">{t('filter.adjustFilters')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <main className={cn(
          "flex-1 overflow-hidden absolute lg:relative inset-0 transition-transform duration-300",
          mobileView === "detail" ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}>
          {selected ? (
            <div className="h-full overflow-hidden">
              <VehicleDetail vehicle={selected} onToggleAction={toggleAction} onUpdatePrice={handleUpdatePrice} onClose={handleBackToOverview} />
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-5 lg:p-6">
              <div className="brand-gradient rounded-2xl p-5 mb-6 text-white shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold mb-0.5">
                      AI Insights
                    </h2>
                    <p className="text-sm text-white/80">
                      {lang === 'nl'
                        ? `Analyse van ${vehicles.length} voertuigen in uw voorraad`
                        : `Analysis of ${vehicles.length} vehicles in your inventory`
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {aiInsights.map((insight, idx) => (
                  <div 
                    key={idx}
                    className="bg-white rounded-xl border border-border p-4 hover:border-brand/30 transition-colors cursor-pointer"
                    onClick={() => {
                      if (insight.type === 'price') {
                        setSortBy('days');
                        setSortDesc(false);
                        setFilters(f => ({...f, status: 'all', branch: 'all', type: 'all', brand: 'all'}));
                      } else if (insight.type === 'critical') {
                        setFilters(f => ({...f, status: 'red'}));
                      } else if (insight.type === 'action') {
                        setSortBy('days');
                        setSortDesc(false);
                        setFilters(f => ({...f, status: 'all', branch: 'all', type: 'all', brand: 'all'}));
                      } else if (insight.type === 'market') {
                        setSortBy('price');
                        setSortDesc(true);
                        setFilters(f => ({...f, status: 'all', branch: 'all', type: 'all', brand: 'all'}));
                      }
                      // Select the first relevant vehicle
                      const relevant = insight.type === 'critical'
                        ? vehicles.filter(v => v.days_in_stock > 90)
                        : insight.type === 'price'
                        ? vehicles.filter(v => v.recommended_price && v.recommended_price < v.price)
                        : insight.type === 'action'
                        ? vehicles.filter(v => v.pending_actions > 0)
                        : vehicles;
                      if (relevant.length > 0) {
                        handleVehicleSelect(relevant[0].id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        insight.type === 'price' && "bg-red-100",
                        insight.type === 'critical' && "bg-red-100",
                        insight.type === 'action' && "bg-amber-100",
                        insight.type === 'market' && "bg-blue-100"
                      )}>
                        {insight.type === 'price' && <TrendingDown className="w-5 h-5 text-red-600" />}
                        {insight.type === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                        {insight.type === 'action' && <Clock className="w-5 h-5 text-amber-600" />}
                        {insight.type === 'market' && <BarChart3 className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">{insight.title}</h3>
                          <span className={cn(
                            "text-lg font-bold",
                            insight.type === 'price' && "text-red-600",
                            insight.type === 'critical' && "text-red-600",
                            insight.type === 'action' && "text-amber-600",
                            insight.type === 'market' && "text-blue-600"
                          )}>{insight.count}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {aiInsights.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                    <p className="font-medium">Alles ziet er goed uit!</p>
                    <p className="text-sm">Geen acties nodig momenteel.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl animate-in slide-in-from-left">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="text-sm font-semibold">Menu</div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-secondary rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-2">
              <button 
                onClick={() => { router.push('/dashboard'); setMobileMenuOpen(false); }} 
                className="w-full text-left px-3 py-2 text-sm font-medium text-brand bg-brand/5 rounded-md"
              >
                {t('nav.dashboard')}
              </button>
              <button 
                onClick={() => { router.push('/reports'); setMobileMenuOpen(false); }} 
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md"
              >
                {t('nav.reports')}
              </button>
              <button 
                onClick={() => { router.push('/settings'); setMobileMenuOpen(false); }} 
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md"
              >
                {t('nav.settings')}
              </button>
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold">
                  {DEMO_USER.initials}
                </div>
                <div>
                  <div className="text-sm font-medium">{DEMO_USER.name}</div>
                  <div className="text-xs text-muted-foreground">{DEMO_USER.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AIChat
        vehicles={vehicles}
        kpis={kpi}
        onSelectVehicle={handleVehicleSelect}
        lang={lang}
      />
    </div>
  );
}
