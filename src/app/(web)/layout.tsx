import Header from "@/components/nav-bar/Header";
import { Toaster } from "sonner";

export default async function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section>
      <Header />
      <div className="py-4 px-2 lg:px-0 mx-auto w-full max-w-[1000px] flex-grow min-h-screen">
        {children}
      </div>
      <Toaster richColors position="top-center" />
    </section>
  );
}
