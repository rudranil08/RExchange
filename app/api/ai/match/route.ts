import { NextRequest, NextResponse } from "next/server";
import { findReciprocalMatchesForListing, evaluateMatch } from "@/lib/ai/evaluate-match-service";
import { Listing } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Direct Pair Evaluation
    if (body.listingA && body.listingB) {
      const evalResult = await evaluateMatch({
        listingA: body.listingA,
        listingB: body.listingB,
      });
      return NextResponse.json(evalResult, { status: 200 });
    }

    // Candidate Batch Evaluation
    if (body.currentListing && Array.isArray(body.candidateListings)) {
      const currentListing = body.currentListing as Listing;
      const candidateListings = body.candidateListings as Listing[];

      const matches = await findReciprocalMatchesForListing(currentListing, candidateListings);
      return NextResponse.json({ matches }, { status: 200 });
    }

    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Missing currentListing and candidateListings, or listingA and listingB." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[POST /api/ai/match] Unhandled server error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: "Failed to evaluate reciprocal matches." },
      { status: 500 }
    );
  }
}
