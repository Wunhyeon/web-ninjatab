import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Dashboard | Lemon Squeezy Next.js Billing Template",
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
