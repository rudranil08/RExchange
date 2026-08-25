import { Listing, CATEGORY_LABELS, EXCHANGE_TYPE_LABELS } from "@/lib/types";
import { ArrowRight } from "lucide-react";

interface ListingCardProps {
  listing: Listing;
  index?: number;
  isNew?: boolean;
  onClick?: () => void;
}

export function ListingCard({ listing, index, isNew = false, onClick }: ListingCardProps) {
  const categoryLabel = CATEGORY_LABELS[listing.category] || listing.category;
  const exchangeTypeLabel = EXCHANGE_TYPE_LABELS[listing.exchangeType] || listing.exchangeType;

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`flex flex-col justify-between rounded-lg border border-white/10 bg-[#0D0F11] p-5 transition-all hover:bg-[#111315] hover:border-white/20 group ${
        onClick ? "cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/20" : ""
      } ${isNew ? "border-[#22C55E]/40" : ""}`}
    >
      <div className="space-y-4">
        {/* Header: Category & Type */}
        <div className="flex items-center justify-between text-xs text-[#8B8F96]">
          <span className="font-medium">
            {categoryLabel} · {exchangeTypeLabel}
          </span>
          {isNew && (
            <span className="text-[#22C55E] text-[11px] font-semibold">Just Listed</span>
          )}
        </div>

        {/* Listing Title */}
        <h3 className="text-base font-bold text-[#F5F5F5] leading-snug line-clamp-2">
          {listing.title}
        </h3>

        {/* Un-nested HAVE and NEED Sections */}
        <div className="space-y-3 pt-1 text-xs">
          {/* HAVE */}
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-[#22C55E] flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
              HAVE
            </div>
            <p className="text-xs text-[#F5F5F5] font-medium leading-relaxed line-clamp-2">
              {listing.offer}
            </p>
          </div>

          {/* NEED */}
          {listing.need && listing.need !== "None" && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-[#A78BFA] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]"></span>
                NEED
              </div>
              <p className="text-xs text-[#F5F5F5] font-medium leading-relaxed line-clamp-2">
                {listing.need}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Student Metadata & CTA */}
      <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#8B8F96]">
        <span className="truncate font-medium text-[#8B8F96]">
          {listing.creatorName ? `${listing.creatorName} · ` : ""}{listing.creatorContext || "Campus Student"}
        </span>
        <span className="text-xs text-[#F5F5F5] group-hover:text-white inline-flex items-center gap-1 font-medium shrink-0 ml-2">
          View exchange <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}
