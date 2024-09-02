import { buttonVariants } from "@/components/ui/button";
import { LOGIN_AGAIN, LOGIN_AGAIN_MESSAGE } from "@/lib/constant";
import Link from "next/link";
import React from "react";

const page = ({
  searchParams,
}: {
  searchParams: {
    [key: string]: string | string[] | undefined;
    message: string;
  };
}) => {
  console.log("searchParams.message : ", searchParams.message);

  return (
    <div>
      <p>{searchParams.message === LOGIN_AGAIN ? LOGIN_AGAIN_MESSAGE : ""}</p>
      Please Login
      <Link href="/sign-in" className={buttonVariants({ variant: "outline" })}>
        Sign in
      </Link>
    </div>
  );
};

export default page;
