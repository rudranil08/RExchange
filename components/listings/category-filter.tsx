'use client';

import { Category } from "@/lib/types";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const COMPACT_CATEGORY_LABELS: Record<string, string> = {
  ALL: "All",
  [Category.STUDY]: "Study",
  [Category.TECH_ELECTRONICS]: "Tech",
  [Category.TICKETS_EVENTS]: "Tickets",
  [Category.SKILLS_SERVICES]: "Skills",
  [Category.OPPORTUNITIES]: "Opportunities",
  [Category.FREE_GIVEAWAY]: "Free",
  [Category.OTHER]: "Other",
};

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const categories = Object.entries(COMPACT_CATEGORY_LABELS).map(([key, label]) => ({
    key,
    label,
  }));

  return (
    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.key;
        return (
          <button
            key={cat.key}
            onClick={() => onSelectCategory(cat.key)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition-all cursor-pointer ${
              isSelected
                ? "bg-[#F5F5F5] text-[#08090A] font-semibold shadow-sm"
                : "bg-[#111315] text-[#8B8F96] border border-white/10 hover:border-white/20 hover:text-[#F5F5F5]"
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
