// React and Next.js imports
import Image from "next/image";
import Link from "next/link";

// Third-party library imports
import Balancer from "react-wrap-balancer";
import { ArrowRight } from "lucide-react";

// Local component imports
import { Section, Container } from "@/components/craft";
import { Button } from "../ui/button";

// Asset imports
// import Placeholder from "@/";

const Feature2 = () => {
  return (
    <Section>
      <Container>
        <div>
          <h3 className="text-muted-foreground text-3xl">
            <Balancer>
              A heatmap that allows you to easily view your past records
            </Balancer>
          </h3>
          {/* <div className="not-prose my-8 h-96 w-full overflow-hidden rounded-lg border md:h-[480px] md:rounded-xl"> */}
          <Image
            className="h-full w-full  object-scale-down"
            src="/Feature2.png"
            width={1920}
            height={1080}
            alt="hero image"
            //   placeholder="blur"
          />
          {/* </div> */}
        </div>
      </Container>
    </Section>
  );
};

export default Feature2;