'use client';

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserCircle,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
  Plus,
  Compass,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExchangeStore } from "@/lib/store/exchange-store";
import { Exchange, ExchangeStatus, CATEGORY_LABELS } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const {
    activeUser,
    activeCollege,
    exchanges,
    listings,
    setActiveExchange,
  } = useExchangeStore();

  // If no user is logged in, redirect to login
  if (!activeUser) {
    return (
      <div className="container mx-auto max-w-2xl px-5 py-16 text-center space-y-4">
        <UserCircle className="h-12 w-12 mx-auto text-[#8B8F96]" />
        <h1 className="text-xl font-bold text-[#F5F5F5]">No Active Account Found</h1>
        <p className="text-xs text-[#8B8F96]">
          Please sign in with your campus profile to view your exchange history and reputation.
        </p>
        <Link href="/login">
          <Button className="font-semibold text-xs h-9 px-4 bg-[#F5F5F5] text-[#08090A] hover:bg-white">
            <span>Sign In / Select Profile</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    );
  }

  // Filter exchanges for the active user
  const userExchanges = exchanges.filter(
    (ex) =>
      ex.initiatorUserId === activeUser.id ||
      ex.receiverUserId === activeUser.id ||
      ex.myListing?.userId === activeUser.id
  );

  const completedExchanges = userExchanges.filter(
    (ex) => ex.status === ExchangeStatus.CONFIRMED
  );

  const activeExchanges = userExchanges.filter(
    (ex) => ex.status === ExchangeStatus.INITIATED
  );

  const cancelledExchanges = userExchanges.filter(
    (ex) => ex.status === ExchangeStatus.CANCELLED
  );

  const completedCount = completedExchanges.length;
  const activeCount = activeExchanges.length;
  const concludedCount = completedCount + cancelledExchanges.length;

  // Calculate Exchange Reliability deterministically
  let reliabilityDisplay = "Building history";
  let reliabilitySubtitle = "Complete exchanges to establish reliability percentage";
  let isPercentage = false;

  if (concludedCount > 0) {
    const rate = Math.round((completedCount / concludedCount) * 100);
    reliabilityDisplay = `${rate}%`;
    reliabilitySubtitle = `${completedCount} of ${concludedCount} exchanges completed successfully`;
    isPercentage = true;
  }

  const handleViewExchange = (exchange: Exchange) => {
    setActiveExchange(exchange);
    router.push("/exchange");
  };

  return (
    <div className="container mx-auto max-w-4xl px-5 sm:px-8 py-8 sm:py-12 space-y-10">
      {/* 1. PROFILE HERO & CAMPUS IDENTITY */}
      <div className="rounded-lg border border-white/10 bg-[#0D0F11] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#111315] border border-white/10 text-xl sm:text-2xl font-bold text-[#F5F5F5] shrink-0">
              {activeUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] tracking-tight">
                  {activeUser.name}
                </h1>
                <span className="rounded bg-[#111315] border border-white/10 px-2 py-0.5 text-[10px] text-[#22C55E] font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
                  Active Student
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#8B8F96]">
                <span className="flex items-center gap-1 text-[#F5F5F5]">
                  <Building2 className="h-3.5 w-3.5 text-[#8B8F96]" />
                  {activeCollege?.name || activeUser.collegeId}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-[#8B8F96]" />
                  {activeUser.year} · {activeUser.course}
                </span>
              </div>

              <div className="text-[11px] text-[#5F636A]">
                Campus Contact: <span className="text-[#8B8F96]">{activeUser.contactHandle}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2">
            <Link href="/login">
              <Button
                variant="secondary"
                size="sm"
                className="text-xs h-8 px-3 border border-white/10 bg-[#111315] text-[#8B8F96] hover:text-[#F5F5F5]"
              >
                <span>Switch Student Profile</span>
              </Button>
            </Link>
            <Link href="/exchange/new">
              <Button
                size="sm"
                className="text-xs h-8 px-3 font-semibold bg-[#F5F5F5] text-[#08090A] hover:bg-white"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                <span>New Exchange</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Selected & Derived Skills / Capability Profile */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="text-xs font-medium text-[#8B8F96]">
            Campus Capability Profile
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeUser.selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2.5 py-1 rounded bg-[#111315] border border-white/10 text-xs text-[#F5F5F5]"
              >
                {skill}
              </span>
            ))}
            {activeUser.derivedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2.5 py-1 rounded bg-[#111315] border border-white/20 text-xs text-[#F5F5F5]"
                title="Derived from created exchanges"
              >
                <Sparkles className="mr-1 h-3 w-3 text-[#A78BFA]" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. EXCHANGE STATISTICS & REPUTATION */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Completed Exchanges */}
        <div className="rounded-lg border border-white/10 bg-[#0D0F11] p-5 space-y-1">
          <div className="text-xs text-[#8B8F96]">
            Completed Exchanges
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] tracking-tight">
            {completedCount}
          </div>
          <p className="text-[11px] text-[#5F636A]">
            Successfully finalized exchanges
          </p>
        </div>

        {/* Active Exchanges */}
        <div className="rounded-lg border border-white/10 bg-[#0D0F11] p-5 space-y-1">
          <div className="text-xs text-[#8B8F96]">
            Active Exchanges
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] tracking-tight">
            {activeCount}
          </div>
          <p className="text-[11px] text-[#5F636A]">
            In progress / coordination
          </p>
        </div>

        {/* Exchange Reliability */}
        <div className="rounded-lg border border-white/10 bg-[#0D0F11] p-5 space-y-1">
          <div className="text-xs text-[#8B8F96] flex items-center justify-between">
            <span>Exchange Reliability</span>
            <ShieldCheck className="h-3.5 w-3.5 text-[#22C55E]" />
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] tracking-tight">
            {reliabilityDisplay}
          </div>
          <p className="text-[11px] text-[#5F636A]">
            {reliabilitySubtitle}
          </p>
        </div>
      </div>

      {/* 3. PEER RATING SECTION (Grounded / Non-Fabricated) */}
      <div className="rounded-lg border border-white/10 bg-[#0D0F11] p-5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-[#8B8F96]" />
            <h3 className="text-xs font-semibold text-[#F5F5F5] uppercase tracking-wider">
              Peer Rating
            </h3>
          </div>
          <span className="text-[11px] text-[#8B8F96]">
            Post-Exchange Feedback
          </span>
        </div>
        <p className="text-xs text-[#8B8F96]">
          Not enough peer ratings yet. Peer ratings will appear after verified trade partners complete post-exchange reviews.
        </p>
      </div>

      {/* 4. ACTIVE EXCHANGES */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
          <div className="flex items-baseline space-x-2">
            <h2 className="text-base font-bold text-[#F5F5F5] tracking-tight">
              Active Exchanges
            </h2>
            <span className="text-xs text-[#8B8F96]">
              ({activeCount})
            </span>
          </div>
        </div>

        {activeCount > 0 ? (
          <div className="space-y-3">
            {activeExchanges.map((ex) => {
              const peerName = ex.peerListing?.creatorName || "Student Peer";
              const peerContext = ex.peerListing?.creatorContext || "Campus Peer";
              const youGive = ex.match?.exchangeSummary?.aGives || ex.myListing?.offer || "Your Offer";
              const youReceive = ex.match?.exchangeSummary?.aReceives || ex.peerListing?.offer || "Peer Offer";

              return (
                <div
                  key={ex.id}
                  className="rounded-lg border border-white/10 bg-[#0D0F11] p-5 space-y-3 hover:border-white/20 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10 text-xs">
                    <div className="flex items-center space-x-2 text-[#8B8F96]">
                      <span className="text-[#F5F5F5] font-semibold">{peerName}</span>
                      <span>·</span>
                      <span>{peerContext}</span>
                    </div>
                    <span className="rounded bg-[#111315] border border-white/10 px-2 py-0.5 text-xs text-[#F59E0B] font-medium">
                      In Coordination
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-md bg-[#111315] border border-white/5 p-3 space-y-1">
                      <div className="text-xs font-semibold text-[#22C55E] flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
                        You provide
                      </div>
                      <div className="font-medium text-[#F5F5F5]">{youGive}</div>
                    </div>

                    <div className="rounded-md bg-[#111315] border border-white/5 p-3 space-y-1">
                      <div className="text-xs font-semibold text-[#A78BFA] flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]"></span>
                        {peerName} provides
                      </div>
                      <div className="font-medium text-[#F5F5F5]">{youReceive}</div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
                    <span className="text-[#8B8F96]">
                      Started {new Date(ex.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleViewExchange(ex)}
                      className="font-semibold text-xs h-8 px-3 bg-[#F5F5F5] text-[#08090A] hover:bg-white"
                    >
                      <span>View Exchange Details</span>
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/10 bg-[#0D0F11]/50 p-8 text-center space-y-3">
            <Clock className="h-7 w-7 mx-auto text-[#5F636A]" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#F5F5F5]">
                No active exchanges in progress
              </h3>
              <p className="text-xs text-[#8B8F96] max-w-sm mx-auto">
                Find a reciprocal trade partner or create a new exchange listing to connect with peers.
              </p>
            </div>
            <Link href="/exchange/new">
              <Button size="sm" className="font-semibold text-xs h-8 px-4 bg-[#F5F5F5] text-[#08090A] hover:bg-white">
                <Plus className="mr-1 h-3.5 w-3.5" />
                <span>Create Exchange</span>
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* 5. COMPLETED EXCHANGES (EXCHANGE HISTORY) */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
          <div className="flex items-baseline space-x-2">
            <h2 className="text-base font-bold text-[#F5F5F5] tracking-tight">
              Completed Exchanges
            </h2>
            <span className="text-xs text-[#8B8F96]">
              ({completedCount})
            </span>
          </div>
        </div>

        {completedCount > 0 ? (
          <div className="space-y-3">
            {completedExchanges.map((ex) => {
              const peerName = ex.peerListing?.creatorName || "Student Peer";
              const peerContext = ex.peerListing?.creatorContext || "Campus Peer";
              const youGave = ex.match?.exchangeSummary?.aGives || ex.myListing?.offer || "Your Offer";
              const youReceived = ex.match?.exchangeSummary?.aReceives || ex.peerListing?.offer || "Peer Offer";
              const score = ex.match?.score || 96;

              return (
                <div
                  key={ex.id}
                  className="rounded-lg border border-white/10 bg-[#0D0F11] p-5 space-y-3 hover:border-white/20 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10 text-xs">
                    <div className="flex items-center space-x-2 text-[#8B8F96]">
                      <span className="text-[#F5F5F5] font-semibold">{peerName}</span>
                      <span>·</span>
                      <span>{peerContext}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-[#22C55E]">
                        {score}% Match
                      </span>
                      <span className="rounded bg-[#111315] border border-white/10 px-2 py-0.5 text-xs text-[#22C55E] font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-[#22C55E]" />
                        Exchange Confirmed
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-md bg-[#111315] border border-white/5 p-3 space-y-1">
                      <div className="text-xs font-semibold text-[#22C55E] flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
                        You provided
                      </div>
                      <div className="font-medium text-[#F5F5F5]">{youGave}</div>
                    </div>

                    <div className="rounded-md bg-[#111315] border border-white/5 p-3 space-y-1">
                      <div className="text-xs font-semibold text-[#A78BFA] flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]"></span>
                        {peerName} provided
                      </div>
                      <div className="font-medium text-[#F5F5F5]">{youReceived}</div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
                    <span className="text-[#8B8F96]">
                      Completed {ex.confirmedAt ? new Date(ex.confirmedAt).toLocaleDateString() : new Date(ex.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleViewExchange(ex)}
                      className="font-semibold text-xs h-8 px-3 bg-[#111315] border border-white/10 text-[#F5F5F5] hover:bg-white/10"
                    >
                      <span>Review Details</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/10 bg-[#0D0F11]/50 p-8 text-center space-y-2">
            <CheckCircle2 className="h-7 w-7 mx-auto text-[#5F636A]" />
            <h3 className="text-sm font-semibold text-[#F5F5F5]">
              No completed exchanges yet
            </h3>
            <p className="text-xs text-[#8B8F96] max-w-sm mx-auto">
              Complete your first exchange to start building your campus exchange record and reputation.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
