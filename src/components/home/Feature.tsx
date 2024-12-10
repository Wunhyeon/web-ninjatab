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

const Feature = () => {
  return (
    <Section>
      <Container className="grid items-stretch">
        <h3 className="!mt-0 text-5xl">
          Quickly open, close, and mute tabs
          <p>with shortcuts Like a Ninja!</p>
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
          {/* <video autoPlay loop playsInline muted>
            <source src="/featureVideo.mp4" type="video/mp4" />
          </video> */}
          <Image
            className="h-full w-full object-scale-down"
            src="/Feature1.png"
            width={1920}
            height={1080}
            alt="hero image"
            //   placeholder="blur"
          />
        </div>
      </Container>
    </Section>
  );
};

export default Feature;
