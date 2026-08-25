'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  PlusCircle,
  ArrowLeftRight,
  CheckCircle2,
  Building2,
  LogIn,
  UserCircle,
} from "lucide-react";
import { useExchangeStore } from "@/lib/store/exchange-store";

export function Sidebar() {
  const pathname = usePathname();
  const { activeUser, activeCollege } = useExchangeStore();

  const navItems = [
    {
      name: "Discover",
      href: "/",
      icon: Compass,
      active: pathname === "/",
    },
    {
      name: "Create Exchange",
      href: "/exchange/new",
      icon: PlusCircle,
      active: pathname === "/exchange/new",
    },
    {
      name: "Matches",
      href: "/matches",
      icon: ArrowLeftRight,
      active: pathname === "/matches",
    },
    {
      name: "My Exchanges",
      href: "/my-exchanges",
      icon: CheckCircle2,
      active: pathname === "/my-exchanges" || pathname === "/exchange",
    },
    {
      name: "Account Profile",
      href: "/profile",
      icon: UserCircle,
      active: pathname === "/profile",
    },
  ];

  return (
    <aside className="hidden md:flex w-60 flex-col justify-between border-r border-white/10 bg-[#08090A] p-5 shrink-0 fixed inset-y-0 left-0 z-30">
      <div className="space-y-6">
        {/* Brand Mark */}
        <Link href="/" className="flex items-center space-x-2.5 px-2 pt-1 group">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#111315] border border-white/10 text-[#F5F5F5] group-hover:border-white/30 transition-colors">
            <span className="text-xs font-bold">↔</span>
          </div>
          <div>
            <span className="font-bold text-sm text-[#F5F5F5] tracking-tight">
              RExchange
            </span>
          </div>
        </Link>

        {/* Current Campus Context Badge */}
        <div className="rounded-md border border-white/10 bg-[#0D0F11] px-3 py-2 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#8B8F96]">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-[#8B8F96]" />
              Campus
            </span>
            <Link
              href="/login"
              className="text-[#F5F5F5] hover:underline transition-colors"
              title="Switch Campus"
            >
              Switch
            </Link>
          </div>
          <div className="font-semibold text-xs text-[#F5F5F5] truncate">
            {activeCollege?.name || "Campus Community"}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <div className="px-2 pb-1.5 text-[11px] text-[#5F636A] uppercase font-medium tracking-wider">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 rounded-md px-3 py-2 text-xs transition-all ${
                  item.active
                    ? "bg-[#111315] text-[#F5F5F5] border border-white/10 font-semibold"
                    : "text-[#8B8F96] hover:bg-[#0D0F11] hover:text-[#F5F5F5]"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    item.active ? "text-[#F5F5F5]" : "text-[#5F636A]"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Capability Profile Widget */}
      {activeUser ? (
        <Link
          href="/profile"
          className="rounded-md border border-white/10 bg-[#0D0F11] p-3.5 space-y-2 block hover:border-white/20 transition-all group"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#F5F5F5] group-hover:text-white truncate max-w-[110px]">
              {activeUser.name}
            </span>
            <span className="text-[10px] text-[#8B8F96] group-hover:text-[#F5F5F5] font-medium">
              Profile →
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] text-[#5F636A] uppercase font-medium">
              Skills &amp; Signals
            </div>
            <div className="flex flex-wrap gap-1">
              {activeUser.selectedSkills.slice(0, 2).map((s) => (
                <span
                  key={s}
                  className="px-1.5 py-0.5 rounded bg-[#111315] border border-white/10 text-[10px] text-[#8B8F96]"
                >
                  {s}
                </span>
              ))}
              {activeUser.derivedSkills.slice(0, 1).map((s) => (
                <span
                  key={s}
                  className="px-1.5 py-0.5 rounded bg-[#111315] border border-white/20 text-[10px] text-[#F5F5F5]"
                  title="Derived from your created exchanges"
                >
                  +{s}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ) : (
        <Link
          href="/login"
          className="rounded-md border border-white/10 bg-[#0D0F11] p-3 text-center block text-xs font-semibold text-[#F5F5F5] hover:bg-[#111315] transition-colors"
        >
          <LogIn className="h-3.5 w-3.5 mx-auto mb-1 text-[#F5F5F5]" />
          Sign In
        </Link>
      )}
    </aside>
  );
}
