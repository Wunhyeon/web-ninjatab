import Footer from "@/components/footer/Footer";
import Header from "@/components/nav-bar/Header";
import dynamic from "next/dynamic";
import { Toaster } from "sonner";

export default async function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const CrispWithNoSSR = dynamic(() => import("@/components/crisp/Crisp"));
  return (
    <section>
      <CrispWithNoSSR />
      <Header />
      <div className="py-4 px-2 lg:px-0 mx-auto w-full max-w-[1000px] flex-grow min-h-screen">
        {children}
      </div>
      <Toaster richColors position="top-center" />
      <Footer />
    </section>
  );
}
