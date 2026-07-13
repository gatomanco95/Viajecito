"use server";

// Server Actions relacionadas a la sesión.
// Al ser "use server", corren en el servidor y se pueden usar directamente
// como `action` de un <form>.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
