import Maintenance from "@/components/Maintenance";
import { DashboardContent } from "@/components/premium/content";
import { PageTitleAction } from "@/components/premium/page-title-action";
import PlanList from "@/components/premium/plans/PlanList";
import { CardSkeleton } from "@/components/premium/skeletons/card";
import { PlansSkeleton } from "@/components/premium/skeletons/plans";
import { Subscriptions } from "@/components/premium/subscription/subscriptions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { Suspense } from "react";

// 공식홈페이지에서는 아래 주소로 되어있음. 나는 바꾼거.
/* src/app/dashboard/billing/page.tsx */

const page = () => {
  return (
    <div>
      <Suspense fallback={<PlansSkeleton />}>
        <PlanList />
        <Card>
          <CardHeader>
            <CardTitle>
              Get a 1-month free code for each post you write!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Share a post featuring the{" "}
              <TooltipProvider delayDuration={10}>
                <Tooltip>
                  <TooltipTrigger className="underline font-bold">
                    Ninja Tab link
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      https://chromewebstore.google.com/detail/ninja-tab-custom-shortcut/kpmbedmoneoiekmkbkjdkjaafhjidijj
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>{" "}
              on any platform like your blog, Twitter, or elsewhere, and receive
              a 1-month free code for each post.
              <br />
              <br /> Once you&apos;ve published your post, send the link to us
              via the chat window (Crisp) in the bottom right corner or email us
              at xhwogusxh@gmail.com!
            </p>
          </CardContent>
        </Card>
      </Suspense>
    </div>
    // <Maintenance />
  );
};
export default page;
