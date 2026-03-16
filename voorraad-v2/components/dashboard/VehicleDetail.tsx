"use client";
import { Vehicle, ActionItem, ActionType } from "@/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Calendar, Gauge, TrendingDown, CheckCircle2, Circle,
  ExternalLink, AlertTriangle, Flame, ArrowDownRight, Camera,
  Phone, Globe, Info, BarChart2, Clock, Zap
} from "lucide-react";

interface Props {
  vehicle: Vehicle;
  onToggleAction: (vehicleId: string, actionId: string, completed: boolean) => void;
}

export function VehicleDetail({ vehicle: v, onToggleAction }: Props) {
  const { t, formatCurrency, formatKm, language } = useLanguage();
  
  const STATUS_MAP = {
    green: { label: t('status.onTrack'), badge: "green" as const, bar: "bar-green" },
    amber: { label: t('status.attention'), badge: "amber" as const, bar: "bar-amber" },
    red:   { label: t('status.actionRequired'), badge: "red" as const, bar: "bar-red" },
  };

  const ACTION_LABELS: Record<string, string> = {
    price_reduction: t('action.priceReduction'),
    photo_update: t('action.photoUpdate'),
    call_prospect: t('action.callProspect'),
    export_platform: t('action.exportPlatform'),
  };

  const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
    price_reduction: <TrendingDown className="w-4 h-4" />,
    photo_update:    <Camera className="w-4 h-4" />,
    call_prospect:   <Phone className="w-4 h-4" />,
    export_platform: <Globe className="w-4 h-4" />,
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
      {/* Header */}
      <div className="bg-white border-b border-border px-5 py-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            {v.image_url ? (
              <div className="w-20 h-14 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                <img 
                  src={v.image_url} 
                  alt={v.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x250/f5f5f5/999?text=No+Image';
                  }}
                />
              </div>
            ) : (
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 border",
                v.brand === "MAN" ? "bg-red-50 text-brand border-red-100" : "bg-blue-50 text-blue-700 border-blue-100"
              )}>{v.brand}</div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <h2 className="text-sm font-semibold truncate">{v.name}</h2>
                <Badge variant={sm.badge} className="text-[10px]">{sm.label}</Badge>
                <Badge variant="outline" className="text-[10px] capitalize">{v.category}</Badge>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="mono text-[10px] text-muted-foreground/60">{v.id}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{v.branch}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{v.year}</span>
                <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{formatKm(v.mileage)}</span>
              </div>
            </div>
          </div>

          {/* Right stats */}
          <div className="flex items-start gap-4 flex-shrink-0">
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground">Asking price</div>
              <div className="text-lg font-semibold mono">{formatCurrency(v.price)}</div>
              {v.discount_pct > 0 && (
                <div className="text-[10px] text-brand flex items-center gap-0.5 justify-end">
                  <ArrowDownRight className="w-3 h-3" />Advised: {formatCurrency(v.recommended_price)}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground">In stock</div>
              <div className={cn("text-lg font-semibold mono",
                v.status === "red" ? "text-red-600" : v.status === "amber" ? "text-amber-600" : "text-foreground"
              )}>{v.days_in_stock}<span className="text-xs font-normal text-muted-foreground ml-0.5">d</span></div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground">Interest cost</div>
              <div className="text-lg font-semibold mono text-red-600 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />{formatCurrency(v.interest_cost)}
              </div>
              <div className="text-[10px] text-muted-foreground">@ 5.5% p.a.</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>0d</span>
            <div className="flex gap-3">
              {[["30d","bg-emerald-400"],["45d","bg-amber-400"],["90d","bg-red-500"]].map(([l,c])=>(
                <span key={l} className="flex items-center gap-1">
                  <span className={cn("w-1.5 h-1.5 rounded-full inline-block", c)} />{l}
                </span>
              ))}
            </div>
          </div>
          <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="absolute left-[33.3%] top-0 w-px h-full bg-emerald-300/40 z-10" />
            <div className="absolute left-[50%]   top-0 w-px h-full bg-amber-300/40 z-10" />
            <div className={cn("h-full rounded-full", sm.bar)} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="h-8 w-full">
            <TabsTrigger value="overview" className="flex-1 text-xs h-6">Overview</TabsTrigger>
            <TabsTrigger value="actions" className="flex-1 text-xs h-6">
              Actions {pending.length > 0 && (
                <span className="ml-1 bg-brand text-white rounded-full px-1.5 text-[10px] leading-4 inline-block">{pending.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="market" className="flex-1 text-xs h-6">Market Analysis</TabsTrigger>
          </TabsList>

          {/* ─── Overview ─────────────────── */}
          <TabsContent value="overview" className="mt-3">
            <div className="space-y-3 overflow-y-auto thin-scroll animate-fade-in pr-1" style={{ maxHeight: "calc(100vh - 350px)" }}>
              {v.discount_pct > 0 && (
                <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">Price advice: </span>
                    Reduce from <strong>{formatCurrency(v.price)}</strong> to <strong>{formatCurrency(v.recommended_price)}</strong> (-{v.discount_pct}%) based on {v.days_in_stock} days in stock.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <MetricBox label="Current price" value={formatCurrency(v.price)} />
                <MetricBox
                  label="Market position"
                  value={v.market_delta_pct > 5 ? "Overpriced" : v.market_delta_pct > 0 ? "Market rate" : "Good value"}
                  valueClass={v.market_delta_pct > 5 ? "text-red-600" : "text-emerald-600"}
                  sub={`${v.market_delta_pct > 0 ? "+" : ""}${v.market_delta_pct}% vs market`}
                />
                <MetricBox
                  label="Advised price"
                  value={formatCurrency(v.recommended_price)}
                  valueClass={v.discount_pct > 0 ? "text-brand" : "text-emerald-600"}
                  sub={v.discount_pct > 0 ? `-${v.discount_pct}%` : "No adjustment needed"}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <MetricBox
                  label="Interest cost to date"
                  value={formatCurrency(v.interest_cost)}
                  valueClass="text-red-600"
                  sub="5.5% p.a. financing"
                  icon={<Flame className="w-3 h-3 text-red-500 mr-0.5" />}
                />
                <MetricBox
                  label="Cost per day"
                  value={formatCurrency(Math.round((v.price * 0.055) / 365))}
                  valueClass="text-red-500"
                  sub={`×${v.days_in_stock}d = ${formatCurrency(v.interest_cost)}`}
                />
              </div>

              {/* Pricing rules */}
              <div className="rounded-xl border border-border bg-white overflow-hidden">
                <div className="px-3.5 py-2 border-b border-border flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-semibold">Price reduction logic</span>
                </div>
                <div className="p-3 space-y-1.5">
                  {[{days:30,pct:2},{days:45,pct:4},{days:90,pct:6}].map(r => {
                    const active = v.days_in_stock >= r.days;
                    return (
                      <div key={r.days} className={cn(
                        "flex items-center justify-between px-3 py-1.5 rounded-lg text-xs",
                        active ? "bg-brand/5 border border-brand/15" : "bg-secondary/40"
                      )}>
                        <div className="flex items-center gap-1.5">
                          {active ? <CheckCircle2 className="w-3 h-3 text-brand" /> : <Circle className="w-3 h-3 text-muted-foreground" />}
                          <span className={active ? "font-medium text-brand" : "text-muted-foreground"}>After {r.days} days</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-semibold", active ? "text-brand" : "text-muted-foreground")}>-{r.pct}%</span>
                          {active && <span className="mono text-[10px] text-muted-foreground">{formatCurrency(Math.round(v.price*(1-r.pct/100)))}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Specs grid */}
              <div className="rounded-xl border border-border bg-white overflow-hidden">
                <div className="px-3.5 py-2 border-b border-border">
                  <span className="text-xs font-semibold">Vehicle details</span>
                </div>
                <div className="p-3.5 grid grid-cols-3 gap-3">
                  {[
                    ["ID", v.id, true],
                    ["Brand", v.brand === "VW" ? "Volkswagen" : "MAN", false],
                    ["Type", v.type === "truck" ? "Truck" : "Van", false],
                    ["Year", String(v.year), false],
                    ["Mileage", formatKm(v.mileage), false],
                    ["Category", v.category === "new" ? "New" : "Used", false],
                    ["Branch", v.branch, false],
                    ["In stock since", new Date(v.date_added).toLocaleDateString("en-GB"), false],
                    ["Days in stock", `${v.days_in_stock} days`, true],
                  ].map(([l,val,hi])=>(
                    <div key={l as string}>
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{l}</div>
                      <div className={cn("text-xs font-medium mono", hi ? "text-brand" : "")}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── Actions ───────────────────── */}
          <TabsContent value="actions" className="mt-3">
            <div className="space-y-3 overflow-y-auto thin-scroll animate-fade-in pr-1" style={{ maxHeight: "calc(100vh - 350px)" }}>
              {pending.length === 0 && completed.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                  <p className="text-sm font-medium">No actions required</p>
                  <p className="text-xs mt-0.5">Vehicle has been in stock less than 30 days.</p>
                </div>
              )}

              {pending.length > 0 && (
                <div className="rounded-xl border border-border bg-white overflow-hidden">
                  <div className="px-3.5 py-2 border-b border-border flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-brand" />
                    <span className="text-xs font-semibold">Open actions</span>
                    <span className="ml-auto text-[10px] bg-brand text-white px-2 py-0.5 rounded-full">{pending.length}</span>
                  </div>
                  <div className="divide-y divide-border">
                    {pending.map(a => <ActionRow key={a.id} action={a} vehicle={v} onToggle={onToggleAction} />)}
                  </div>
                </div>
              )}

              {completed.length > 0 && (
                <div className="rounded-xl border border-border bg-white overflow-hidden opacity-60">
                  <div className="px-3.5 py-2 border-b border-border flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs font-semibold text-muted-foreground">Completed</span>
                  </div>
                  <div className="divide-y divide-border">
                    {completed.map(a => <ActionRow key={a.id} action={a} vehicle={v} onToggle={onToggleAction} isDone />)}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ─── Market Analysis ─────────────── */}
          <TabsContent value="market" className="mt-3">
            <div className="space-y-3 overflow-y-auto thin-scroll animate-fade-in pr-1" style={{ maxHeight: "calc(100vh - 350px)" }}>
              <div className="grid grid-cols-3 gap-2">
                <MetricBox label="Our asking price" value={formatCurrency(v.price)} />
                <MetricBox
                  label="Avg. market (3 platforms)"
                  value={formatCurrency(avgMarket)}
                  sub="AutoScout24 · Gaspedaal · Marktplaats"
                />
                <MetricBox
                  label="Cheapest competitor"
                  value={formatCurrency(cheapest)}
                  valueClass={cheapest < v.price ? "text-red-600" : "text-emerald-600"}
                  sub={cheapest < v.price ? `We are ${formatCurrency(v.price - cheapest)} more expensive` : "We are cheapest"}
                />
              </div>

              {/* Bar chart */}
              <div className="rounded-xl border border-border bg-white overflow-hidden">
                <div className="px-3.5 py-2 border-b border-border flex items-center gap-1.5">
                  <BarChart2 className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-semibold">Price comparison</span>
                </div>
                <div className="p-3.5 space-y-2.5">
                  <PriceBar label="Our price" price={v.price} maxPrice={maxPrice} isOurs />
                  {v.market_listings.map((l, i) => (
                    <PriceBar key={i} label={l.source} price={l.price} maxPrice={maxPrice} source={l.source} />
                  ))}
                </div>
              </div>

              {/* Listings */}
              <div className="rounded-xl border border-border bg-white overflow-hidden">
                <div className="px-3.5 py-2 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-semibold">Live comparable listings</span>
                  <span className="text-[10px] text-muted-foreground">*Simulated</span>
                </div>
                <div className="divide-y divide-border">
                  {v.market_listings.map((listing, i) => (
                    <ListingRow key={i} listing={listing} ourPrice={v.price} />
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground pb-2">
                * In production: real-time data via AutoScout24 API, Gaspedaal scraper and Marktplaats API.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Helper sub-components ────────────────────────────────────────────

function MetricBox({ label, value, sub, valueClass, icon }: {
  label: string; value: string; sub?: string; valueClass?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="bg-secondary/60 rounded-lg px-2.5 py-2">
      <div className="text-[10px] text-muted-foreground mb-0.5">{label}</div>
      <div className={cn("text-xs font-semibold mono flex items-center", valueClass ?? "text-foreground")}>{icon}{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{sub}</div>}
    </div>
  );
}

function ActionRow({ action, vehicle, onToggle, isDone }: {
  action: ActionItem; vehicle: Vehicle; onToggle: Props["onToggleAction"]; isDone?: boolean;
}) {
  return (
    <div className={cn("p-3 flex items-start gap-2.5", isDone && "opacity-60")}>
      <button
        onClick={() => onToggle(vehicle.id, action.id, !action.completed)}
        className={cn("mt-0.5 flex-shrink-0 transition-colors", isDone ? "text-emerald-500" : "text-muted-foreground hover:text-brand")}
      >
        {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={cn("text-xs font-semibold flex items-center gap-1 mb-0.5",
          isDone ? "line-through text-muted-foreground" : "text-foreground")}>
          <span className="text-brand">{ACTION_ICONS[action.action_type as ActionType]}</span>
          {ACTION_LABELS[action.action_type as ActionType]}
        </div>
        <p className="text-[11px] text-muted-foreground">{ACTION_DESC[action.action_type as ActionType]}</p>
        {action.action_type === "price_reduction" && !isDone && vehicle.discount_pct > 0 && (
          <div className="mt-1 text-[11px] text-brand font-medium">
            Advice: {formatCurrency(vehicle.price)} → {formatCurrency(vehicle.recommended_price)} (-{vehicle.discount_pct}%)
          </div>
        )}
        {action.action_type === "export_platform" && !isDone && (
          <div className="mt-1 flex gap-2">
            {["https://truckscout24.nl","https://truck1.eu"].map(url => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-brand hover:underline">
                <ExternalLink className="w-2.5 h-2.5" />{url.replace("https://","")}
              </a>
            ))}
          </div>
        )}
        {isDone && action.completed_by && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Completed by {action.completed_by} · {new Date(action.completed_at!).toLocaleDateString("en-GB")}
          </p>
        )}
      </div>
    </div>
  );
}

function PriceBar({ label, price, maxPrice, isOurs, source }: {
  label: string; price: number; maxPrice: number; isOurs?: boolean; source?: string;
}) {
  const pct = Math.round((price / maxPrice) * 100);
  const barColors: Record<string, string> = {
    AutoScout24: "bg-[#003087]", Gaspedaal: "bg-[#E95B1A]", Marktplaats: "bg-[#F58220]",
  };
  const bar = isOurs ? "bg-brand" : (source ? barColors[source] : "bg-muted-foreground");
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={cn("font-medium", isOurs ? "text-brand" : "text-foreground")}>{label}</span>
        <span className={cn("mono", isOurs && "font-semibold text-brand")}>{formatCurrency(price)}</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ListingRow({ listing, ourPrice }: { listing: any; ourPrice: number }) {
  const diff = ourPrice - listing.price;
  const srcCls: Record<string,string> = {
    AutoScout24: "bg-[#003087]/10 text-[#003087] border-[#003087]/20",
    Gaspedaal:   "bg-[#E95B1A]/10 text-[#E95B1A] border-[#E95B1A]/20",
    Marktplaats: "bg-[#F58220]/10 text-[#D4700E] border-[#F58220]/20",
  };
  return (
    <div className="p-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className="text-xs font-semibold mono">{formatCurrency(listing.price)}</span>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border",
            diff > 0 ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")}>
            {diff > 0 ? `we are ${formatCurrency(diff)} more expensive` : `we are ${formatCurrency(Math.abs(diff))} cheaper`}
          </span>
        </div>
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <span>{listing.year} · {formatKm(listing.mileage)}</span>
          <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{listing.location}</span>
          <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{listing.days_online}d online</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", srcCls[listing.source] ?? "bg-secondary")}>
          {listing.source}
        </span>
        <a href={listing.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
