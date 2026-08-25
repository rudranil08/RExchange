import { NextRequest, NextResponse } from "next/server";
import { ExtractListingInputSchema } from "@/lib/validation/ai-contract";
import { extractListing } from "@/lib/ai/extract-listing-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate request payload with Zod
    const inputValidation = ExtractListingInputSchema.safeParse(body);
    if (!inputValidation.success) {
      return NextResponse.json(
        {
          error: "INVALID_REQUEST",
          message: inputValidation.error.errors[0]?.message || "Invalid input payload",
        },
        { status: 400 }
      );
    }

    // 2. Call server-side extractListing service
    const result = await extractListing(inputValidation.data);

    // 3. Return structured validated result
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[POST /api/ai/parse] Unhandled server exception:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to process exchange description with AI.",
      },
      { status: 500 }
    );
  }
}
