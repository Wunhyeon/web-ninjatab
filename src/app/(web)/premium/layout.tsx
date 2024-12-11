import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Ninja Tab",
  description:
    "Quickly open, close, and mute tabs with shortcuts Like a Ninja!",
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
