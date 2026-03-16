export type StockStatus = "green" | "amber" | "red";
export type VehicleType = "truck" | "van";
export type VehicleBrand = "MAN" | "VW" | "Ford" | "Renault" | "Mercedes-Benz" | "Peugeot" | "Citroën" | "Toyota" | "Škoda" | "Opel";
export type VehicleCategory = "new" | "used";
export type Branch = "Duiven" | "Eindhoven" | "Nijmegen" | "Venlo" | "Stein" | "Tiel";
export type ActionType = "price_reduction" | "photo_update" | "call_prospect" | "export_platform";
export type MarketSource = "AutoScout24" | "Gaspedaal" | "Marktplaats";

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  brand: VehicleBrand;
  branch: Branch;
  year: number;
  mileage: number;
  category: VehicleCategory;
  price: number;
  date_added: string;
  image_url?: string;
  // computed
  days_in_stock: number;
  status: StockStatus;
  interest_cost: number;
  urgency_score: number;
  recommended_price: number;
  discount_pct: number;
  market_delta_pct: number;
  pending_actions: number;
  action_items: ActionItem[];
  market_listings: MarketListing[];
}

export interface ActionItem {
  id: string;
  vehicle_id: string;
  action_type: ActionType;
  completed: boolean;
  completed_by: string | null;
  completed_at: string | null;
}

export interface MarketListing {
  source: MarketSource;
  url: string;
  title: string;
  price: number;
  year: number;
  mileage: number;
  location: string;
  days_online: number;
  dealer: string;
}

export interface KPISnapshot {
  total_vehicles: number;
  total_interest_cost: number;
  needs_action: number;
  critical: number;
  avg_days: number;
  avg_market_delta: number;
}

export interface FilterState {
  branch: Branch | "all";
  type: VehicleType | "all";
  brand: VehicleBrand | "all";
  status: StockStatus | "all";
  search: string;
}
