type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

const PUBLIC_ENV = {
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
} as const;

type PublicEnvKey = keyof typeof PUBLIC_ENV;

function requiredPublicEnv(name: PublicEnvKey): string {
  const value = PUBLIC_ENV[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getPublicEnv(): PublicEnv {
  return {
    supabaseUrl: requiredPublicEnv('EXPO_PUBLIC_SUPABASE_URL'),
    supabaseAnonKey: requiredPublicEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  };
}
