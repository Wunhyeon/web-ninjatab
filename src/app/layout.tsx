import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/nav-bar/Header";
import { createClient } from "@/utils/supabase/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Focus & Record",
  description: "뽀모도로 타이머로 깊은 집중을 하고, 이를 기록하고 관리하세요!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  console.log("user : ", user);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header user={user.data.user} />
          <div className="py-4 px-2 lg:px-0 mx-auto w-full max-w-[1000px] flex-grow min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
