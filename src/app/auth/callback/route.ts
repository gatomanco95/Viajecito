// Callback de OAuth.
//
// Google (a través de Supabase) redirige acá con un `code` en la URL.
// Canjeamos ese código por una sesión y guardamos las cookies. A partir de
// ahí el usuario queda logueado.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Adónde mandar al usuario después de loguearse.
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // En producción (Vercel) el request llega a través de un balanceador,
      // así que respetamos el host reenviado para no romper el redirect.
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Si algo falló, volvemos al login con un flag de error.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
