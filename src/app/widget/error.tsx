"use client"; // Error boundaries must be Client Components

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>
        Something went wrong. Please try again, and if the issue persists, feel
        free to contact us.🙇‍♂️
      </p>
      <Link
        href="/"
        target="_blank"
        className={buttonVariants({ variant: "default" })}
      >
        Go to PomoLog
      </Link>
    </div>
  );
}
