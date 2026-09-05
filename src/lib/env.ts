type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function requiredPublicEnv(name: string): string {
  const value = process.env[name];
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
