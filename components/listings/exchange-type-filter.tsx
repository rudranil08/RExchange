'use client';

import { ExchangeType, EXCHANGE_TYPE_LABELS } from "@/lib/types";

interface ExchangeTypeFilterProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

export function ExchangeTypeFilter({
  selectedType,
  onSelectType,
}: ExchangeTypeFilterProps) {
  const types = [
    { key: "ALL", label: "All Types" },
    ...Object.entries(EXCHANGE_TYPE_LABELS).map(([key, label]) => ({ key, label })),
  ];

  return (
    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
      {types.map((t) => {
        const isSelected = selectedType === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onSelectType(t.key)}
            className={`whitespace-nowrap rounded px-2.5 py-1 text-xs transition-all cursor-pointer ${
              isSelected
                ? "bg-[#16191D] text-[#F5F5F5] font-semibold border border-white/10"
                : "text-[#8B8F96] hover:text-[#F5F5F5]"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
