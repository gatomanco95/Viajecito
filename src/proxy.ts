// Proxy de Next.js 16 (antes se llamaba "middleware").
// Corre en el servidor antes de renderizar cada request.
// Acá lo usamos solo para refrescar la sesión de Supabase.

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy-session";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Corre en todas las rutas EXCEPTO archivos estáticos e imágenes,
  // para no interferir con la carga de assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
