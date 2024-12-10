import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div>
      <h3>Please Subscribe for an enhanced Experience!</h3>
      <Link href="/premium" className={buttonVariants({ variant: "default" })}>
        Go to Subscription Plans
      </Link>
    </div>
  );
};

export default page;
