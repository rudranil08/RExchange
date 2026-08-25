'use client';

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Plus,
  ArrowLeftRight,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExchangeStore } from "@/lib/store/exchange-store";
import { Exchange, ExchangeStatus, CATEGORY_LABELS } from "@/lib/types";
import { formatDeterministicDate } from "@/lib/date-utils";

export default function MyExchangesPage() {
  const router = useRouter();
  const { exchanges, setActiveExchange } = useExchangeStore();

  // Active exchanges: INITIATED
  const activeExchanges = exchanges.filter(
    (ex) => ex.status === ExchangeStatus.INITIATED
  );

  // Past exchanges: CONFIRMED or CANCELLED
  const pastExchanges = exchanges.filter(
    (ex) =>
      ex.status === ExchangeStatus.CONFIRMED ||
      ex.status === ExchangeStatus.CANCELLED
  );

  const handleViewExchange = (exchange: Exchange) => {
    setActiveExchange(exchange);
    router.push("/exchange");
  };

  return (
    <div className="container mx-auto max-w-4xl px-5 sm:px-8 py-8 sm:py-12 space-y-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1.5">
          <div className="text-xs text-[#8B8F96]">
            Exchange History
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] tracking-tight">
            Your Exchanges
          </h1>
          <p className="text-xs sm:text-sm text-[#8B8F96] max-w-xl">
            Keep track of exchanges you&apos;re currently working through and the ones you&apos;ve completed.
          </p>
        </div>

        <Link href="/exchange/new">
          <Button size="sm" className="font-semibold text-xs h-9 px-4 bg-[#F5F5F5] text-[#08090A] hover:bg-white">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            <span>New Exchange</span>
          </Button>
        </Link>
      </div>

      {/* 1. ACTIVE EXCHANGES SECTION */}
      <section className="space-y-4">
        <div className="flex items-baseline space-x-2">
          <h2 className="text-base font-bold text-[#F5F5F5] tracking-tight">
            Active Exchanges
          </h2>
          <span className="text-xs text-[#8B8F96]">
            ({activeExchanges.length})
          </span>
        </div>

        {activeExchanges.length > 0 ? (
          <div className="space-y-4">
            {activeExchanges.map((ex) => {
              const peerName = ex.peerListing?.creatorName || "Student Peer";
              const peerContext = ex.peerListing?.creatorContext || "Campus Student";
              const myCategory = ex.myListing?.category
                ? CATEGORY_LABELS[ex.myListing.category] || ex.myListing.category
                : "Skills";
              const peerCategory = ex.peerListing?.category
                ? CATEGORY_LABELS[ex.peerListing.category] || ex.peerListing.category
                : "Campus";
              const youGive = ex.match?.exchangeSummary?.aGives || ex.myListing?.offer || "Your Offer";
              const youReceive = ex.match?.exchangeSummary?.aReceives || ex.peerListing?.offer || "Peer Offer";

              return (
                <div
                  key={ex.id}
                  className="rounded-lg border border-white/10 bg-[#0D0F11] p-5 space-y-4 hover:border-white/20 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div className="flex items-center space-x-2 text-xs text-[#8B8F96]">
                      <span className="text-[#F5F5F5] font-semibold">{peerName}</span>
                      <span>·</span>
                      <span>{peerContext}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="rounded bg-[#111315] border border-white/10 px-2 py-0.5 text-xs text-[#F59E0B] font-medium">
                        Awaiting Confirmation
                      </span>
                    </div>
                  </div>

                  {/* Value Trade Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-md bg-[#111315] border border-white/5 p-3 space-y-1">
                      <div className="text-xs font-semibold text-[#22C55E] flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
                        You provide ({myCategory})
                      </div>
                      <div className="font-medium text-[#F5F5F5]">{youGive}</div>
                    </div>

                    <div className="rounded-md bg-[#111315] border border-white/5 p-3 space-y-1">
                      <div className="text-xs font-semibold text-[#A78BFA] flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]"></span>
                        {peerName} provides ({peerCategory})
                      </div>
                      <div className="font-medium text-[#F5F5F5]">{youReceive}</div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-2 flex items-center justify-between border-t border-white/10">
                    <span className="text-xs text-[#8B8F96]">
                      Started {formatDeterministicDate(ex.createdAt)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleViewExchange(ex)}
                      className="font-semibold text-xs h-8 px-4 bg-[#F5F5F5] text-[#08090A] hover:bg-white"
                    >
                      <span>View Exchange</span>
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/10 bg-[#0D0F11] p-8 text-center space-y-2">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded bg-[#111315] text-[#8B8F96]">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#F5F5F5]">
              No active exchanges
            </h3>
            <p className="text-xs text-[#8B8F96] max-w-xs mx-auto">
              You don&apos;t have an exchange in progress right now. Browse matches or create a listing.
            </p>
            <div className="pt-2">
              <Link href="/">
                <Button size="sm" variant="secondary" className="text-xs">
                  <Compass className="mr-1.5 h-3.5 w-3.5" />
                  Find an Exchange
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 2. PAST EXCHANGES SECTION */}
      <section className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-baseline space-x-2">
          <h2 className="text-base font-bold text-[#8B8F96] tracking-tight">
            Past Exchanges
          </h2>
          <span className="text-xs text-[#8B8F96]">
            ({pastExchanges.length})
          </span>
        </div>

        {pastExchanges.length > 0 ? (
          <div className="space-y-3">
            {pastExchanges.map((ex) => {
              const peerName = ex.peerListing?.creatorName || "Student Peer";
              const youGive = ex.match?.exchangeSummary?.aGives || ex.myListing?.offer || "Your Offer";
              const youReceive = ex.match?.exchangeSummary?.aReceives || ex.peerListing?.offer || "Peer Offer";
              const isConfirmed = ex.status === ExchangeStatus.CONFIRMED;

              return (
                <div
                  key={ex.id}
                  className="rounded-lg border border-white/10 bg-[#0D0F11] p-4 sm:p-5 space-y-3 opacity-90 hover:opacity-100 transition-opacity"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 text-xs text-[#8B8F96]">
                      <span className="text-[#F5F5F5] font-semibold">{peerName}</span>
                    </div>

                    <span
                      className={`text-xs font-semibold ${
                        isConfirmed ? "text-[#22C55E]" : "text-[#8B8F96]"
                      }`}
                    >
                      {ex.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-[#F5F5F5]">
                      {youGive} <span className="text-[#8B8F96] font-normal mx-1">↔</span> {youReceive}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs text-[#8B8F96]">
                    <span>
                      {ex.confirmedAt
                        ? `Confirmed ${formatDeterministicDate(ex.confirmedAt)}`
                        : `Logged ${formatDeterministicDate(ex.createdAt)}`}
                    </span>
                    <button
                      onClick={() => handleViewExchange(ex)}
                      className="text-xs text-[#8B8F96] hover:text-[#F5F5F5] hover:underline cursor-pointer"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/10 bg-[#0D0F11] p-8 text-center space-y-2">
            <h3 className="text-sm font-semibold text-[#8B8F96]">
              No past exchanges
            </h3>
            <p className="text-xs text-[#8B8F96] max-w-xs mx-auto">
              Your completed exchanges will appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
