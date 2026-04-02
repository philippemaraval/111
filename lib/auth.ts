import { redirect } from "next/navigation";

import { createServerSupabaseClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils";

export async function getAdminAccess() {
  if (!hasSupabaseEnv()) {
    return {
      demoMode: true,
      user: null
    };
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return {
      demoMode: true,
      user: null
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return {
    demoMode: false,
    user: user && isAdminEmail(user.email) ? user : null
  };
}

export async function requireAdminUser() {
  const access = await getAdminAccess();

  if (access.demoMode) {
    return null;
  }

  if (!access.user) {
    redirect("/admin/login");
  }

  return access.user;
}
