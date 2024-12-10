// React and Next.js imports
import Image from "next/image";
import Link from "next/link";

// Third-party library imports
import Balancer from "react-wrap-balancer";

// UI component imports
import { Button, buttonVariants } from "../ui/button";

// Icon imports
import { Github, Twitter, Facebook, LinkedinIcon } from "lucide-react";

// Local component imports
import { Section, Container } from "../craft";
import { Separator } from "../ui/separator";
import { GithubIcon } from "@/lib/svgToTsx/GithubIcon";
import { XIcon } from "@/lib/svgToTsx/XIcon";

// Asset imports
// import Logo from "@/public/logo.svg";

export default function Footer() {
  return (
    <footer>
      <Section>
        <Container className="grid gap-6">
          {/* <Separator /> */}
          <div className="not-prose flex flex-col gap-6">
            <Link href="/">
              <h1 className="">🥷 Ninja Tab</h1>
            </Link>
            <p>
              <Balancer>
                Ninja Tab is a Chrome Extension that Quickly open, close, and
                mute tabs with shortcuts Like Ninja.
              </Balancer>
            </p>
          </div>
          <div className="mb-4 flex flex-col gap-4 md:mb-0 md:flex-row">
            <Link href="/legal/privacyPolicy">Privacy Policy</Link>
            <Link href="/legal/termsOfService">Terms of Service</Link>
            <Link href="/legal/licenseNotice">License</Link>
            {/* <Link href="/cookie-policy">Cookie Policy</Link> */}
          </div>
        </Container>
        <Container className="not-prose flex flex-col justify-between gap-6 border-t md:flex-row md:items-center md:gap-2">
          <div className="flex gap-2">
            <Link
              className={buttonVariants({ variant: "outline", size: "icon" })}
              href="https://github.com/Wunhyeon"
              target="_blank"
            >
              <GithubIcon className="w-6 h-6" />
            </Link>
            <Link
              className={buttonVariants({ variant: "outline", size: "icon" })}
              href="https://x.com/llll43361519"
              target="_blank"
            >
              <XIcon className="w-6 h-6" />
            </Link>
            <Link
              className={buttonVariants({ variant: "outline", size: "icon" })}
              href="https://www.linkedin.com/in/JaehyeonLim"
              target="_blank"
            >
              <LinkedinIcon />
            </Link>
          </div>
          <p className="text-muted-foreground">
            © <a href="https://github.com/Wunhyeon">JaehyeonLim</a>. All rights
            reserved. 2024-present.
          </p>
        </Container>
      </Section>
    </footer>
  );
}
