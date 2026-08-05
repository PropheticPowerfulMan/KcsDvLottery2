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

export async function signUpWithPassword(email: string, password: string, fullName: string): Promise<SupabaseResult<unknown>> {
  return supabaseFetch(`${supabaseProjectUrl}/auth/v1/signup`, {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      data: {
        role: "student",
        full_name: fullName
      }
    })
  });
}

export async function signInWithPassword(email: string, password: string): Promise<SupabaseResult<unknown>> {
  return supabaseFetch(`${supabaseProjectUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export async function getOwnApplications(accessToken: string): Promise<SupabaseResult<unknown[]>> {
  return supabaseFetch(`${supabaseRestUrl}/applications?select=*&order=created_at.desc`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export async function getAdminApplicationMetrics(): Promise<SupabaseResult<unknown[]>> {
  return supabaseFetch(`${supabaseRestUrl}/admin_application_metrics?select=*&order=created_at.desc`, {
    method: "GET"
  });
}

export async function uploadPaymentProof(reference: string, file: File): Promise<SupabaseResult<{ path: string }>> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase n'est pas configuré." };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const objectName = `${Date.now()}-${safeName}`;
  const path = `${reference}/${objectName}`;

  try {
    const response = await fetch(`${supabaseProjectUrl}/storage/v1/object/payment-proofs/${reference}/${encodeURIComponent(objectName)}`, {
      method: "POST",
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${supabasePublishableKey}`,
        "Content-Type": file.type || "application/octet-stream"
      },
      body: file
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      return { ok: false, error: translateSupabaseError(data?.message ?? data?.error ?? response.statusText) };
    }

    return { ok: true, data: { path } };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? translateSupabaseError(error.message) : "L'envoi de la preuve a échoué." };
  }
}

async function supabaseFetch<T>(url: string, init: RequestInit): Promise<SupabaseResult<T>> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase n'est pas configuré." };
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
      return { ok: false, error: translateSupabaseError(data?.message ?? data?.error_description ?? data?.error ?? data?.hint ?? response.statusText) };
    }

    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? translateSupabaseError(error.message) : "La requête Supabase a échoué." };
  }
}

function translateSupabaseError(message: string) {
  if (!message || !message.trim()) {
    return "Supabase n'a pas renvoyé de détail. Vérifiez que le compte, l'e-mail et la configuration Auth sont valides.";
  }

  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("email not confirmed") || lowerMessage.includes("email_not_confirmed")) {
    return "L'adresse e-mail n'est pas encore confirmée.";
  }

  if (lowerMessage.includes("invalid login credentials")) {
    return "Identifiants de connexion invalides.";
  }

  if (lowerMessage.includes("duplicate key")) {
    return "Un dossier avec cette référence existe déjà.";
  }

  if (lowerMessage.includes("user already registered") || lowerMessage.includes("already registered")) {
    return "Un compte existe déjà avec cette adresse e-mail.";
  }

  if (lowerMessage.includes("failed to fetch")) {
    return "Impossible de joindre Supabase. Vérifiez la connexion Internet.";
  }

  if (lowerMessage.includes("bucket not found") || lowerMessage.includes("bucket")) {
    return "Le stockage des preuves n'est pas encore configuré. Exécutez le fichier supabase/setup.sql dans Supabase.";
  }

  if (lowerMessage.includes("row-level security") || lowerMessage.includes("violates row-level security")) {
    return "Supabase bloque cette action par sécurité. Exécutez le fichier supabase/setup.sql mis à jour.";
  }

  return message;
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
