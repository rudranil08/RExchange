'use client';

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowLeft,
  Plus,
  ArrowRight,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExchangeStore } from "@/lib/store/exchange-store";
import { ExchangeStatus, CATEGORY_LABELS } from "@/lib/types";

export default function ExchangeLifecyclePage() {
  const {
    activeExchange,
    confirmExchange,
    cancelExchange,
    activeListingForMatching,
  } = useExchangeStore();

  const [isConfirming, setIsConfirming] = useState(false);

  // 1. NO ACTIVE EXCHANGE STATE
  if (!activeExchange) {
    return (
      <div className="container mx-auto max-w-xl px-5 sm:px-8 py-16 text-center space-y-4">
        <div className="rounded-lg border border-dashed border-white/10 bg-[#0D0F11] p-10 space-y-3">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded bg-[#111315] text-[#8B8F96]">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
          <div className="text-xs text-[#8B8F96]">Exchange Session</div>
          <h2 className="text-base font-bold text-[#F5F5F5]">
            No Active Exchange Selected
          </h2>
          <p className="text-xs text-[#8B8F96] max-w-sm mx-auto">
            You don&apos;t have an active exchange selected. View your exchange history or browse matches.
          </p>
          <div className="pt-3 flex justify-center gap-2.5">
            <Link href="/my-exchanges">
              <Button size="sm" className="text-xs">
                My Exchanges
              </Button>
            </Link>
            <Link href="/matches">
              <Button size="sm" variant="secondary" className="text-xs">
                Browse Matches
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const peer = activeExchange.peerListing;
  const peerName = peer?.creatorName || "Student Peer";
  const peerContext = peer?.creatorContext || "Campus Student";
  const peerCategory = peer?.category ? CATEGORY_LABELS[peer.category] || peer.category : "Campus";
  const myListing = activeExchange.myListing || activeListingForMatching;
  const myCategory = myListing?.category ? CATEGORY_LABELS[myListing.category] || myListing.category : "Your Listing";

  const youGive = activeExchange.match?.exchangeSummary?.aGives || myListing?.offer || "Your offered skills or items";
  const youReceive = activeExchange.match?.exchangeSummary?.aReceives || peer?.offer || "Peer offered skills or items";

  const handleConfirm = () => {
    setIsConfirming(true);
    setTimeout(() => {
      confirmExchange(activeExchange.id);
      setIsConfirming(false);
    }, 400);
  };

  const handleCancel = () => {
    cancelExchange(activeExchange.id);
  };

  // 2. CANCELLED STATE
  if (activeExchange.status === ExchangeStatus.CANCELLED) {
    return (
      <div className="container mx-auto max-w-xl px-5 sm:px-8 py-10 space-y-5">
        <Link
          href="/my-exchanges"
          className="inline-flex items-center text-xs text-[#8B8F96] hover:text-[#F5F5F5] transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to My Exchanges
        </Link>

        <div className="rounded-lg border border-white/10 bg-[#0D0F11] overflow-hidden">
          <div className="bg-[#111315] px-6 py-6 text-[#F5F5F5] border-b border-white/10">
            <div className="text-xs text-[#8B8F96]">Exchange Session</div>
            <h1 className="text-lg font-bold">Exchange Cancelled</h1>
          </div>

          <div className="p-6 space-y-4 text-xs text-[#8B8F96]">
            <p>
              This exchange session with {peerName} was cancelled. Your listing remains available for other potential matches.
            </p>
            <div className="pt-2 flex gap-2.5">
              <Link href="/my-exchanges">
                <Button size="sm" className="text-xs">
                  My Exchanges
                </Button>
              </Link>
              <Link href="/">
                <Button size="sm" variant="secondary" className="text-xs">
                  Discover Feed
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. CONFIRMED STATE
  if (activeExchange.status === ExchangeStatus.CONFIRMED) {
    return (
      <div className="container mx-auto max-w-xl px-5 sm:px-8 py-10 space-y-5">
        <Link
          href="/my-exchanges"
          className="inline-flex items-center text-xs text-[#8B8F96] hover:text-[#F5F5F5] transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to My Exchanges
        </Link>

        <div className="rounded-lg border border-white/10 bg-[#0D0F11] overflow-hidden">
          {/* Confirmed Header */}
          <div className="bg-[#111315] border-b border-white/10 px-6 py-6 text-[#F5F5F5] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#8B8F96]">
              <span>Exchange Lifecycle</span>
              <span className="font-semibold text-[#22C55E]">Confirmed</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F5F5]">
              Exchange Confirmed
            </h1>
            <p className="text-xs text-[#8B8F96]">
              You and {peerName} have both committed to this reciprocal trade.
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Status Indicator */}
            <div className="rounded-md border border-[#22C55E]/30 bg-[#0E2418] p-4 flex items-start space-x-3 text-xs">
              <CheckCircle2 className="h-5 w-5 text-[#22C55E] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-[#22C55E]">
                  Trade Handshake Complete
                </div>
                <p className="text-[#22C55E]/80 text-xs">
                  Coordinate directly with {peerName} to execute the exchange.
                </p>
              </div>
            </div>

            {/* Agreed Terms */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#8B8F96]">
                Agreed Trade Terms
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-md bg-[#111315] border border-white/5 p-3.5 space-y-1">
                  <div className="text-xs font-semibold text-[#22C55E] flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
                    You provide
                  </div>
                  <div className="font-medium text-[#F5F5F5]">{youGive}</div>
                </div>

                <div className="rounded-md bg-[#111315] border border-white/5 p-3.5 space-y-1">
                  <div className="text-xs font-semibold text-[#A78BFA] flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]"></span>
                    {peerName} provides
                  </div>
                  <div className="font-medium text-[#F5F5F5]">{youReceive}</div>
                </div>
              </div>
            </div>

            {/* Contact Coordinate Disclosure */}
            <div className="rounded-md bg-[#111315] border border-white/10 p-4 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#8B8F96]">
                Contact Coordinates Revealed
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8B8F96]">Student:</span>
                  <span className="font-semibold text-[#F5F5F5]">{peerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B8F96]">Program:</span>
                  <span className="text-[#F5F5F5]">{peerContext}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B8F96]">Campus Email:</span>
                  <span className="text-[#F5F5F5] font-mono">{peer?.userId}@srmist.edu.in</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex flex-col sm:flex-row gap-2.5 border-t border-white/10">
              <Link href="/my-exchanges" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full text-xs h-9">
                  My Exchanges
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button size="sm" className="w-full text-xs font-semibold h-9 bg-[#F5F5F5] text-[#08090A] hover:bg-white">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Discover Feed
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. INITIATED STATE (Default)
  return (
    <div className="container mx-auto max-w-xl px-5 sm:px-8 py-10 space-y-5">
      <Link
        href="/my-exchanges"
        className="inline-flex items-center text-xs text-[#8B8F96] hover:text-[#F5F5F5] transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to My Exchanges
      </Link>

      <div className="rounded-lg border border-white/10 bg-[#0D0F11] overflow-hidden">
        {/* Initiated Header */}
        <div className="bg-[#111315] px-6 py-6 text-[#F5F5F5] space-y-1 border-b border-white/10">
          <div className="flex items-center justify-between text-xs text-[#8B8F96]">
            <span>Exchange Lifecycle</span>
            <span className="text-[#F59E0B] font-medium">Initiated</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Exchange Started
          </h1>
          <p className="text-[#8B8F96] text-xs">
            You&apos;ve initiated this exchange with {peerName}.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
            <span className="text-xs text-[#8B8F96]">Status:</span>
            <span className="font-semibold text-[#F5F5F5]">Awaiting Confirmation</span>
          </div>

          {/* Trade Review */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8B8F96]">
              Trade Value Review
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-md bg-[#111315] border border-white/5 p-3.5 space-y-1">
                <div className="text-xs font-semibold text-[#22C55E] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
                  You give ({myCategory})
                </div>
                <div className="font-medium text-[#F5F5F5]">{youGive}</div>
              </div>

              <div className="rounded-md bg-[#111315] border border-white/5 p-3.5 space-y-1">
                <div className="text-xs font-semibold text-[#A78BFA] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]"></span>
                  {peerName} gives ({peerCategory})
                </div>
                <div className="font-medium text-[#F5F5F5]">{youReceive}</div>
              </div>
            </div>
          </div>

          {/* Rationale */}
          {activeExchange.match?.explanation && (
            <div className="space-y-1 text-xs border-t border-white/10 pt-4">
              <div className="text-xs font-semibold text-[#8B8F96]">
                Why this matches
              </div>
              <p className="text-xs text-[#F5F5F5] leading-relaxed">
                {activeExchange.match.explanation}
              </p>
            </div>
          )}

          {/* Decision Actions (White Primary CTA) */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              className="w-full sm:w-auto text-xs h-9"
            >
              Cancel Exchange
            </Button>

            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming}
              size="default"
              className="w-full sm:w-auto font-semibold bg-[#F5F5F5] text-[#08090A] hover:bg-white text-xs h-9 px-5"
            >
              {isConfirming ? "Confirming..." : "Confirm Exchange"} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
