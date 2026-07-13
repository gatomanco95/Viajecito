// Cliente de Supabase para el NAVEGADOR (Client Components).
//
// Usa la clave "anon" (pública). El aislamiento de datos NO depende de esta
// clave, sino de las policies de Row Level Security en la base. Por eso es
// seguro que esta clave viaje al navegador.
//
// Uso típico:
//   "use client"
//   import { createClient } from "@/lib/supabase/client";
//   const supabase = createClient();

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
