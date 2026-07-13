import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Traemos el perfil (nombre/foto) desde nuestra tabla `profiles`.
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, avatar_url, email")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="max-w-xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Viajecito ✈️
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Organizá tus viajes en grupo: itinerario, vuelos, hospedaje, gastos
          compartidos y chat interno. Cada viaje, su propio espacio.
        </p>

        {user ? (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              {profile?.avatar_url && (
                <Image
                  src={profile.avatar_url}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full"
                  unoptimized
                />
              )}
              <span className="text-sm font-medium">
                Hola, {profile?.full_name ?? user.email} 👋
              </span>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="mt-8 inline-block rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </main>
  );
}
