import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "VoorraadInzicht — Den Engelsen Bedrijfswagens",
  description: "Interne voorraadbeheertool — rentekosten & marktanalyse",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased">
        <ClientLayout>{children}</ClientLayout>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
