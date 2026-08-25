'use client';

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center px-4">
      <h2 className="text-2xl font-bold text-slate-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-slate-600">
        An error occurred while loading this exchange view.
      </p>
      <Button onClick={() => reset()} className="mt-6 font-semibold">
        Try Again
      </Button>
    </div>
  );
}
