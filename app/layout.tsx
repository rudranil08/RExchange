import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ExchangeStoreProvider } from "@/lib/store/exchange-store";

export const metadata: Metadata = {
  title: "RExchange — Dark Premium Campus Marketplace",
  description: "Turn what you have into what you need. Exchange resources, services, and opportunities with college peers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#08090B] text-[#F5F5F7] antialiased selection:bg-[#1A1328] selection:text-[#A78BFA]">
        <ExchangeStoreProvider>
          <div className="flex min-h-screen">
            {/* Desktop Left Sidebar */}
            <Sidebar />

            {/* Main Content Area (offset by 224px on desktop) */}
            <div className="flex-1 md:pl-56 flex flex-col min-w-0">
              <Topbar />
              <main className="flex-1 pb-12">{children}</main>
            </div>
          </div>
        </ExchangeStoreProvider>
      </body>
    </html>
  );
}
