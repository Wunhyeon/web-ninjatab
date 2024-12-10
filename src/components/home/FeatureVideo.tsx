import Image from "next/image";
import Link from "next/link";
import Balancer from "react-wrap-balancer";

import { Button } from "@/components/ui/button";
import { Section, Container } from "@/components/craft";
import { GUIDE_LINK } from "@/lib/constant";
import { sendGAEvent } from "@next/third-parties/google";
import { MAIN_GET_START } from "@/lib/GAEvent";
import GetStartBtn from "./GetStartBtn";
import LearnMoreBtn from "./LearnMoreBtn";
// import Placeholder from "@/public/placeholder.jpg";

const FeatureVideo = () => {
  return (
    <Section>
      <Container className="grid items-stretch">
        <h3 className="!mt-0 text-5xl">
          Maximize your focus with the Pomodoro technique and automatically
          track your progress in Notion.
        </h3>
        <p className="text-muted-foreground my-6">
          <Balancer>
            Record your work time with a Pomodoro timer synced to Notion, and
            visualize your performance with a heatmap.
          </Balancer>
        </p>
        <div className="not-prose my-8 flex items-center gap-2 justify-center">
          <GetStartBtn />
          <LearnMoreBtn />
        </div>
        <div className="not-prose relative flex h-[600px] overflow-hidden rounded-lg border">
          <video autoPlay loop playsInline muted>
            <source src="/featureVideo.mp4" type="video/mp4" />
          </video>
        </div>
      </Container>
    </Section>
  );
};

export default FeatureVideo;
