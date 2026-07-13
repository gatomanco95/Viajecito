import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GoogleSignInButton } from "@/components/google-signin-button";

// Página de login. Si ya hay sesión, redirige al inicio.
export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="max-w-sm">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Viajecito ✈️
        </Link>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          Entrá para empezar a organizar tus viajes.
        </p>

        <div className="mt-8">
          <GoogleSignInButton />
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Solo pedimos tu nombre, email y foto. El permiso de Google Calendar
          te lo vamos a pedir más adelante, únicamente si querés usarlo.
        </p>
      </div>
    </main>
  );
}
