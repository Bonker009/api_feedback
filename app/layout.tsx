import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full">
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
              <SidebarTrigger />
            </div>
            {children}
          </main>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
