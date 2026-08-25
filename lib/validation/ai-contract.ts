import { z } from "zod";
import { Category, ExchangeType } from "@/lib/types";

export const ExtractListingInputSchema = z.object({
  text: z
    .string()
    .min(5, "Input text must be at least 5 characters")
    .max(1000, "Input text cannot exceed 1000 characters"),
  allowedCategories: z.array(z.string()).optional(),
  allowedExchangeTypes: z.array(z.string()).optional(),
});

export type ExtractListingInput = z.infer<typeof ExtractListingInputSchema>;

export const ExtractListingResultSchema = z.discriminatedUnion("status", [
  // Success state: Full structured extraction
  z.object({
    status: z.literal("READY"),
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    offer: z.string().min(3).max(300),
    need: z.string().max(300),
    category: z.nativeEnum(Category),
    exchangeType: z.nativeEnum(ExchangeType),
    tags: z.array(z.string().min(2).max(30)).min(1).max(8),
  }),
  // Ambiguous state: Requests clarification without inventing data
  z.object({
    status: z.literal("NEEDS_CLARIFICATION"),
    clarificationQuestion: z.string().min(5).max(300),
    title: z.string().optional(),
    offer: z.string().optional(),
    need: z.string().optional(),
    category: z.nativeEnum(Category).optional(),
    exchangeType: z.nativeEnum(ExchangeType).optional(),
    tags: z.array(z.string()).optional(),
  }),
]);

export type ExtractListingResult = z.infer<typeof ExtractListingResultSchema>;

// === evaluateMatch Contracts ===

const ListingEvaluationPayloadSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().default(""),
  category: z.nativeEnum(Category),
  exchangeType: z.nativeEnum(ExchangeType),
  offer: z.string(),
  need: z.string(),
  tags: z.array(z.string()).optional().default([]),
});

export const EvaluateMatchInputSchema = z.object({
  listingA: ListingEvaluationPayloadSchema,
  listingB: ListingEvaluationPayloadSchema,
});

export type EvaluateMatchInput = z.infer<typeof EvaluateMatchInputSchema>;

export const EvaluateMatchResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("MATCH"),
    score: z.number().int().min(50).max(100),
    explanation: z.string().min(10).max(500),
    exchangeSummary: z.object({
      aGives: z.string().min(2).max(200),
      aReceives: z.string().min(2).max(200),
    }),
  }),
  z.object({
    status: z.literal("NO_MATCH"),
    score: z.number().int().min(0).max(49),
    explanation: z.string().min(5).max(300),
    exchangeSummary: z
      .object({
        aGives: z.string(),
        aReceives: z.string(),
      })
      .optional(),
  }),
]);

export type EvaluateMatchResult = z.infer<typeof EvaluateMatchResultSchema>;
