type QueueItem = {
  id: string;
  application_id: string;
  recipient_email: string;
  subject: string;
  message: string;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
const fromEmail = Deno.env.get("RESULT_FROM_EMAIL") ?? "KCS <noreply@example.com>";

Deno.serve(async () => {
  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return json({ ok: false, error: "Variables manquantes: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ou RESEND_API_KEY." }, 500);
  }

  const queueResponse = await fetch(`${supabaseUrl}/rest/v1/result_email_queue?status=eq.pending&select=*&order=created_at.asc&limit=25`, {
    headers: serviceHeaders()
  });

  if (!queueResponse.ok) {
    return json({ ok: false, error: await queueResponse.text() }, 500);
  }

  const items = (await queueResponse.json()) as QueueItem[];
  const results = [];

  for (const item of items) {
    try {
      const mailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromEmail,
          to: item.recipient_email,
          subject: item.subject,
          text: item.message
        })
      });

      if (!mailResponse.ok) {
        throw new Error(await mailResponse.text());
      }

      await markQueueItem(item, "sent");
      await fetch(`${supabaseUrl}/rest/v1/applications?id=eq.${item.application_id}`, {
        method: "PATCH",
        headers: serviceHeaders(),
        body: JSON.stringify({ result_email_sent_at: new Date().toISOString() })
      });
      results.push({ id: item.id, status: "sent" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur d'envoi inconnue.";
      await markQueueItem(item, "failed", message);
      results.push({ id: item.id, status: "failed", error: message });
    }
  }

  return json({ ok: true, processed: results.length, results });
});

function serviceHeaders() {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json"
  };
}

async function markQueueItem(item: QueueItem, status: "sent" | "failed", errorMessage?: string) {
  await fetch(`${supabaseUrl}/rest/v1/result_email_queue?id=eq.${item.id}`, {
    method: "PATCH",
    headers: serviceHeaders(),
    body: JSON.stringify({
      status,
      sent_at: status === "sent" ? new Date().toISOString() : null,
      error_message: errorMessage ?? null
    })
  });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
