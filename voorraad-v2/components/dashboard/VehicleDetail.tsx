"use client";
import { Vehicle, ActionItem, ActionType } from "@/types";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { VehicleImage } from "@/components/ui/VehicleImage";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Calendar, Gauge, TrendingDown, TrendingUp, CheckCircle2, Circle,
  ExternalLink, AlertTriangle, Flame, ArrowDownRight, Camera,
  Phone, Globe, BarChart2, Clock, Sparkles
} from "lucide-react";

interface Props {
  vehicle: Vehicle;
  onToggleAction: (vehicleId: string, actionId: string, completed: boolean) => void;
}

const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
  price_reduction: <TrendingDown className="w-4 h-4" />,
  photo_update:    <Camera className="w-4 h-4" />,
  call_prospect:   <Phone className="w-4 h-4" />,
  export_platform: <Globe className="w-4 h-4" />,
};

export function VehicleDetail({ vehicle: v, onToggleAction }: Props) {
  const { t, fmt, fmtKm, lang } = useLang();
  
  const STATUS_MAP = {
    green: { label: t("status.onTrack"), badge: "green" as const, bar: "bar-green" },
    amber: { label: t("status.attention"), badge: "amber" as const, bar: "bar-amber" },
    red:   { label: t("status.actionRequired"), badge: "red" as const, bar: "bar-red" },
  };

  const ACTION_LABELS: Record<string, string> = {
    price_reduction: t("actions.priceReduction"),
    photo_update: t("actions.photoUpdate"),
    call_prospect: t("actions.callProspect"),
    export_platform: t("actions.exportPlatform"),
  };

  const ACTION_DESCS: Record<string, string> = {
    price_reduction: lang === "nl" ? "Voertuig is >30 dagen in voorraad. Pas prijs aan op basis van marktadvies." : "Vehicle has been in stock >30 days. Adjust price based on market recommendation.",
    photo_update: lang === "nl" ? "Voertuig is >45 dagen in voorraad. Nieuwe foto's verhogen interesse met ~22%." : "Vehicle has been in stock >45 days. Fresh photos increase interest by ~22%.",
    call_prospect: lang === "nl" ? "Voertuig is >60 dagen in voorraad. Volg op met eerder geïnteresseerde kopers." : "Vehicle has been in stock >60 days. Follow up with previously interested buyers.",
    export_platform: lang === "nl" ? "Voertuig is >90 dagen in voorraad. Plaats op TruckScout24 of Truck1.eu." : "Vehicle has been in stock >90 days. List on TruckScout24 or Truck1.eu.",
  };

  const sm = STATUS_MAP[v.status as keyof typeof STATUS_MAP] || STATUS_MAP.green;
  const pct = Math.min(100, (v.days_in_stock / 90) * 100);
  const pending  = (v.action_items ?? []).filter(a => !a.completed);
  const completed = (v.action_items ?? []).filter(a => a.completed);
  const avgMarket = Math.round(v.market_listings.reduce((s, l) => s + l.price, 0) / v.market_listings.length);
  const cheapest  = Math.min(...v.market_listings.map(l => l.price));
  const maxPrice  = Math.max(v.price, ...v.market_listings.map(l => l.price));

  return (
    <div className="h-full flex flex-col overflow-hidden animate-slide-in-right">
      <Tabs defaultValue="overview" className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-white border-b border-border px-5 py-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-start gap-3 min-w-0">
              <VehicleImage
                src={v.image_url}
                alt={v.name}
                brand={v.brand}
                type={v.type}
                className="w-20 h-14 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <h2 className="text-sm font-semibold truncate">{v.name}</h2>
                  <Badge variant={sm.badge} className="text-[10px]">{sm.label}</Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{v.category === "new" ? t("status.new") : t("status.used")}</Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="mono text-[10px] text-muted-foreground/60">{v.id}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{v.branch}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{v.year}</span>
                  <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{fmtKm(v.mileage)}</span>
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-[10px] text-muted-foreground mb-1">{t("detail.askingPrice")}</div>
              <div className="text-xl font-bold text-foreground">{fmt(v.price)}</div>
              {v.recommended_price && v.recommended_price < v.price ? (
                <div className="mt-2 bg-gradient-to-r from-brand/10 to-red-50 border border-brand/20 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingDown className="w-3.5 h-3.5 text-brand" />
                    <span className="text-[10px] font-semibold text-brand uppercase tracking-wide">{t("detail.advised")}</span>
                  </div>
                  <div className="text-lg font-bold text-brand">{fmt(v.recommended_price)}</div>
                  <div className="text-[10px] text-red-600 mt-0.5">
                    Save {fmt(v.price - v.recommended_price)} ({(Math.round((v.price - v.recommended_price) / v.price * 100))}%)
                  </div>
                </div>
              ) : v.recommended_price ? (
                <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Well Priced</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-700">{fmt(v.recommended_price)}</div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{v.days_in_stock} {t("detail.days")}</span>
              <span className="text-muted-foreground">({t("detail.inStock")})</span>
            </div>
            <div className="relative h-1.5 w-32 bg-secondary rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", sm.bar)} style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        <TabsList className="px-5 border-b border-border bg-white flex-shrink-0 justify-start gap-1 h-auto py-2">
          <TabsTrigger value="overview" className="text-xs px-3">{t("tab.overview")}</TabsTrigger>
          <TabsTrigger value="actions" className="text-xs px-3">{t("tab.actions")}</TabsTrigger>
          <TabsTrigger value="market" className="text-xs px-3">{t("tab.market")}</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto thin-scroll">
          <TabsContent value="overview" className="m-0 p-5 space-y-6">
            {/* Price Advice Section */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                {t("overview.priceAdvice")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-4 border-2 border-border shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">€</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("overview.currentPrice")}</div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{fmt(v.price)}</div>
                </div>
                <div className={cn(
                  "rounded-xl p-4 border-2 shadow-sm",
                  v.recommended_price && v.recommended_price < v.price 
                    ? "bg-gradient-to-br from-brand/5 to-red-50 border-brand/30" 
                    : "bg-emerald-50 border-emerald-200"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      v.recommended_price && v.recommended_price < v.price ? "bg-brand" : "bg-emerald-500"
                    )}>
                      {v.recommended_price && v.recommended_price < v.price ? (
                        <TrendingDown className="w-4 h-4 text-white" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={cn(
                      "text-[10px] uppercase tracking-wide",
                      v.recommended_price && v.recommended_price < v.price ? "text-brand" : "text-emerald-700"
                    )}>
                      {t("overview.marketPosition")}
                    </div>
                  </div>
                  <div className={cn(
                    "text-2xl font-bold",
                    v.recommended_price && v.recommended_price < v.price ? "text-brand" : "text-emerald-700"
                  )}>
                    {v.recommended_price ? fmt(v.recommended_price) : t("overview.marketRate")}
                  </div>
                  {v.recommended_price && (
                    <div className={cn(
                      "text-[10px] mt-1",
                      v.recommended_price < v.price ? "text-red-600" : "text-emerald-600"
                    )}>
                      {v.recommended_price < v.price ? "-" : "+"}{Math.abs(v.market_delta_pct)}% {t("overview.vsMarket")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interest Cost */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("overview.interestToDate")}</h3>
              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-red-700">{t("overview.financing")}</span>
                  </div>
                  <span className="text-lg font-semibold text-red-700 mono">{fmt(v.interest_cost)}</span>
                </div>
                <div className="text-[10px] text-red-600/70">
                  {t("overview.costPerDay")}: {fmt(Math.round(v.interest_cost / v.days_in_stock))}/day
                </div>
              </div>
            </div>

            {/* Price Reduction Logic */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("overview.priceReduction")}</h3>
              <div className="space-y-2">
                {[
                  { days: 30, pct: 2 },
                  { days: 45, pct: 4 },
                  { days: 90, pct: 6 },
                ].map(({ days, pct }) => (
                  <div key={days} className={cn("flex items-center justify-between px-3 py-2 rounded-lg text-xs border", v.days_in_stock >= days ? "bg-brand/5 text-brand border-brand/20" : "bg-white text-muted-foreground border-border")}>
                    <span>{t("overview.after")} {days} {t("overview.days")}</span>
                    <span className="font-semibold">-{pct}% = {fmt(Math.round(v.price * (1 - pct / 100)))}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Details */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("overview.vehicleDetails")}</h3>
              <div className="bg-white rounded-lg p-3 space-y-2 text-xs border border-border">
                <div className="flex justify-between"><span className="text-muted-foreground">{t("overview.id")}</span><span className="font-medium mono">{v.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("overview.brand")}</span><span className="font-medium">{v.brand}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("overview.type")}</span><span className="font-medium capitalize">{v.type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("overview.year")}</span><span className="font-medium">{v.year}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("overview.mileage")}</span><span className="font-medium">{fmtKm(v.mileage)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("overview.category")}</span><span className="font-medium">{v.category === "new" ? t("status.new") : t("status.used")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("overview.branch")}</span><span className="font-medium">{v.branch}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("overview.inStockSince")}</span><span className="font-medium">{new Date(v.date_added).toLocaleDateString(lang === "nl" ? "nl-NL" : "en-GB")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("overview.daysInStock")}</span><span className="font-medium">{v.days_in_stock} {t("detail.days")}</span></div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="m-0 p-5">
            <div className="space-y-4">
              {pending.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("actions.openActions")}</h3>
                  <div className="space-y-2">
                    {pending.map(action => (
                      <button
                        key={action.id}
                        onClick={() => onToggleAction(v.id, action.id, true)}
                        className="w-full flex items-start gap-3 p-3 bg-white border border-border rounded-lg hover:border-brand/30 hover:bg-brand/5 transition-colors text-left"
                      >
                        <Circle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {ACTION_ICONS[action.action_type]}
                            <span className="text-xs font-medium">{ACTION_LABELS[action.action_type]}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">{ACTION_DESCS[action.action_type]}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {completed.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("actions.completed")}</h3>
                  <div className="space-y-2">
                    {completed.map(action => (
                      <div key={action.id} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {ACTION_ICONS[action.action_type]}
                            <span className="text-xs font-medium line-through">{ACTION_LABELS[action.action_type]}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {t("actions.completedBy")} {action.completed_by} • {action.completed_at ? new Date(action.completed_at).toLocaleDateString(lang === "nl" ? "nl-NL" : "en-GB") : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pending.length === 0 && completed.length === 0 && (
                <div className="text-center py-8">
                  <AlertTriangle className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">{t("actions.noActions")}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{t("actions.noActionsDesc")}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="market" className="m-0 p-5">
            <div className="space-y-6">
              {/* Price Comparison Bars */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("market.priceComparison")}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{t("market.ourPrice")}</span>
                      <span className="font-semibold mono">{fmt(v.price)}</span>
                    </div>
                    <div className="h-2 bg-brand rounded-full" style={{ width: `${(v.price / maxPrice) * 100}%` }} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{t("market.avgMarket")}</span>
                      <span className="font-semibold mono">{fmt(avgMarket)}</span>
                    </div>
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${(avgMarket / maxPrice) * 100}%` }} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{t("market.cheapestCompetitor")}</span>
                      <span className="font-semibold mono">{fmt(cheapest)}</span>
                    </div>
                    <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${(cheapest / maxPrice) * 100}%` }} />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {t("market.weAre")} {v.price > avgMarket ? `${v.price - avgMarket} (${t("market.moreExpensive")})` : `${avgMarket - v.price} (${t("market.cheaper")})`}
                </p>
              </div>

              {/* Live Listings */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("market.liveListings")}</h3>
                <p className="text-[10px] text-muted-foreground mb-2">{t("market.simulated")}</p>
                <div className="space-y-2">
                  {v.market_listings.map((listing, i) => (
                    <a
                      key={i}
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white border border-border rounded-lg hover:border-brand/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs font-medium">{listing.source}</div>
                          <div className="text-[10px] text-muted-foreground">{listing.location} • {listing.days_online}d online</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold mono">{fmt(listing.price)}</div>
                        <div className="text-[10px] text-muted-foreground">{listing.year} • {fmtKm(listing.mileage)}</div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground ml-2" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
