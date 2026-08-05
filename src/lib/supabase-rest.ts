const suppliedRestUrl = process.env.NEXT_PUBLIC_SUPABASE_REST_URL ?? "";
const suppliedProjectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const supabaseRestUrl = normalizeRestUrl(suppliedRestUrl || suppliedProjectUrl);
export const supabaseProjectUrl = normalizeProjectUrl(suppliedProjectUrl || suppliedRestUrl);
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseRestUrl && supabaseProjectUrl && supabasePublishableKey);

type SupabasePayload = Record<string, string>;

export type SupabaseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function insertApplication(payload: SupabasePayload): Promise<SupabaseResult<unknown>> {
  return supabaseFetch(`${supabaseRestUrl}/applications`, {
    method: "POST",
    headers: {
      Prefer: "return=representation"
    },
    body: JSON.stringify(payload)
  });
}

export async function signInWithPassword(email: string, password: string): Promise<SupabaseResult<unknown>> {
  return supabaseFetch(`${supabaseProjectUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

async function supabaseFetch<T>(url: string, init: RequestInit): Promise<SupabaseResult<T>> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured." };
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${supabasePublishableKey}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {})
      }
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      return { ok: false, error: data?.message ?? data?.error_description ?? data?.hint ?? response.statusText };
    }

    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unexpected Supabase request failure." };
  }
}

function normalizeRestUrl(value: string) {
  const trimmed = value.replace(/\/+$/, "");

  if (!trimmed) {
    return "";
  }

  return trimmed.endsWith("/rest/v1") ? trimmed : `${trimmed}/rest/v1`;
}

function normalizeProjectUrl(value: string) {
  return value.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}
