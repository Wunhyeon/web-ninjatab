import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/nav-bar/Header";
import { createClient } from "@/utils/supabase/server";
import { Toaster } from "sonner";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ninja Tab",
  description:
    "Quickly open, close, and mute tabs with shortcuts Like a Ninja!",
  verification: {
    google: "y1UVNRzLk64HC3kSKMins7viBEWx2MgCfC01QfPCmNw",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://app.lemonsqueezy.com/js/lemon.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}

          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-YG8HS07L99" />
    </html>
  );
}
