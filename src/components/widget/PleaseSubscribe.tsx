import Link from "next/link";
import React from "react";
import { buttonVariants } from "../ui/button";

const PleaseSubscribe = () => {
  return (
    <div>
      <h4>
        Currently, the free service allows you to use only one timer & Heatmap.
        Please subscribe to access more features!
      </h4>
      <Link
        href="/premium"
        target="_blank"
        className={buttonVariants({ variant: "default" })}
      >
        Go to Subscribe
      </Link>
    </div>
  );
};

export default PleaseSubscribe;
