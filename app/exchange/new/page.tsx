'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Category, ExchangeType, CATEGORY_LABELS, EXCHANGE_TYPE_LABELS, Listing } from "@/lib/types";
import { CreateListingFormSchema } from "@/lib/validation/listing";
import { ExtractListingResult } from "@/lib/validation/ai-contract";
import { useExchangeStore } from "@/lib/store/exchange-store";

function CreateExchangeFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addListing, setActiveListingForMatching, activeCollege } = useExchangeStore();

  const paramOffer = searchParams.get("offer");
  const paramNeed = searchParams.get("need");

  // Natural language state
  const [naturalText, setNaturalText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [clarification, setClarification] = useState<string | null>(null);
  const [aiDraft, setAiDraft] = useState<ExtractListingResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Structured form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(Category.SKILLS_SERVICES);
  const [exchangeType, setExchangeType] = useState<ExchangeType>(ExchangeType.SKILL_EXCHANGE);
  const [offer, setOffer] = useState("");
  const [need, setNeed] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Pre-fill from query params if arriving from Make Me Matchable
  useEffect(() => {
    if (paramOffer) {
      setOffer(paramOffer);
      if (paramNeed) {
        setNeed(paramNeed);
        setTitle(`${paramOffer} for ${paramNeed}`);
        setDescription(`Offering ${paramOffer} in exchange for ${paramNeed}.`);
      } else {
        setTitle(`${paramOffer} exchange`);
        setDescription(`Offering ${paramOffer}.`);
      }
    }
  }, [paramOffer, paramNeed]);

  // Form submission & post-creation confirmation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdListing, setCreatedListing] = useState<Listing | null>(null);

  const samplePrompts = [
    {
      label: "Python ↔ Pitch deck",
      prompt: "I can teach Python programming & CS101 data structures, and I need someone to help design my hackathon pitch deck slides in Figma.",
    },
    {
      label: "Calculus ↔ PyTorch",
      prompt: "I have a Stewart Calculus 8th Edition textbook with handwritten formula sheets, looking for someone to mentor me on PyTorch deep learning models.",
    },
    {
      label: "Bioinformatics ↔ Calculator",
      prompt: "I can help write Python scripts for computational biology lab reports, and I need a TI-84 Plus graphing calculator with charger.",
    },
  ];

  const handleSelectPrompt = (promptText: string) => {
    setNaturalText(promptText);
    setClarification(null);
    setAiError(null);
  };

  // Trigger server-side AI extraction
  const handleAIExtract = async () => {
    if (!naturalText.trim() || naturalText.trim().length < 5) {
      setAiError("Please type a few words describing what you offer and what you need.");
      return;
    }

    setIsExtracting(true);
    setClarification(null);
    setAiError(null);
    setAiDraft(null);

    try {
      const response = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: naturalText }),
      });

      if (!response.ok) {
        throw new Error("Extraction service error");
      }

      const result: ExtractListingResult = await response.json();

      if (result.status === "NEEDS_CLARIFICATION") {
        setClarification(result.clarificationQuestion || "Could you specify what you would like in return?");
      } else if (result.status === "READY") {
        setAiDraft(result);
        setTitle(result.title || "");
        setOffer(result.offer || "");
        setNeed(result.need || "");
        setDescription(result.description || naturalText);
        if (result.category) setCategory(result.category);
        if (result.exchangeType) setExchangeType(result.exchangeType);
        if (result.tags) setTags(result.tags);
      }
    } catch (err) {
      console.error(err);
      setAiError("Couldn't interpret that automatically.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyDraft = () => {
    if (aiDraft && aiDraft.status === "READY") {
      setTitle(aiDraft.title || "");
      setOffer(aiDraft.offer || "");
      setNeed(aiDraft.need || "");
      setDescription(aiDraft.description || naturalText);
      if (aiDraft.category) setCategory(aiDraft.category);
      if (aiDraft.exchangeType) setExchangeType(aiDraft.exchangeType);
      if (aiDraft.tags) setTags(aiDraft.tags);
    }
  };

  // Create & persist the exchange
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // double-submission protection

    setIsSubmitting(true);
    setErrors({});

    const formData = {
      title,
      category,
      exchangeType,
      offer,
      need,
      description,
      tags,
    };

    const validationResult = CreateListingFormSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const created = addListing(validationResult.data);
      setCreatedListing(created);
      setActiveListingForMatching(created);
    } catch (err) {
      console.error(err);
      setErrors({ form: "An unexpected error occurred while saving your exchange." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setCreatedListing(null);
    setNaturalText("");
    setAiDraft(null);
    setClarification(null);
    setAiError(null);
    setTitle("");
    setOffer("");
    setNeed("");
    setDescription("");
    setTags([]);
    setErrors({});
  };

  // ==========================================
  // CONFIRMATION STATE (EXCHANGE CREATED)
  // ==========================================
  if (createdListing) {
    return (
      <div className="container mx-auto max-w-2xl px-5 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-xs text-[#8B8F96] hover:text-[#F5F5F5] transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Discover
        </Link>

        {/* Confirmation Header */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs text-[#22C55E] font-medium">
            <CheckCircle2 className="h-4 w-4" />
            <span>Exchange created &amp; saved</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] tracking-tight">
            Your exchange is live
          </h1>
          <p className="text-xs sm:text-sm text-[#8B8F96]">
            Listed for students at {activeCollege?.name || "your campus"}. You can search for reciprocal matches now or manage it in My Exchanges.
          </p>
        </div>

        {/* Created Listing Summary Card */}
        <div className="rounded-lg border border-white/10 bg-[#0D0F11] p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-[#8B8F96]">
                <span>{CATEGORY_LABELS[createdListing.category]}</span>
                <span>·</span>
                <span>{EXCHANGE_TYPE_LABELS[createdListing.exchangeType]}</span>
              </div>
              <h2 className="text-lg font-bold text-[#F5F5F5]">
                {createdListing.title}
              </h2>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#22C55E]/10 border border-[#22C55E]/20 text-[10px] font-semibold text-[#22C55E]">
              Active
            </span>
          </div>

          {/* Bilateral Trade Rows */}
          <div className="space-y-2">
            <div className="rounded-md bg-[#111315] border border-white/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
              <span className="text-xs font-semibold text-[#22C55E] flex items-center gap-1.5 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span> You have
              </span>
              <span className="text-xs text-[#F5F5F5] font-medium sm:text-right">
                {createdListing.offer}
              </span>
            </div>
            <div className="rounded-md bg-[#111315] border border-white/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
              <span className="text-xs font-semibold text-[#A78BFA] flex items-center gap-1.5 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]"></span> You need
              </span>
              <span className="text-xs text-[#F5F5F5] font-medium sm:text-right">
                {createdListing.need}
              </span>
            </div>
          </div>

          {createdListing.tags && createdListing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {createdListing.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] bg-[#111315] text-[#8B8F96] border border-white/10 rounded px-2 py-0.5"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Post-Creation Actions (White Primary CTA) */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={() => router.push(`/matches?listing=${createdListing.id}`)}
              className="w-full sm:flex-1 font-semibold text-xs h-9 bg-[#F5F5F5] text-[#08090A] hover:bg-white"
            >
              <span>Find Reciprocal Matches</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>

            <Button
              variant="secondary"
              onClick={() => router.push("/my-exchanges")}
              className="w-full sm:w-auto text-xs h-9"
            >
              View in My Exchanges
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full sm:w-auto text-xs h-9"
            >
              Discover
            </Button>
          </div>
        </div>

        {/* Create Another Action */}
        <div className="text-center pt-2">
          <button
            onClick={handleResetForm}
            className="text-xs text-[#8B8F96] hover:text-[#F5F5F5] transition-colors cursor-pointer"
          >
            + Create another exchange
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // CREATION FORM
  // ==========================================
  return (
    <div className="container mx-auto max-w-2xl px-5 sm:px-8 py-8 sm:py-12 space-y-8">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center text-xs text-[#8B8F96] hover:text-[#F5F5F5] transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Discover
      </Link>

      {/* Editorial Header */}
      <div className="space-y-2">
        <div className="text-xs text-[#8B8F96]">
          Create Exchange
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] tracking-tight">
          What are you bringing?
        </h1>
        <p className="text-xs sm:text-sm text-[#8B8F96]">
          Describe what you have and what you need in plain text. We&apos;ll structure it into an exchange draft.
        </p>
      </div>

      {errors.form && (
        <div className="rounded-md border border-red-500/30 bg-red-950/20 p-3.5 flex items-center space-x-2 text-red-400 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* 1. NATURAL LANGUAGE AI INPUT */}
      <div className="rounded-lg border border-white/10 bg-[#0D0F11] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-3.5 w-3.5 text-[#F5F5F5]" />
            <span className="text-xs font-semibold text-[#F5F5F5]">
              Natural Language Structuring
            </span>
          </div>
          <span className="text-[11px] text-[#8B8F96]">
            AI Parser
          </span>
        </div>

        <Textarea
          placeholder="e.g. I can teach Python programming for CS101, and I need someone to help design my hackathon pitch deck slides in Figma."
          value={naturalText}
          onChange={(e) => {
            setNaturalText(e.target.value);
            setAiError(null);
          }}
          className="min-h-[90px] text-xs bg-[#111315] border-white/10 text-[#F5F5F5] placeholder:text-[#5F636A] focus:border-white/30"
        />

        {/* Sample Prompts */}
        <div className="space-y-1.5">
          <div className="text-[11px] text-[#5F636A] uppercase font-medium">Sample Exchanges:</div>
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => handleSelectPrompt(s.prompt)}
                className="text-xs bg-[#111315] text-[#8B8F96] hover:text-[#F5F5F5] hover:bg-[#16191D] border border-white/10 rounded px-2.5 py-1 transition-colors cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Action Button */}
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            size="sm"
            onClick={handleAIExtract}
            disabled={isExtracting || !naturalText.trim()}
            className="font-semibold text-xs h-8 px-3.5 bg-[#F5F5F5] text-[#08090A] hover:bg-white"
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Structure with AI
              </>
            )}
          </Button>
        </div>

        {/* Clarification Alert */}
        {clarification && (
          <div className="rounded-md border border-[#F59E0B]/30 bg-[#241A0E] p-3 text-xs text-[#F59E0B] space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" /> More detail needed
            </div>
            <p className="text-[11px] text-[#F59E0B]/90">{clarification}</p>
          </div>
        )}

        {/* Error Alert */}
        {aiError && (
          <div className="rounded-md border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        {/* AI Extracted Draft Preview */}
        {aiDraft && aiDraft.status === "READY" && (
          <div className="rounded-md border border-white/10 bg-[#111315] p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#F5F5F5] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Structured Draft Ready
              </span>
              <button
                type="button"
                onClick={handleApplyDraft}
                className="text-[11px] text-[#8B8F96] hover:text-[#F5F5F5] underline cursor-pointer"
              >
                Re-apply to form
              </button>
            </div>
            <div className="space-y-1 text-xs text-[#F5F5F5]">
              <div className="font-semibold">{aiDraft.title}</div>
              <div className="text-[11px] text-[#22C55E]">HAVE: {aiDraft.offer}</div>
              <div className="text-[11px] text-[#A78BFA]">NEED: {aiDraft.need}</div>
            </div>
          </div>
        )}
      </div>

      {/* 2. STRUCTURED EDITABLE FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-white/10 bg-[#0D0F11] p-5 sm:p-6 space-y-5">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-[#8B8F96]">
              Exchange Details
            </h2>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F5F5F5]">
              Listing Title <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder="e.g. Python CS101 Tutoring for Pitch Deck Design"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs bg-[#111315] border-white/10 text-[#F5F5F5] placeholder:text-[#5F636A]"
            />
            {errors.title && <p className="text-[11px] text-red-400">{errors.title}</p>}
          </div>

          {/* Category & Exchange Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#F5F5F5]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full rounded-md border border-white/10 bg-[#111315] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white/30"
              >
                {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                  <option key={catKey} value={catKey}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#F5F5F5]">Exchange Type</label>
              <select
                value={exchangeType}
                onChange={(e) => setExchangeType(e.target.value as ExchangeType)}
                className="w-full rounded-md border border-white/10 bg-[#111315] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white/30"
              >
                {Object.entries(EXCHANGE_TYPE_LABELS).map(([typeKey, label]) => (
                  <option key={typeKey} value={typeKey}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Offer & Need (Bilateral Core) */}
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#22C55E] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
                What You Have (Offer) <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. Python programming fundamentals & CS101 tutoring"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                className="text-xs bg-[#111315] border-white/10 text-[#F5F5F5] placeholder:text-[#5F636A]"
              />
              {errors.offer && <p className="text-[11px] text-red-400">{errors.offer}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#A78BFA] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]"></span>
                What You Need <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. High-impact Figma pitch deck and presentation slide design"
                value={need}
                onChange={(e) => setNeed(e.target.value)}
                className="text-xs bg-[#111315] border-white/10 text-[#F5F5F5] placeholder:text-[#5F636A]"
              />
              {errors.need && <p className="text-[11px] text-red-400">{errors.need}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F5F5F5]">
              Description <span className="text-red-400">*</span>
            </label>
            <Textarea
              placeholder="Additional details about condition, timeline, format, or mutual expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] text-xs bg-[#111315] border-white/10 text-[#F5F5F5] placeholder:text-[#5F636A]"
            />
            {errors.description && (
              <p className="text-[11px] text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <div className="text-[11px] text-[#8B8F96] mb-1.5">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-[#111315] text-[#8B8F96] border border-white/10 rounded px-2.5 py-0.5"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => router.push("/")}
              disabled={isSubmitting}
              className="text-xs h-9"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="default"
              disabled={isSubmitting}
              className="font-semibold text-xs h-9 px-5 bg-[#F5F5F5] text-[#08090A] hover:bg-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Creating Exchange...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                  <span>Create Exchange</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CreateExchangePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-2xl px-5 sm:px-8 py-12 text-center">
          <Loader2 className="h-5 w-5 text-[#F5F5F5] animate-spin mx-auto" />
        </div>
      }
    >
      <CreateExchangeFormContent />
    </Suspense>
  );
}

