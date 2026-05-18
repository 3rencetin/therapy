import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AuthExperience } from "@/components/auth/auth-experience";
import { AuthFallback } from "@/components/auth/auth-fallback";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Giriş",
};

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthExperience />
    </Suspense>
  );
}
