import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "PomoLog",
  description:
    "With the PomoLog timer, achieve deep focus for efficient task management, while keeping track of and organizing your progress!",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Load the Lemon Squeezy's Lemon.js script before the page is interactive. */}
      <Script
        src="https://app.lemonsqueezy.com/js/lemon.js"
        strategy="beforeInteractive"
      />

      <div>{children}</div>
    </>
  );
}
