"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "nl";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  fmt: (amount: number) => string;
  fmtKm: (km: number) => string;
  fmtDays: (days: number) => string;
}

const translations: Record<string, { en: string; nl: string }> = {
  // Navigation
  "nav.dashboard": { en: "Dashboard", nl: "Dashboard" },
  "nav.reports": { en: "Reports", nl: "Rapporten" },
  "nav.settings": { en: "Settings", nl: "Instellingen" },
  "nav.back": { en: "Back", nl: "Terug" },
  
  // General
  "general.loading": { en: "Loading vehicles...", nl: "Voertuigen laden..." },
  
  // KPI
  "kpi.totalVehicles": { en: "Total vehicles", nl: "Totaal voertuigen" },
  "kpi.totalInterestCost": { en: "Total interest cost", nl: "Totale rentekosten" },
  "kpi.actionRequired": { en: "Action required (>45d)", nl: "Actie vereist (>45d)" },
  "kpi.critical": { en: "Critical (>90d)", nl: "Kritiek (>90d)" },
  "kpi.avgDays": { en: "Average days in stock", nl: "Gemiddelde dagen in voorraad" },
  "kpi.aboveMarket": { en: "Above market average", nl: "Boven marktgemiddelde" },
  
  // Filters
  "filter.search": { en: "Search vehicle or branch...", nl: "Zoek voertuig of vestiging..." },
  "filter.filters": { en: "Filters", nl: "Filters" },
  "filter.clearFilters": { en: "Clear filters", nl: "Filters wissen" },
  "filter.branch": { en: "Branch", nl: "Vestiging" },
  "filter.type": { en: "Type", nl: "Type" },
  "filter.brand": { en: "Brand", nl: "Merk" },
  "filter.status": { en: "Status", nl: "Status" },
  "filter.allBranches": { en: "All branches", nl: "Alle vestigingen" },
  "filter.allTypes": { en: "All types", nl: "Alle types" },
  "filter.allBrands": { en: "All brands", nl: "Alle merken" },
  "filter.allStatuses": { en: "All statuses", nl: "Alle statussen" },
  "filter.truck": { en: "Truck", nl: "Truck" },
  "filter.van": { en: "Van", nl: "Bestelwagen" },
  "filter.green": { en: "On track (<30d)", nl: "Op schema (<30d)" },
  "filter.amber": { en: "Attention (30–45d)", nl: "Aandacht (30–45d)" },
  "filter.red": { en: "Action required (>45d)", nl: "Actie vereist (>45d)" },
  
  // Vehicle list
  "vehicleList.count": { en: "vehicles", nl: "voertuigen" },
  "vehicleList.sortedBy": { en: "Sorted by", nl: "Gesorteerd op" },
  "vehicleList.noVehicles": { en: "No vehicles found", nl: "Geen voertuigen gevonden" },
  "vehicleList.selectVehicle": { en: "Select a vehicle", nl: "Selecteer een voertuig" },
  
  // Tabs
  "tab.overview": { en: "Overview", nl: "Overzicht" },
  "tab.actions": { en: "Actions", nl: "Acties" },
  "tab.market": { en: "Market Analysis", nl: "Marktanalyse" },
  
  // Status
  "status.onTrack": { en: "On track", nl: "Op schema" },
  "status.attention": { en: "Attention", nl: "Aandacht" },
  "status.actionRequired": { en: "Action required", nl: "Actie vereist" },
  "status.new": { en: "New", nl: "Nieuw" },
  "status.used": { en: "Used", nl: "Gebruikt" },
  
  // Detail - Header
  "detail.askingPrice": { en: "Asking price", nl: "Vraagprijs" },
  "detail.advised": { en: "Advised", nl: "Geadviseerd" },
  "detail.inStock": { en: "In stock", nl: "In voorraad" },
  "detail.days": { en: "days", nl: "dagen" },
  "detail.d": { en: "d", nl: "d" },
  "detail.save": { en: "Save", nl: "Bespaar" },
  "detail.wellPriced": { en: "Well Priced", nl: "Goed Geprijsd" },
  
  // Detail - Overview tab
  "overview.priceAdvice": { en: "Price advice", nl: "Prijsadvies" },
  "overview.currentPrice": { en: "Current price", nl: "Huidige prijs" },
  "overview.marketPosition": { en: "Market position", nl: "Marktpositie" },
  "overview.overpriced": { en: "Overpriced", nl: "Te duur" },
  "overview.marketRate": { en: "Market rate", nl: "Marktconform" },
  "overview.goodValue": { en: "Good value", nl: "Goed koopje" },
  "overview.vsMarket": { en: "vs market", nl: "t.o.v. markt" },
  "overview.interestToDate": { en: "Interest cost to date", nl: "Rentekosten tot nu toe" },
  "overview.financing": { en: "5.5% p.a. financing", nl: "5,5% p.j. financiering" },
  "overview.costPerDay": { en: "Cost per day", nl: "Kosten per dag" },
  "overview.priceReduction": { en: "Price reduction logic", nl: "Prijsaanpassingslogica" },
  "overview.after": { en: "After", nl: "Na" },
  "overview.vehicleDetails": { en: "Vehicle details", nl: "Voertuigdetails" },
  "overview.id": { en: "ID", nl: "ID" },
  "overview.brand": { en: "Brand", nl: "Merk" },
  "overview.type": { en: "Type", nl: "Type" },
  "overview.year": { en: "Year", nl: "Bouwjaar" },
  "overview.mileage": { en: "Mileage", nl: "Kilometerstand" },
  "overview.category": { en: "Category", nl: "Categorie" },
  "overview.branch": { en: "Branch", nl: "Vestiging" },
  "overview.inStockSince": { en: "In stock since", nl: "In voorraad sinds" },
  "overview.daysInStock": { en: "Days in stock", nl: "Dagen in voorraad" },
  
  // Detail - Market tab
  "market.ourPrice": { en: "Our asking price", nl: "Onze vraagprijs" },
  "market.avgMarket": { en: "Avg. market (3 platforms)", nl: "Gem. markt (3 platforms)" },
  "market.cheapestCompetitor": { en: "Cheapest competitor", nl: "Goedkoopste concurrent" },
  "market.weAre": { en: "We are", nl: "Wij zijn" },
  "market.moreExpensive": { en: "more expensive", nl: "duurder" },
  "market.cheaper": { en: "cheaper", nl: "goedkoper" },
  "market.priceComparison": { en: "Price comparison", nl: "Prijsvergelijking" },
  "market.liveListings": { en: "Live comparable listings", nl: "Vergelijkbare advertenties" },
  "market.simulated": { en: "*Simulated", nl: "*Gesimuleerd" },
  "market.source": { en: "Source", nl: "Bron" },
  "market.price": { en: "Price", nl: "Prijs" },
  "market.year": { en: "Year", nl: "Bouwjaar" },
  "market.mileage": { en: "Mileage", nl: "KM" },
  "market.location": { en: "Location", nl: "Locatie" },
  "market.online": { en: "Online", nl: "Online" },
  
  // Detail - Actions tab
  "actions.openActions": { en: "Open actions", nl: "Openstaande acties" },
  "actions.completed": { en: "Completed", nl: "Afgerond" },
  "actions.noActions": { en: "No actions required", nl: "Geen acties vereist" },
  "actions.noActionsDesc": { en: "Vehicle has been in stock less than 30 days.", nl: "Voertuig is minder dan 30 dagen in voorraad." },
  "actions.completedBy": { en: "Completed by", nl: "Afgerond door" },
  "actions.priceReduction": { en: "Reduce Price", nl: "Prijsverlaging" },
  "actions.photoUpdate": { en: "Photo Update", nl: "Foto-update" },
  "actions.callProspect": { en: "Call Prospect", nl: "Bel prospect" },
  "actions.exportPlatform": { en: "Export Platform", nl: "Exporteer platform" },
  
  // Labels
  "label.manager": { en: "Manager", nl: "Manager" },
  "label.allBranches": { en: "All branches", nl: "Alle vestigingen" },
  
  // Navigation
  "nav.back": { en: "Back", nl: "Terug" },
  
  // Settings
  "settings.profile": { en: "Profile", nl: "Profiel" },
  "settings.name": { en: "Name", nl: "Naam" },
  "settings.email": { en: "Email", nl: "E-mail" },
  "settings.role": { en: "Role", nl: "Rol" },
  "settings.notifications": { en: "Notifications", nl: "Meldingen" },
  "settings.criticalAlerts": { en: "Critical vehicle alerts", nl: "Kritieke voertuignalen" },
  "settings.dailySummary": { en: "Daily interest cost summary", nl: "Dagelijkse rentekosten samenvatting" },
  "settings.actionReminders": { en: "Action item reminders", nl: "Herinneringen actie-items" },
  "settings.security": { en: "Security", nl: "Beveiliging" },
  "settings.changePassword": { en: "Change password", nl: "Wachtwoord wijzigen" },
  "settings.twoFactor": { en: "Two-factor authentication", nl: "Twee-factor authenticatie" },
  "settings.notEnabled": { en: "Not enabled", nl: "Niet ingeschakeld" },
  "settings.data": { en: "Data", nl: "Data" },
  "settings.dataSource": { en: "Data source", nl: "Databron" },
  "settings.demoMode": { en: "Demo mode", nl: "Demomodus" },
  "settings.lastSync": { en: "Last sync", nl: "Laatste synchronisatie" },
  "settings.connectSupabase": { en: "Connect Supabase", nl: "Verbind Supabase" },
  
  // Reports
  "reports.monthlyStock": { en: "Monthly Stock Report", nl: "Maandelijks voorraadrapport" },
  "reports.stockOverview": { en: "Overview of inventory performance", nl: "Overzicht van voorraadprestaties" },
  "reports.march": { en: "March", nl: "Maart" },
  "reports.february": { en: "February", nl: "Februari" },
  "reports.january": { en: "January", nl: "Januari" },
  "reports.interestCost": { en: "Interest Cost Analysis", nl: "Rentekosten analyse" },
  "reports.financialImpact": { en: "Financial impact of inventory holding", nl: "Financiële impact van voorraadhouden" },
  "reports.totalInterest": { en: "Total interest cost MTD", nl: "Totale rentekosten mtd" },
  "reports.branchPerformance": { en: "Branch Performance", nl: "Vestigingsprestaties" },
  "reports.performanceByLocation": { en: "Performance by location", nl: "Prestaties per locatie" },
  "reports.viewDetails": { en: "View details", nl: "Bekijk details" },
  "reports.exportData": { en: "Export Data", nl: "Data exporteren" },
  "reports.downloadReports": { en: "Download reports as CSV or PDF", nl: "Download rapporten als CSV of PDF" },
  "reports.exportCSV": { en: "Export CSV", nl: "Exporteer CSV" },
  "reports.exportPDF": { en: "Export PDF", nl: "Exporteer PDF" },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("si-lang");
    if (saved === "en" || saved === "nl") {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("si-lang", newLang);
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  const fmt = (amount: number): string => {
    const locale = lang === "nl" ? "nl-NL" : "en-GB";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fmtKm = (km: number): string => {
    if (km === 0) return lang === "nl" ? "Nieuw" : "New";
    const locale = lang === "nl" ? "nl-NL" : "en-GB";
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(km) + " km";
  };

  const fmtDays = (days: number): string => {
    return `${days} ${lang === "nl" ? "dagen" : "days"}`;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, fmt, fmtKm, fmtDays }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLang() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useLang must be used within LanguageProvider");
  }
  return context;
}
