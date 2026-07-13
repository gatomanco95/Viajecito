"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Botón "Iniciar sesión con Google".
//
// Al hacer clic, Supabase arma la URL de OAuth de Google y redirige el
// navegador. Cuando Google devuelve al usuario, cae en /auth/callback,
// que canjea el código por una sesión (ver src/app/auth/callback/route.ts).
//
// Fase 2: solo pedimos identidad (email/perfil, los scopes por defecto).
// El scope de Calendar se pide recién en la Fase 7, cuando se use.
export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // Pedimos consentimiento explícito para tener siempre datos frescos.
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) {
      setLoading(false);
      console.error("Error al iniciar sesión con Google:", error.message);
      alert("No pudimos iniciar sesión. Probá de nuevo.");
    }
    // Si no hay error, el navegador ya está redirigiendo a Google.
  }

  return (
    <button
      onClick={signIn}
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
    >
      <GoogleLogo />
      {loading ? "Redirigiendo…" : "Continuar con Google"}
    </button>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
