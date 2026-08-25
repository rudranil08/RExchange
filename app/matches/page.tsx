'use client';

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Filter,
  Loader2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/matching/match-card";
import { useExchangeStore } from "@/lib/store/exchange-store";
import { CATEGORY_LABELS, MatchabilityRecommendation, Listing, ExchangeType } from "@/lib/types";

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingIdParam = searchParams.get("listing") || searchParams.get("id");

  const {
    listings,
    collegeListings,
    activeCollege,
    activeListingForMatching,
    setActiveListingForMatching,
    matches,
    isMatching,
    addListing,
    findMatchesForListing,
    findMatchabilityRecommendationsForListing,
    createOrGetExchange,
    declineMatch,
  } = useExchangeStore();

  const [activeTab, setActiveTab] = useState<"all" | "cross_category">("all");
  const [evaluatedTargetId, setEvaluatedTargetId] = useState<string | null>(null);
  const [showMatchability, setShowMatchability] = useState<boolean>(false);
  const [createdExchangeListing, setCreatedExchangeListing] = useState<Listing | null>(null);

  // Derive target listing: URL query parameter takes highest precedence, then activeListingForMatching, then first college listing
  const targetListing = useMemo(() => {
    if (listingIdParam) {
      const found = listings.find((l) => l.id === listingIdParam);
      if (found) return found;
    }
    return activeListingForMatching || collegeListings[0] || listings[0];
  }, [listingIdParam, listings, activeListingForMatching, collegeListings]);

  const targetListingId = targetListing?.id || null;

  useEffect(() => {
    if (targetListing && targetListing.id !== evaluatedTargetId && !isMatching) {
      setEvaluatedTargetId(targetListing.id);
      setActiveListingForMatching(targetListing);
      findMatchesForListing(targetListing);
    }
  }, [targetListingId, targetListing, evaluatedTargetId, isMatching, findMatchesForListing, setActiveListingForMatching]);

  const handleReevaluate = () => {
    if (targetListing && !isMatching) {
      findMatchesForListing(targetListing);
    }
  };

  const handleAccept = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (match) {
      try {
        createOrGetExchange(match);
        router.push("/exchange");
      } catch (err: any) {
        alert(err.message || "You cannot exchange with your own listing.");
      }
    }
  };

  const handleDecline = (matchId: string) => {
    declineMatch(matchId);
  };

  // Automatic exchange creation from Make Me Matchable
  const handleUseAsOffer = (capability: string) => {
    if (!targetListing) return;

    const newListing = addListing({
      title: `${capability} for ${targetListing.need}`,
      description: `Offering ${capability} in exchange for ${targetListing.need}.`,
      category: targetListing.category,
      exchangeType: targetListing.exchangeType || ExchangeType.SKILL_EXCHANGE,
      offer: capability,
      need: targetListing.need,
      tags: [capability.toLowerCase().split(' ')[0], 'exchange'],
    });

    setCreatedExchangeListing(newListing);
    setActiveListingForMatching(newListing);
    setShowMatchability(false);
    findMatchesForListing(newListing);
  };

  const filteredMatches = matches.filter((m) => {
    if (activeTab === "cross_category") return m.isCrossCategory;
    return true;
  });

  const categoryLabel = targetListing
    ? CATEGORY_LABELS[targetListing.category] || targetListing.category
    : "Skills";

  // Calculate Make Me Matchable recommendations based on the active listing
  const matchabilityRecommendations: MatchabilityRecommendation[] = useMemo(() => {
    if (!targetListing) return [];
    return findMatchabilityRecommendationsForListing(targetListing);
  }, [targetListing, findMatchabilityRecommendationsForListing]);

  return (
    <div className="container mx-auto max-w-3xl px-5 sm:px-8 py-8 sm:py-12 space-y-8">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center text-xs text-[#8B8F96] hover:text-[#F5F5F5] transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Discover
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-3 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-[#8B8F96]">
            <span>Reciprocal Gateway</span>
            <span>·</span>
            <span className="font-semibold text-[#F5F5F5]">
              {activeCollege ? activeCollege.name : "Campus Community"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] tracking-tight">
            Your reciprocal matches
          </h1>
          <p className="text-xs sm:text-sm text-[#8B8F96]">
            Peer students at {activeCollege?.name || "your college"} whose offers and needs line up with this exchange.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/exchange/new">
            <Button variant="secondary" size="sm" className="font-medium text-xs h-8">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Exchange
            </Button>
          </Link>
        </div>
      </div>

      {/* Exchange Created Feedback Box (When created via Make Me Matchable) */}
      {createdExchangeListing && (
        <div className="rounded-lg border border-[#22C55E]/40 bg-[#0D0F11] p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
              <h3 className="text-xs font-bold text-[#22C55E] uppercase tracking-wider">
                EXCHANGE CREATED
              </h3>
            </div>
            <span className="text-[11px] text-[#8B8F96]">
              Added to My Exchanges
            </span>
          </div>
          <div className="text-sm font-semibold text-[#F5F5F5]">
            {createdExchangeListing.offer} <span className="text-[#8B8F96] font-normal mx-1">↕</span> {createdExchangeListing.need}
          </div>
          <p className="text-xs text-[#8B8F96]">
            Your new exchange is live. Evaluating reciprocal matches now.
          </p>
        </div>
      )}

      {/* Target Listing Context Box */}
      {targetListing && (
        <div className="rounded-lg border border-white/10 bg-[#0D0F11] p-4 sm:p-5 space-y-4 text-xs">
          {/* Header row: Creator info & actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold text-[#8B8F96] uppercase tracking-wider">
                Evaluating Exchange:
              </span>
              <span className="font-semibold text-[#F5F5F5]">
                {targetListing.creatorName || "Campus Peer"}
              </span>
              {targetListing.creatorContext && (
                <span className="text-[#8B8F96] text-[11px] hidden sm:inline">
                  · {targetListing.creatorContext}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowMatchability(!showMatchability)}
                className="inline-flex items-center text-xs text-[#A78BFA] hover:underline cursor-pointer"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {showMatchability ? "View Direct Matches" : "Try Make Me Matchable"}
              </button>

              <button
                type="button"
                onClick={handleReevaluate}
                disabled={isMatching}
                className="inline-flex items-center text-xs text-[#8B8F96] hover:text-[#F5F5F5] hover:underline cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isMatching ? "animate-spin" : ""}`} />
                Re-evaluate
              </button>
            </div>
          </div>

          {/* Full HAVE and NEED Value rows with natural wrapping & zero clipping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
            {/* HAVE */}
            <div className="rounded-md bg-[#111315] border border-white/5 p-3 space-y-1 min-w-0">
              <div className="text-[11px] font-semibold text-[#22C55E] flex items-center gap-1.5 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
                HAVE
              </div>
              <p className="text-xs text-[#F5F5F5] font-medium leading-relaxed break-words">
                {targetListing.offer || "None"}
              </p>
            </div>

            {/* NEED */}
            <div className="rounded-md bg-[#111315] border border-white/5 p-3 space-y-1 min-w-0">
              <div className="text-[11px] font-semibold text-[#A78BFA] flex items-center gap-1.5 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]"></span>
                NEED
              </div>
              <p className="text-xs text-[#F5F5F5] font-medium leading-relaxed break-words">
                {targetListing.need && targetListing.need !== "None" ? targetListing.need : "Open to relevant campus trade proposals"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isMatching && (
        <div className="rounded-lg border border-white/10 bg-[#0D0F11] p-12 text-center space-y-2">
          <Loader2 className="h-5 w-5 text-[#F5F5F5] animate-spin mx-auto" />
          <h3 className="text-sm font-semibold text-[#F5F5F5]">
            Finding reciprocal matches...
          </h3>
          <p className="text-xs text-[#8B8F96] max-w-sm mx-auto">
            Checking bilateral compatibility between this exchange and peers at {activeCollege?.name || "your college"}.
          </p>
        </div>
      )}

      {/* 1. DIRECT MATCHES VIEW (Default when direct matches exist and Make Me Matchable is not explicitly toggled) */}
      {!isMatching && !showMatchability && matches.length > 0 && (
        <div className="space-y-6">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#111315] text-[#F5F5F5] border border-white/10 font-semibold"
                  : "text-[#8B8F96] hover:text-[#F5F5F5] hover:bg-[#0D0F11]"
              }`}
            >
              All Matches ({matches.length})
            </button>
            <button
              onClick={() => setActiveTab("cross_category")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                activeTab === "cross_category"
                  ? "bg-[#111315] text-[#F5F5F5] border border-white/10 font-semibold"
                  : "text-[#8B8F96] hover:text-[#F5F5F5] hover:bg-[#0D0F11]"
              }`}
            >
              Cross-Category ({matches.filter((m) => m.isCrossCategory).length})
            </button>
          </div>

          {/* Matches List */}
          <div className="space-y-5">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                myOffer={targetListing?.offer}
                myCategory={categoryLabel}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. NO DIRECT MATCH TRANSITION STATE (Calm, non-error state leading into Make Me Matchable) */}
      {!isMatching && !showMatchability && matches.length === 0 && (
        <div className="rounded-lg border border-white/10 bg-[#0D0F11] p-8 sm:p-10 text-center space-y-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#111315] border border-white/10 text-[#8B8F96]">
            <Sparkles className="h-4 w-4 text-[#A78BFA]" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <div className="text-[11px] font-semibold text-[#8B8F96] uppercase tracking-wider">
              No Direct Match Yet
            </div>
            <h2 className="text-lg font-bold text-[#F5F5F5]">
              You need: {targetListing?.need || "Campus Resource"}
            </h2>
            <p className="text-xs text-[#8B8F96] leading-relaxed">
              We couldn&apos;t find a direct reciprocal trade for this request right now. But you may be able to become matchable using your existing capabilities.
            </p>
          </div>
          <div className="pt-2">
            <Button
              onClick={() => setShowMatchability(true)}
              className="font-semibold text-xs h-9 px-5 bg-[#F5F5F5] text-[#08090A] hover:bg-white"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-[#A78BFA]" />
              <span>Explore Make Me Matchable</span>
            </Button>
          </div>
        </div>
      )}

      {/* 3. MAKE ME MATCHABLE PANEL (Preserves complete HAVE + NEED exchange and creates new exchange on click) */}
      {!isMatching && showMatchability && (
        <div className="rounded-lg border border-white/10 bg-[#0D0F11] p-6 sm:p-8 space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-white/10">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-[#A78BFA]" />
                <h2 className="text-base sm:text-lg font-bold text-[#F5F5F5] tracking-tight">
                  MAKE ME MATCHABLE
                </h2>
                <span className="rounded bg-[#111315] border border-white/10 px-2 py-0.5 text-[10px] text-[#A78BFA] font-medium">
                  Campus Demand Match
                </span>
              </div>
              <p className="text-xs text-[#8B8F96] max-w-lg">
                You may be able to become matchable by offering another capability you already have.
              </p>
            </div>

            {matches.length > 0 && (
              <button
                onClick={() => setShowMatchability(false)}
                className="text-xs text-[#8B8F96] hover:text-[#F5F5F5] transition-colors"
              >
                ← Back to Direct Matches
              </button>
            )}
          </div>

          {/* CURRENT EXCHANGE (BOTH SIDES: WHAT YOU HAVE + WHAT YOU NEED) */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-semibold text-[#8B8F96] uppercase tracking-wider">
              Current Exchange Context
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* WHAT YOU HAVE */}
              <div className="rounded-md bg-[#111315] border border-white/5 p-3 space-y-1">
                <div className="text-[11px] font-semibold text-[#22C55E] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
                  WHAT YOU HAVE
                </div>
                <p className="text-xs text-[#F5F5F5] font-medium">
                  {targetListing?.offer || "None / Open to offers"}
                </p>
              </div>

              {/* WHAT YOU NEED */}
              <div className="rounded-md bg-[#111315] border border-white/5 p-3 space-y-1">
                <div className="text-[11px] font-semibold text-[#A78BFA] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]"></span>
                  WHAT YOU NEED
                </div>
                <p className="text-xs text-[#F5F5F5] font-medium">
                  {targetListing?.need || "Campus item or service"}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="text-[10px] font-semibold text-[#8B8F96] uppercase tracking-wider">
              You Could Offer
            </div>

            {matchabilityRecommendations.length > 0 ? (
              <div className="space-y-3">
                {matchabilityRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-lg border border-white/10 bg-[#111315] p-4 sm:p-5 space-y-3 hover:border-white/20 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div className="flex items-center space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
                        <h3 className="text-sm font-bold text-[#F5F5F5]">
                          {rec.capability}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-[#22C55E]">
                        {rec.eligibleDemandCount} student{rec.eligibleDemandCount === 1 ? '' : 's'} currently need this
                      </span>
                    </div>

                    <p className="text-xs text-[#8B8F96] leading-relaxed">
                      {rec.explanation}
                    </p>

                    {rec.potentialOpportunity && (
                      <div className="rounded-md bg-[#0D0F11] border border-white/5 p-3 space-y-1 text-xs">
                        <div className="text-[10px] text-[#A78BFA] font-semibold uppercase">
                          Direct Trade Opportunity Available
                        </div>
                        <div className="text-xs text-[#8B8F96]">
                          <span className="font-semibold text-[#F5F5F5]">{rec.potentialOpportunity.peerName}</span> ({rec.potentialOpportunity.peerContext}) offers{" "}
                          <span className="text-[#22C55E] font-medium">{rec.potentialOpportunity.peerOffer}</span> and is seeking this skill.
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs">
                      <span className="text-[11px] text-[#5F636A]">
                        Verified from your skills &amp; SRM campus demand
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleUseAsOffer(rec.capability)}
                        className="font-semibold text-xs h-7 px-3 bg-[#F5F5F5] text-[#08090A] hover:bg-white cursor-pointer"
                      >
                        <span>Use this as my offer</span>
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-white/10 bg-[#111315] p-8 text-center space-y-2">
                <Filter className="h-5 w-5 mx-auto text-[#5F636A]" />
                <h3 className="text-sm font-semibold text-[#F5F5F5]">
                  Not enough signal yet
                </h3>
                <p className="text-xs text-[#8B8F96] max-w-sm mx-auto">
                  We couldn&apos;t find a strong way to make this exchange matchable from your current capabilities and campus demand.
                </p>
                <div className="pt-2">
                  <Link href="/profile">
                    <Button size="sm" variant="secondary" className="text-xs">
                      Edit My Capabilities
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-3xl px-5 sm:px-8 py-12 text-center">
          <Loader2 className="h-5 w-5 text-[#F5F5F5] animate-spin mx-auto" />
        </div>
      }
    >
      <MatchesContent />
    </Suspense>
  );
}
