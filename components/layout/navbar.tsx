import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E4E1D9] bg-[#F7F6F2]/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-13 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-1.5 text-[#171717] group">
          <span className="font-bold text-sm tracking-tight">
            RExchange <span className="font-normal text-[#6B6B65] text-xs group-hover:text-[#171717] transition-colors">↔</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-3 text-xs">
          <Link
            href="/"
            className="px-2.5 py-1 font-medium text-[#6B6B65] hover:text-[#171717] transition-colors"
          >
            Discover
          </Link>
          <Link
            href="/matches"
            className="px-2.5 py-1 font-medium text-[#6B6B65] hover:text-[#171717] transition-colors"
          >
            Matches
          </Link>
          <Link
            href="/exchange"
            className="px-2.5 py-1 font-medium text-[#6B6B65] hover:text-[#171717] transition-colors"
          >
            Exchanges
          </Link>
          <Link
            href="/exchange/new"
            className="ml-2 inline-flex items-center space-x-1 rounded border border-[#171717] bg-[#171717] px-3 py-1 text-xs font-medium text-white hover:bg-black transition-colors"
          >
            <span>Create</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
