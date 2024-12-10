import Feature from "@/components/home/Feature";
import Feature1 from "@/components/home/Feature1";
import Feature2 from "@/components/home/Feature2";
import FeatureVideo from "@/components/home/FeatureVideo";

export default async function WebHome() {
  return (
    <main className="relative flex flex-col text-slate-700  bg-white dark:bg-slate-900">
      <Feature />
      {/* <Feature1 />
      <Feature2 />
      <FeatureVideo /> */}
    </main>
  );
}
