export default function Home() {
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
        <p className="mt-8 inline-block rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          Fase 1: setup inicial ✅
        </p>
      </div>
    </main>
  );
}
