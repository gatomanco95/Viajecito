// Tipos de la base de datos de Supabase.
//
// Este archivo se va a AUTOGENERAR a partir del esquema real de Supabase
// (Fase 3 en adelante) con:
//
//   npx supabase gen types typescript --project-id TU_PROYECTO > src/types/database.types.ts
//
// Por ahora queda como placeholder para que los imports de tipos existan.

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
