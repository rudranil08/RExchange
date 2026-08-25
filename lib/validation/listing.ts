import { z } from "zod";
import { Category, ExchangeType } from "@/lib/types";

export const CreateListingFormSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title cannot exceed 100 characters"),
    category: z.nativeEnum(Category, {
      errorMap: () => ({ message: "Please select a valid category" }),
    }),
    exchangeType: z.nativeEnum(ExchangeType, {
      errorMap: () => ({ message: "Please select a valid exchange type" }),
    }),
    offer: z
      .string()
      .min(3, "Please describe what you can offer (at least 3 characters)")
      .max(300, "Offer cannot exceed 300 characters"),
    need: z
      .string()
      .max(300, "Need cannot exceed 300 characters"),
    description: z
      .string()
      .min(5, "Please provide some additional context (at least 5 characters)")
      .max(1000, "Description cannot exceed 1000 characters"),
    tags: z.array(z.string()).optional().default([]),
  })
  .refine(
    (data) => {
      if (data.exchangeType === ExchangeType.GIVE_AWAY) {
        return true;
      }
      return data.need.trim().length > 0;
    },
    {
      message: "Please specify what you need in return (or choose 'Give Away' for free items)",
      path: ["need"],
    }
  );

export type CreateListingFormData = z.infer<typeof CreateListingFormSchema>;
