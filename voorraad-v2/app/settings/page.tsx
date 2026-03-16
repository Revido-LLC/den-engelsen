"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Bell, Shield, Database } from "lucide-react";
import { LangToggle } from "@/components/ui/LangToggle";
import { useLang } from "@/lib/i18n";

const DEMO_USER = { name: "Thomas de Vries", role: "Manager", initials: "TD" };

export default function SettingsPage() {
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

      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-xl font-bold mb-6">{t('nav.settings')}</h1>
        
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-sm font-semibold">{t('settings.profile')}</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">{t('settings.name')}</label>
                <div className="text-sm font-medium">Thomas de Vries</div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t('settings.email')}</label>
                <div className="text-sm font-medium">manager@denengelsen.nl</div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t('settings.role')}</label>
                <div className="text-sm font-medium">{t('label.manager')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-sm font-semibold">{t('settings.notifications')}</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm">{t('settings.criticalAlerts')}</span>
                <input type="checkbox" defaultChecked className="accent-brand" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">{t('settings.dailySummary')}</span>
                <input type="checkbox" defaultChecked className="accent-brand" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">{t('settings.actionReminders')}</span>
                <input type="checkbox" className="accent-brand" />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-sm font-semibold">{t('settings.security')}</h2>
            </div>
            <div className="space-y-3">
              <button className="text-sm text-brand hover:underline">{t('settings.changePassword')}</button>
              <div>
                <span className="text-sm">{t('settings.twoFactor')}: </span>
                <span className="text-xs text-muted-foreground">({t('settings.notEnabled')})</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-sm font-semibold">{t('settings.data')}</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('settings.dataSource')}</span>
                <span className="text-xs text-muted-foreground">{t('settings.demoMode')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('settings.lastSync')}</span>
                <span className="text-xs text-muted-foreground">-</span>
              </div>
              <button className="text-sm text-brand hover:underline">{t('settings.connectSupabase')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}