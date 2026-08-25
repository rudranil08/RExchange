'use client';

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowLeftRight,
  ArrowRight,
  UserCircle,
  Tag,
  Clock,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExchangeStore } from "@/lib/store/exchange-store";
import { CATEGORY_LABELS, EXCHANGE_TYPE_LABELS, ListingStatus } from "@/lib/types";
import { evaluateYearCompatibility } from "@/lib/matching/year-proximity";
import { formatDeterministicDate } from "@/lib/date-utils";

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.id;
  const router = useRouter();

  const {
    listings,
    activeUser,
    activeCollege,
    setActiveListingForMatching,
  } = useExchangeStore();

  const listing = useMemo(() => {
    return listings.find((l) => l.id === listingId);
  }, [listings, listingId]);

  if (!listing) {
    return (
      <div className="container mx-auto max-w-2xl px-5 py-16 text-center space-y-4">
        <div className="rounded-lg border border-dashed border-white/10 bg-[#0D0F11] p-10 space-y-3">
          <h1 className="text-base font-bold text-[#F5F5F5]">Exchange Listing Not Found</h1>
          <p className="text-xs text-[#8B8F96]">
            The requested exchange listing may have been completed, cancelled, or does not exist.
          </p>
          <div className="pt-2">
            <Link href="/">
              <Button size="sm" className="font-semibold text-xs bg-[#F5F5F5] text-[#08090A] hover:bg-white">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back to Discover
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryLabel = CATEGORY_LABELS[listing.category] || listing.category;
  const exchangeTypeLabel = EXCHANGE_TYPE_LABELS[listing.exchangeType] || listing.exchangeType;
  const isOwner = activeUser && listing.userId === activeUser.id;
  const sameCollege = activeUser && listing.collegeId === activeUser.collegeId;

  // Year compatibility check between active user and listing owner
  const yearCompat = evaluateYearCompatibility(activeUser?.year, listing.creatorContext?.split('•')[0]?.trim());

  const handleFindMatches = () => {
    setActiveListingForMatching(listing);
    router.push(`/matches?listing=${listing.id}`);
  };

  return (
    <div className="container mx-auto max-w-3xl px-5 sm:px-8 py-8 sm:py-12 space-y-8">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center text-xs text-[#8B8F96] hover:text-[#F5F5F5] transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Discover
      </Link>

      {/* Main Listing Detail Card */}
      <div className="rounded-lg border border-white/10 bg-[#0D0F11] p-6 sm:p-8 space-y-6">
        {/* Category & Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4 text-xs">
          <div className="flex items-center space-x-2 text-[#8B8F96]">
            <span className="font-medium text-[#F5F5F5]">{categoryLabel}</span>
            <span>·</span>
            <span>{exchangeTypeLabel}</span>
          </div>

          <div className="flex items-center space-x-2">
            {isOwner ? (
              <span className="rounded bg-[#111315] border border-white/20 px-2.5 py-0.5 text-[11px] text-[#F5F5F5] font-medium">
                Your Listing
              </span>
            ) : (
              <span className="rounded bg-[#111315] border border-white/10 px-2.5 py-0.5 text-[11px] text-[#22C55E] font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
                Active Listing
              </span>
            )}
          </div>
        </div>

        {/* Listing Title & Description */}
        <div className="space-y-3">
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] tracking-tight leading-snug">
            {listing.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#8B8F96] leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Value Exchange (HAVE ↔ NEED) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* WHAT THEY HAVE */}
          <div className="rounded-lg bg-[#111315] border border-white/5 p-4 space-y-1.5">
            <div className="text-[11px] font-semibold text-[#22C55E] flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
              {isOwner ? "WHAT YOU HAVE" : "WHAT THEY HAVE (OFFERING)"}
            </div>
            <p className="text-xs sm:text-sm text-[#F5F5F5] font-medium leading-relaxed">
              {listing.offer}
            </p>
          </div>

          {/* WHAT THEY NEED */}
          <div className="rounded-lg bg-[#111315] border border-white/5 p-4 space-y-1.5">
            <div className="text-[11px] font-semibold text-[#A78BFA] flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]"></span>
              {isOwner ? "WHAT YOU NEED" : "WHAT THEY NEED (SEEKING)"}
            </div>
            <p className="text-xs sm:text-sm text-[#F5F5F5] font-medium leading-relaxed">
              {listing.need && listing.need !== "None" ? listing.need : "Open to relevant campus trade proposals"}
            </p>
          </div>
        </div>

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {listing.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-[#111315] border border-white/5 text-[11px] text-[#8B8F96]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Student Context & Campus Footprint */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111315] border border-white/10 text-sm font-bold text-[#F5F5F5] shrink-0">
              {listing.creatorName
                ? listing.creatorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "ST"}
            </div>
            <div>
              <div className="font-semibold text-[#F5F5F5]">
                {listing.creatorName || "Campus Student"}
              </div>
              <div className="text-[11px] text-[#8B8F96] flex items-center gap-1.5 mt-0.5">
                <Building2 className="h-3 w-3 text-[#5F636A]" />
                <span>{activeCollege?.name || listing.collegeId}</span>
                <span>·</span>
                <span>{listing.creatorContext || "Student"}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#5F636A] sm:text-right">
            Listed {formatDeterministicDate(listing.createdAt)}
          </div>
        </div>

        {/* Actions Area */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          {isOwner ? (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                onClick={handleFindMatches}
                className="font-semibold text-xs h-9 px-4 bg-[#F5F5F5] text-[#08090A] hover:bg-white"
              >
                <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
                <span>Find Matches for My Exchange</span>
              </Button>
              <Link href="/my-exchanges">
                <Button
                  variant="secondary"
                  className="text-xs h-9 bg-[#111315] border border-white/10 text-[#8B8F96] hover:text-[#F5F5F5]"
                >
                  Manage in My Exchanges
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                onClick={handleFindMatches}
                className="font-semibold text-xs h-9 px-4 bg-[#F5F5F5] text-[#08090A] hover:bg-white"
              >
                <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
                <span>Find Reciprocal Matches</span>
              </Button>
              <Link
                href={`/exchange/new?need=${encodeURIComponent(listing.offer)}`}
              >
                <Button
                  variant="secondary"
                  className="text-xs h-9 bg-[#111315] border border-white/10 text-[#8B8F96] hover:text-[#F5F5F5]"
                >
                  <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                  <span>Propose Exchange Offer</span>
                </Button>
              </Link>
            </div>
          )}

          <div className="text-[11px] text-[#5F636A]">
            Protected by Campus Boundary &amp; Self-Match Prevention
          </div>
        </div>
      </div>
    </div>
  );
}
