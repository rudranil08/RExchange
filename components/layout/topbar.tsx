'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  PlusCircle,
  ArrowLeftRight,
  CheckCircle2,
  Menu,
  X,
  Search,
  Building2,
  UserCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useExchangeStore } from "@/lib/store/exchange-store";

export function Topbar() {
  const pathname = usePathname();
  const { activeCollege, activeUser, searchQuery, setSearchQuery } = useExchangeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global ⌘K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { name: "Discover", href: "/", icon: Compass, active: pathname === "/" },
    { name: "Create Exchange", href: "/exchange/new", icon: PlusCircle, active: pathname === "/exchange/new" },
    { name: "Matches", href: "/matches", icon: ArrowLeftRight, active: pathname === "/matches" },
    {
      name: "My Exchanges",
      href: "/my-exchanges",
      icon: CheckCircle2,
      active: pathname === "/my-exchanges" || pathname === "/exchange",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: UserCircle,
      active: pathname === "/profile",
    },
  ];

  return (
    <header className="sticky top-0 z-20 w-full border-b border-white/10 bg-[#08090A]/90 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-5 sm:px-8">
        {/* Mobile Brand / Toggle */}
        <div className="flex items-center space-x-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-[#8B8F96] hover:bg-[#111315] hover:text-[#F5F5F5]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#111315] border border-white/10 text-[#F5F5F5]">
              <span className="text-xs font-bold">↔</span>
            </div>
            <span className="font-bold text-sm text-[#F5F5F5]">RExchange</span>
          </Link>
        </div>

        {/* Desktop Search Bar & Campus Context */}
        <div className="hidden md:flex items-center space-x-3 w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5F636A]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeCollege?.name || "campus"} skills, gear, opportunities...`}
              className="w-full rounded-md border border-white/10 bg-[#0D0F11] pl-9 pr-14 py-1.5 text-xs text-[#F5F5F5] placeholder:text-[#5F636A] focus:outline-none focus:border-white/30 transition-colors"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-[#8B8F96] hover:text-[#F5F5F5] text-xs px-1"
                  title="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <kbd className="rounded border border-white/10 bg-[#111315] px-1.5 py-0.5 text-[9px] text-[#5F636A] pointer-events-none">
                  ⌘ K
                </kbd>
              )}
            </div>
          </div>
        </div>

        {/* Right CTA & Account Link */}
        <div className="flex items-center space-x-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center space-x-1.5 text-xs text-[#8B8F96] hover:text-[#F5F5F5] transition-colors"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>{activeCollege ? activeCollege.name : "Select Campus"}</span>
          </Link>

          {activeUser && (
            <Link
              href="/profile"
              className="hidden sm:inline-flex items-center space-x-1.5 rounded-md border border-white/10 bg-[#111315] px-2.5 py-1.5 text-xs text-[#F5F5F5] hover:border-white/20 transition-colors"
            >
              <UserCircle className="h-3.5 w-3.5 text-[#8B8F96]" />
              <span className="font-medium truncate max-w-[100px]">{activeUser.name.split(" ")[0]}</span>
            </Link>
          )}

          <Link
            href="/exchange/new"
            className="inline-flex items-center space-x-1.5 rounded-md bg-[#F5F5F5] px-3.5 py-1.5 text-xs font-semibold text-[#08090A] hover:bg-white transition-colors shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create Exchange</span>
          </Link>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#08090A] px-4 py-3 space-y-3">
          {/* Mobile Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5F636A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, gear, notes..."
              className="w-full rounded-md border border-white/10 bg-[#0D0F11] pl-9 pr-8 py-1.5 text-xs text-[#F5F5F5] placeholder:text-[#5F636A] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B8F96] hover:text-[#F5F5F5]"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="px-1 text-xs text-[#8B8F96] flex justify-between items-center">
            <span>Campus: {activeCollege?.name}</span>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-[#F5F5F5] font-semibold underline">
              Switch
            </Link>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 rounded-md px-3 py-2 text-xs font-medium ${
                    item.active
                      ? "bg-[#111315] text-[#F5F5F5] border border-white/10"
                      : "text-[#8B8F96] hover:bg-[#0D0F11]"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${item.active ? "text-[#F5F5F5]" : "text-[#5F636A]"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
