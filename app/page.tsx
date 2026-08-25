'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Plus, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExchangeStore } from "@/lib/store/exchange-store";
import { ListingCard } from "@/components/listings/listing-card";
import { CategoryFilter } from "@/components/listings/category-filter";
import { Listing, EXCHANGE_TYPE_LABELS, ExchangeType } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const {
    collegeListings,
    activeCollege,
    newlyCreatedId,
    setActiveListingForMatching,
    searchQuery,
    setSearchQuery,
  } = useExchangeStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [showAllListings, setShowAllListings] = useState<boolean>(false);

  // Handle clicking on a listing card to view its exchange details
  const handleListingClick = (listing: Listing) => {
    setActiveListingForMatching(listing);
    router.push(`/exchange/${listing.id}`);
  };

  // Filter college-scoped listings based on category, exchange type, and search query
  const filteredListings = useMemo(() => {
    return collegeListings.filter((item) => {
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;
      const matchesType =
        selectedType === "ALL" || item.exchangeType === selectedType;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        item.title.toLowerCase().includes(query) ||
        item.offer.toLowerCase().includes(query) ||
        item.need.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.exchangeType.toLowerCase().includes(query) ||
        (item.creatorName && item.creatorName.toLowerCase().includes(query)) ||
        (item.creatorContext && item.creatorContext.toLowerCase().includes(query)) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(query)));

      return matchesCategory && matchesType && matchesSearch;
    });
  }, [collegeListings, selectedCategory, selectedType, searchQuery]);

  // Is the user actively filtering? If so, always display all matching items
  const isFiltering =
    selectedCategory !== "ALL" || selectedType !== "ALL" || searchQuery.trim() !== "";

  // Initial listing count: Show 3 on default view unless expanded or filtered
  const displayedListings = useMemo(() => {
    if (isFiltering || showAllListings) {
      return filteredListings;
    }
    return filteredListings.slice(0, 3);
  }, [filteredListings, isFiltering, showAllListings]);

  return (
    <div className="container mx-auto max-w-5xl px-5 sm:px-8 py-8 sm:py-10 space-y-12">
      {/* 1. HERO + FEATURED MATCH (COMPACT EDITORIAL SPLIT) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Compact Hero Headline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs text-[#8B8F96]">
            {activeCollege ? activeCollege.name : "Campus Community"}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F5F5] leading-tight">
            Find what you need. <br />
            Exchange what you have.
          </h1>

          <p className="text-xs sm:text-sm text-[#8B8F96] leading-relaxed max-w-md">
            Trade skills, notes, gear, and opportunities directly with students at {activeCollege?.name || "your college"}.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link href="/exchange/new">
              <Button size="default" className="font-semibold text-xs h-9 px-4 bg-[#F5F5F5] text-[#08090A] hover:bg-white">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                <span>Create Exchange</span>
              </Button>
            </Link>
            <Link href="/matches">
              <Button size="default" variant="secondary" className="font-semibold text-xs h-9 px-4 bg-[#111315] border border-white/10 text-[#F5F5F5] hover:bg-[#16191D]">
                <span>Browse Matches</span>
                <span className="ml-1.5 text-[#8B8F96]">↔</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Right: Streamlined Featured Match */}
        <div className="lg:col-span-5 rounded-lg border border-white/10 bg-[#0D0F11] p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] leading-none">
                96%
              </div>
              <div className="text-xs text-[#22C55E] font-medium mt-1">
                Strong match
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-[#F5F5F5]">
                Python Tutoring <span className="text-[#8B8F96] font-normal mx-1">↔</span> Pitch Deck
              </h2>
              <p className="text-xs text-[#8B8F96]">
                Sarah Khan · 2nd Year
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <Link
              href="/matches"
              className="text-xs text-[#F5F5F5] hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>View match</span>
              <ArrowRight className="h-3 w-3 text-[#8B8F96]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. EXCHANGES COLLECTION */}
      <section className="space-y-6">
        {/* Section Header & Compact Filters */}
        <div className="space-y-4 border-b border-white/10 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
            <div className="flex items-baseline space-x-2">
              <h2 className="text-base font-bold text-[#F5F5F5] tracking-tight">
                {activeCollege?.name || "Campus"} Exchanges
              </h2>
              <span className="text-xs text-[#8B8F96]">
                · {filteredListings.length} active
              </span>
            </div>

            {isFiltering && (
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedType("ALL");
                  setSearchQuery("");
                }}
                className="text-xs text-[#8B8F96] hover:text-[#F5F5F5] transition-colors cursor-pointer text-left"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Unified Compact Filter Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Compact Type Selector */}
            <div className="relative shrink-0">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none rounded-md border border-white/10 bg-[#111315] pl-3 pr-8 py-1.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-white/20 cursor-pointer"
              >
                <option value="ALL">All Types</option>
                {Object.entries(EXCHANGE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8B8F96] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Listing Grid */}
        {displayedListings.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedListings.map((listing, idx) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  index={idx}
                  isNew={listing.id === newlyCreatedId}
                  onClick={() => handleListingClick(listing)}
                />
              ))}
            </div>

            {/* View All Toggle (When not filtering and more listings exist) */}
            {!isFiltering && filteredListings.length > 3 && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllListings(!showAllListings)}
                  className="inline-flex items-center text-xs font-medium text-[#F5F5F5] hover:underline cursor-pointer"
                >
                  {showAllListings
                    ? "Show fewer exchanges ↑"
                    : `View all exchanges (${filteredListings.length}) →`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/10 bg-[#0D0F11] p-10 text-center space-y-2">
            <Filter className="h-5 w-5 mx-auto text-[#5F636A]" />
            <h3 className="text-sm font-semibold text-[#F5F5F5]">No exchanges found</h3>
            <p className="text-xs text-[#8B8F96] max-w-sm mx-auto">
              {searchQuery.trim()
                ? `No exchanges match "${searchQuery.trim()}" at ${activeCollege?.name || "your college"}.`
                : `No active listings match your selected filters at ${activeCollege?.name || "your college"}.`}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              {searchQuery.trim() && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs bg-[#111315] border border-white/10 text-[#F5F5F5]"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              )}
              {(selectedCategory !== "ALL" || selectedType !== "ALL") && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs bg-[#111315] border border-white/10 text-[#F5F5F5]"
                  onClick={() => {
                    setSelectedCategory("ALL");
                    setSelectedType("ALL");
                  }}
                >
                  Reset filters
                </Button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
