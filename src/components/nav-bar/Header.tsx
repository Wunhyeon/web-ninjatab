import Link from "next/link";
import React from "react";
import MainNav from "./MainNav";
import MobileNav from "./MobileNav";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const Header = async () => {
  const supabase = createClient();
  const user = await (await supabase.auth.getSession()).data.session?.user;

  return (
    <header>
      {/* Desktop */}
      <MainNav user={user} />
      {/* Mobile */}
      <MobileNav user={user} />
    </header>
  );
};

export default Header;
