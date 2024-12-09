import Link from "next/link";
import React, { Suspense } from "react";
import MainNav from "./MainNav";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const Header = async () => {
  const supabase = await createClient();
  const user = await (await supabase.auth.getSession()).data.session?.user;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <header>
        {/* Desktop */}
        <MainNav user={user} />
      </header>
    </Suspense>
  );
};

export default Header;
