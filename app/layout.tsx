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
import { TourFloatingTrigger } from "@/components/tour/TourFloatingTrigger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finora — Education Loan Assessment & Financial Readiness Platform",
  description:
    "Deterministic financial evaluation, currency normalization, funding gap analysis, and transparent lender matching for study-abroad students.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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
                <TourFloatingTrigger />
              </TourProvider>
            </Suspense>
          </ToastProvider>
        </StudentProvider>
      </body>
    </html>
  );
}
