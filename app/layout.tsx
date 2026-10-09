import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/ui/NeoToast";
import { StudentProvider } from "@/lib/context/StudentContext";
import { Suspense } from "react";

import { TourProvider } from "@/lib/context/TourContext";
import { InteractiveSpotlightTour } from "@/components/tour/InteractiveSpotlightTour";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finora",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FFFDF9] text-black">
        <StudentProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <TourProvider>
                <Suspense fallback={<div className="h-16 bg-white border-b-2 border-black" />}>
                  <Navbar />
                </Suspense>
                <main className="flex-1 w-full">{children}</main>
                <Footer />
                <InteractiveSpotlightTour />
              </TourProvider>
            </Suspense>
          </ToastProvider>
        </StudentProvider>
      </body>
    </html>
  );
}
