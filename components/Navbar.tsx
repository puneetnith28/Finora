"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  FileText, 
  Calculator,
  Menu, 
  X, 
  ArrowUpRight,
  Compass
} from "lucide-react";
import { NeoBadge, NeoButton } from "./ui/NeoPrimitives";
import { useTour } from "@/lib/context/TourContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tourId: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "FOIR SIMULATOR", href: "/simulator", icon: Calculator, tourId: "nav-simulator" },
  { label: "LENDER RULES", href: "/lenders", icon: Building2, tourId: "nav-lenders" },
  { label: "DOCUMENTS & OCR", href: "/documents", icon: FileText, tourId: "nav-documents" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { startTour } = useTour();

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/" data-tour="brand-logo" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center border-2 border-black bg-black text-[#FEF08A] shadow-[2px_2px_0px_0px_#000000]">
              <span className="font-black text-lg tracking-tighter">F</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-black uppercase">
                FINORA
              </span>
              <span className="inline-block h-3.5 w-1.5 bg-[#FEF08A] border-r-2 border-black" />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tour={item.tourId}
                  className={`px-2.5 lg:px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all duration-100 ${
                    isActive
                      ? "bg-[#FEF08A] border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-black"
                      : "text-neutral-700 hover:text-black hover:bg-neutral-100 border-2 border-transparent"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Header Badges & Action */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Product Tour Trigger in Header */}
          <button
            type="button"
            onClick={() => startTour(0)}
            className="neo-btn bg-[#FFFDF9] hover:bg-[#FEF08A] text-black px-2.5 py-1.5 text-[11px] font-black uppercase flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
            title="Start Interactive Product Tour"
          >
            <Compass className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>HOW IT WORKS</span>
          </button>

          <Link href="/assessment" data-tour="nav-assessment">
            <NeoButton variant="primary" size="sm">
              <span>EVALUATE LOAN</span>
              <ArrowUpRight className="h-4 w-4" />
            </NeoButton>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => startTour(0)}
            className="border-2 border-black bg-[#FEF08A] p-2 text-xs font-black shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1"
            aria-label="Open tour guide"
          >
            <Compass className="h-4 w-4" />
            <span className="text-[10px]">TOUR</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_#000000] text-black"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-black bg-[#FEF3C7] p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-xs font-black uppercase tracking-wider border-2 border-black ${
                  isActive
                    ? "bg-[#FEF08A] shadow-[2px_2px_0px_0px_#000000]"
                    : "bg-white hover:bg-neutral-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                startTour(0);
              }}
              className="neo-btn bg-[#FFFDF9] hover:bg-[#FEF08A] text-black w-full py-2.5 text-xs font-black uppercase flex items-center justify-center gap-2 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
            >
              <Compass className="h-4 w-4 stroke-[2.5]" />
              <span>START INTERACTIVE TOUR</span>
            </button>

            <Link href="/assessment" onClick={() => setMobileMenuOpen(false)}>
              <NeoButton variant="black" className="w-full">
                <span>START ASSESSMENT</span>
                <ArrowUpRight className="h-4 w-4" />
              </NeoButton>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
