import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center px-4">
      <h2 className="text-3xl font-extrabold text-slate-900">404</h2>
      <p className="mt-2 text-sm text-slate-600">
        The exchange page or listing you are looking for does not exist.
      </p>
      <Link href="/" className="mt-6">
        <Button className="font-semibold">Back to Discover</Button>
      </Link>
    </div>
  );
}
