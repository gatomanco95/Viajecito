// Cliente de Supabase para el SERVIDOR (Server Components, Server Actions,
// Route Handlers). Lee y escribe la sesión a través de las cookies del request.
//
// En Next.js 16 `cookies()` es asíncrono, por eso esta función es `async`.
//
// Uso típico:
//   import { createClient } from "@/lib/supabase/server";
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` puede fallar si se llama desde un Server Component
            // (donde no se pueden escribir cookies). Es esperable: en ese
            // caso el refresco de sesión lo hace el proxy (src/proxy.ts).
          }
        },
      },
    },
  );
}
