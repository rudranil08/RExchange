import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, X, Undo2 } from "lucide-react";
import { Match, MatchStatus, CATEGORY_LABELS } from "@/lib/types";

interface MatchCardProps {
  match: Match;
  myOffer?: string;
  myCategory?: string;
  onAccept?: (matchId: string) => void;
  onDecline?: (matchId: string) => void;
}

export function MatchCard({
  match,
  myOffer,
  myCategory,
  onAccept,
  onDecline,
}: MatchCardProps) {
  const peer = match.peerListing;
  const peerName = peer?.creatorName || "Student Peer";
  const peerContext = peer?.creatorContext || "Campus Student";
  const peerCategory = peer?.category ? CATEGORY_LABELS[peer.category] || peer.category : "Campus";

  const youGive = match.exchangeSummary?.aGives || myOffer || "Your offered skills/items";
  const youReceive = match.exchangeSummary?.aReceives || peer?.offer || "Peer offered skills/items";

  const isDeclined = match.status === MatchStatus.DECLINED;
  const isAccepted = match.status === MatchStatus.ACCEPTED;

  if (isDeclined) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#0D0F11] opacity-50 p-5 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-[#8B8F96]">
            <span className="text-[11px] font-medium uppercase">Declined</span>
            <span>·</span>
            <span className="font-semibold text-[#F5F5F5]">{peerName}</span>
            <span>·</span>
            <span className="line-through">{youReceive}</span>
          </div>
          {onAccept && (
            <button
              onClick={() => onAccept(match.id)}
              className="inline-flex items-center text-xs font-medium text-[#8B8F96] hover:text-[#F5F5F5] hover:underline cursor-pointer"
            >
              <Undo2 className="h-3 w-3 mr-1" /> Reconsider match
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-white/10 bg-[#0D0F11] p-6 sm:p-7 space-y-6 transition-all hover:border-white/20 ${
        isAccepted ? "ring-1 ring-white/30" : ""
      }`}
    >
      {/* 1. Header: Peer identity on left, Dominant Match Strength on right */}
      <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-xs text-[#8B8F96]">
            <span>{peerCategory}</span>
            {match.isCrossCategory && (
              <>
                <span>·</span>
                <span className="text-[#8B8F96]">Cross-Category</span>
              </>
            )}
            {isAccepted && (
              <>
                <span>·</span>
                <span className="text-[#22C55E] font-semibold">Started</span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] tracking-tight">
            {peerName}
          </h2>
          <p className="text-xs text-[#8B8F96]">
            {peerContext}
          </p>
        </div>

        {/* DOMINANT MATCH PERCENTAGE */}
        <div className="text-right shrink-0">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5F5] tracking-tight leading-none">
            {match.score}%
          </div>
          <div className="text-[11px] font-medium text-[#22C55E] mt-1">
            Strong reciprocal match
          </div>
        </div>
      </div>

      {/* 2. Bilateral Trade Comparison (Clean un-nested 2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What You Give */}
        <div className="rounded-md bg-[#111315] border border-white/10 p-4 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#22C55E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
            <span>What you give</span>
          </div>
          <div className="text-sm font-medium text-[#F5F5F5] leading-snug">
            {youGive}
          </div>
        </div>

        {/* What You Receive */}
        <div className="rounded-md bg-[#111315] border border-white/10 p-4 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#A78BFA]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]"></span>
            <span>What you receive</span>
          </div>
          <div className="text-sm font-medium text-[#F5F5F5] leading-snug">
            {youReceive}
          </div>
        </div>
      </div>

      {/* 3. Explanation */}
      <div className="space-y-1.5 text-xs pt-1">
        <div className="text-[11px] font-medium text-[#8B8F96]">
          Why this matches
        </div>
        <p className="text-xs sm:text-sm text-[#F5F5F5] leading-relaxed">
          {match.explanation}
        </p>
      </div>

      {/* 4. Action Controls (White primary CTA) */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
        <span className="text-xs text-[#5F636A]">
          Direct bilateral campus trade
        </span>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {onDecline && !isAccepted && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDecline(match.id)}
              className="text-xs text-[#8B8F96] hover:text-[#F5F5F5] h-9"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Not Interested
            </Button>
          )}

          {onAccept ? (
            <Button
              type="button"
              size="default"
              onClick={() => onAccept(match.id)}
              className="w-full sm:w-auto font-semibold text-xs h-9 px-5 bg-[#F5F5F5] text-[#08090A] hover:bg-white"
            >
              <span>{isAccepted ? "Continue to Exchange" : "Start Exchange"}</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Link href="/exchange" className="w-full sm:w-auto">
              <Button size="default" className="w-full sm:w-auto font-semibold text-xs h-9 px-5 bg-[#F5F5F5] text-[#08090A] hover:bg-white">
                <span>Start Exchange</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
