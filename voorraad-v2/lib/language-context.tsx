"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'nl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number) => string;
  formatKm: (km: number) => string;
  t: (key: string) => string;
}

const translations: Record<string, { en: string; nl: string }> = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', nl: 'Dashboard' },
  'nav.reports': { en: 'Reports', nl: 'Rapporten' },
  'nav.settings': { en: 'Settings', nl: 'Instellingen' },
  
  // KPI
  'kpi.totalVehicles': { en: 'Total vehicles', nl: 'Totaal voertuigen' },
  'kpi.totalInterestCost': { en: 'Total interest cost', nl: 'Totale rentekosten' },
  'kpi.actionRequired': { en: 'Action required (>45d)', nl: 'Actie vereist (>45d)' },
  'kpi.critical': { en: 'Critical (>90d)', nl: 'Kritiek (>90d)' },
  'kpi.avgDays': { en: 'Average days in stock', nl: 'Gemiddelde dagen in voorraad' },
  'kpi.aboveMarket': { en: 'Above market average', nl: 'Boven marktgemiddelde' },
  
  // Filters
  'filter.search': { en: 'Search vehicle or branch...', nl: 'Zoek voertuig of vestiging...' },
  'filter.filters': { en: 'Filters', nl: 'Filters' },
  'filter.clearFilters': { en: 'Clear filters', nl: 'Filters wissen' },
  'filter.branch': { en: 'Branch', nl: 'Vestiging' },
  'filter.type': { en: 'Type', nl: 'Type' },
  'filter.brand': { en: 'Brand', nl: 'Merk' },
  'filter.status': { en: 'Status', nl: 'Status' },
  'filter.allBranches': { en: 'All branches', nl: 'Alle vestigingen' },
  'filter.allTypes': { en: 'All types', nl: 'Alle types' },
  'filter.allBrands': { en: 'All brands', nl: 'Alle merken' },
  'filter.allStatuses': { en: 'All statuses', nl: 'Alle statussen' },
  'filter.truck': { en: 'Truck', nl: 'Truck' },
  'filter.van': { en: 'Van', nl: 'Bestelwagen' },
  'filter.green': { en: 'On track (<30d)', nl: 'Op schema (<30d)' },
  'filter.amber': { en: 'Attention (30–45d)', nl: 'Aandacht (30–45d)' },
  'filter.red': { en: 'Action required (>45d)', nl: 'Actie vereist (>45d)' },
  
  // Vehicle list
  'vehicleList.sortedBy': { en: 'Sorted by urgency', nl: 'Gesorteerd op urgentie' },
  'vehicleList.noVehicles': { en: 'No vehicles found', nl: 'Geen voertuigen gevonden' },
  'vehicleList.selectVehicle': { en: 'Select a vehicle', nl: 'Selecteer een voertuig' },
  
  // Tabs
  'tab.overview': { en: 'Overview', nl: 'Overzicht' },
  'tab.actions': { en: 'Actions', nl: 'Acties' },
  'tab.market': { en: 'Market Analysis', nl: 'Marktanalyse' },
  
  // Status
  'status.onTrack': { en: 'On track', nl: 'Op schema' },
  'status.attention': { en: 'Attention', nl: 'Aandacht' },
  'status.actionRequired': { en: 'Action required', nl: 'Actie vereist' },
  
  // Actions
  'action.priceReduction': { en: 'Reduce Price', nl: 'Prijsverlaging' },
  'action.photoUpdate': { en: 'Photo Update', nl: 'Foto-update' },
  'action.callProspect': { en: 'Call Prospect', nl: 'Bel prospect' },
  'action.exportPlatform': { en: 'Export Platform', nl: 'Exporteer platform' },
  
  // Detail
  'detail.askingPrice': { en: 'Asking price', nl: 'Vraagprijs' },
  'detail.inStock': { en: 'In stock', nl: 'In voorraad' },
  'detail.interestCost': { en: 'Interest cost', nl: 'Rentekosten' },
  'detail.days': { en: 'd', nl: 'd' },
  'detail.perYear': { en: '@ 5.5% p.a.', nl: '@ 5,5% p.j.' },
  'detail.priceAdvice': { en: 'Price advice', nl: 'Prijsadvies' },
  'detail.currentPrice': { en: 'Current price', nl: 'Huidige prijs' },
  'detail.marketPosition': { en: 'Market position', nl: 'Marktpositie' },
  'detail.overpriced': { en: 'Overpriced', nl: 'Te duur' },
  'detail.marketRate': { en: 'Market rate', nl: 'Marktconform' },
  'detail.goodValue': { en: 'Good value', nl: 'Goed koopje' },
  'detail.vsMarket': { en: 'vs market', nl: 't.o.v. markt' },
  'detail.advisedPrice': { en: 'Advised price', nl: 'Geadviseerde prijs' },
  'detail.noAdjustment': { en: 'No adjustment needed', nl: 'Geen aanpassing nodig' },
  'detail.interestToDate': { en: 'Interest cost to date', nl: 'Rentekosten tot nu toe' },
  'detail.financing': { en: '5.5% p.a. financing', nl: '5,5% p.j. financiering' },
  'detail.costPerDay': { en: 'Cost per day', nl: 'Kosten per dag' },
  'detail.priceReduction': { en: 'Price reduction logic', nl: 'Prijsaanpassingslogica' },
  'detail.after': { en: 'After', nl: 'Na' },
  'detail.days': { en: 'days', nl: 'dagen' },
  'detail.vehicleDetails': { en: 'Vehicle details', nl: 'Voertuigdetails' },
  'detail.id': { en: 'ID', nl: 'ID' },
  'detail.brand': { en: 'Brand', nl: 'Merk' },
  'detail.type': { en: 'Type', nl: 'Type' },
  'detail.year': { en: 'Year', nl: 'Bouwjaar' },
  'detail.mileage': { en: 'Mileage', nl: 'Kilometerstand' },
  'detail.category': { en: 'Category', nl: 'Categorie' },
  'detail.branch': { en: 'Branch', nl: 'Vestiging' },
  'detail.inStockSince': { en: 'In stock since', nl: 'In voorraad sinds' },
  'detail.daysInStock': { en: 'Days in stock', nl: 'Dagen in voorraad' },
  
  // Market
  'market.ourPrice': { en: 'Our asking price', nl: 'Onze vraagprijs' },
  'market.avgMarket': { en: 'Avg. market (3 platforms)', nl: 'Gem. markt (3 platforms)' },
  'market.competitor': { en: 'Cheapest competitor', nl: 'Goedkoopste concurrent' },
  'market.weAreMore': { en: 'We are', nl: 'Wij zijn' },
  'market.weAreLess': { en: 'We are cheaper', nl: 'Wij zijn goedkoper' },
  'market.expensive': { en: 'more expensive', nl: 'duurder' },
  'market.cheaper': { en: 'cheaper', nl: 'goedkoper' },
  'market.priceComparison': { en: 'Price comparison', nl: 'Prijsvergelijking' },
  'market.liveListings': { en: 'Live comparable listings', nl: 'Vergelijkbare advertenties' },
  'market.simulated': { en: '*Simulated', nl: '*Gesimuleerd' },
  
  // Actions
  'action.openActions': { en: 'Open actions', nl: 'Openstaande acties' },
  'action.completed': { en: 'Completed', nl: 'Afgerond' },
  'action.noActions': { en: 'No actions required', nl: 'Geen acties vereist' },
  'action.noActionsDesc': { en: 'Vehicle has been in stock less than 30 days.', nl: 'Voertuig is minder dan 30 dagen in voorraad.' },
  'action.completedBy': { en: 'Completed by', nl: 'Afgerond door' },
  
  // Labels
  'label.new': { en: 'New', nl: 'Nieuw' },
  'label.used': { en: 'Used', nl: 'Gebruikt' },
  'label.manager': { en: 'Manager', nl: 'Manager' },
  'label.allBranches': { en: 'All branches', nl: 'Alle vestigingen' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'en' || saved === 'nl')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const formatNumber = (num: number): string => {
    if (language === 'nl') {
      return num.toLocaleString('nl-NL');
    }
    return num.toLocaleString('en-GB');
  };

  const formatCurrency = (amount: number): string => {
    if (language === 'nl') {
      return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
    }
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatKm = (km: number): string => {
    const formatted = formatNumber(km);
    return language === 'nl' ? `${formatted} km` : `${formatted} km`;
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, formatNumber, formatCurrency, formatKm, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}