"use client";
import { useRouter } from "next/navigation";
import { Truck, BarChart3, Settings, ChevronLeft, Download, Calendar } from "lucide-react";
import { LangToggle } from "@/components/ui/LangToggle";
import { useLang } from "@/lib/i18n";

const DEMO_USER = { name: "Thomas de Vries", role: "Manager", initials: "TD" };

export default function ReportsPage() {
  const router = useRouter();
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-[#F2F3F5]">
      <header className="bg-white border-b border-border flex items-center px-4 py-2.5 gap-3">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /> {t('nav.back')}
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center text-white font-bold text-xs">DE</div>
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

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-xl font-bold mb-6">{t('nav.reports')}</h1>
        
        <div className="grid gap-4">
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">{t('reports.monthlyStock')}</h2>
                <p className="text-xs text-muted-foreground">{t('reports.stockOverview')}</p>
              </div>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs bg-secondary rounded-md hover:bg-secondary/80">{t('reports.march')} 2026</button>
              <button className="px-3 py-1.5 text-xs bg-secondary rounded-md hover:bg-secondary/80">{t('reports.february')} 2026</button>
              <button className="px-3 py-1.5 text-xs bg-secondary rounded-md hover:bg-secondary/80">{t('reports.january')} 2026</button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">{t('reports.interestCost')}</h2>
                <p className="text-xs text-muted-foreground">{t('reports.financialImpact')}</p>
              </div>
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">{t('reports.totalInterest')}: €12,450</p>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">{t('reports.branchPerformance')}</h2>
                <p className="text-xs text-muted-foreground">{t('reports.performanceByLocation')}</p>
              </div>
              <Truck className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {['Duiven', 'Eindhoven', 'Nijmegen', 'Venlo', 'Stein', 'Tiel'].map(branch => (
                <div key={branch} className="flex items-center justify-between text-xs">
                  <span>{branch}</span>
                  <span className="text-muted-foreground">{t('reports.viewDetails')} →</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">{t('reports.exportData')}</h2>
                <p className="text-xs text-muted-foreground">{t('reports.downloadReports')}</p>
              </div>
              <Download className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs brand-gradient text-white rounded-md">{t('reports.exportCSV')}</button>
              <button className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-secondary">{t('reports.exportPDF')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}