// Refresco de sesión de Supabase para el Proxy de Next.js 16.
//
// ¿Por qué existe esto? Los tokens de sesión de Supabase caducan. Si no se
// refrescan del lado del servidor antes de renderizar, un usuario logueado
// podría aparecer como deslogueado. El Proxy corre en CADA request, así que
// es el lugar ideal para refrescar el token y reescribir las cookies.
//
// (En versiones previas de Next esto vivía en `middleware.ts`. Next.js 16
// renombró esa convención a `proxy.ts`.)

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Si todavía no configuraste Supabase (Fase 1 sin proyecto creado),
  // el proxy no hace nada y la app arranca igual.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANTE: no metas lógica entre createServerClient y getUser().
  // getUser() valida el token contra Supabase y dispara el refresco.
  await supabase.auth.getUser();

  return supabaseResponse;
}
