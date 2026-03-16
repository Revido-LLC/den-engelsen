"use client";
import { LanguageProvider } from "@/lib/language-context";
import "./globals.css";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}