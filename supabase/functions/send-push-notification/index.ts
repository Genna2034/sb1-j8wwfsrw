// Supabase Edge Function per l'invio di notifiche push
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import webpush from "npm:web-push@3.6.1";

// Configurazione VAPID keys
// In produzione, queste dovrebbero essere impostate come variabili d'ambiente
const VAPID_PUBLIC_KEY = "BLBx-hf5h3S-QuTlQJdAGgfQzrRJXQVTKfQH_Yq-Jj0Ij9GsOgJXlzDYFYMsfi3q-COjOIjU3c2Q8qIYkqYFJFo";
const VAPID_PRIVATE_KEY = "4M9wMRxNKJvbZZCQz0h_-2zqBbT_Xww_MFwGndCE65w";

// Configura web-push
webpush.setVapidDetails(
  "mailto:info@emmanuel.it",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Gestione richieste CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Verifica che sia una richiesta POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Metodo non supportato" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ottieni i dati dalla richiesta
    const { subscription, title, body, data } = await req.json();

    // Verifica che i dati necessari siano presenti
    if (!subscription || !title) {
      return new Response(JSON.stringify({ error: "Dati mancanti" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepara il payload della notifica
    const payload = JSON.stringify({
      title,
      body: body || "",
      data: data || {},
      icon: "/Screenshot 2025-06-09 alle 14.11.10.png",
      badge: "/Screenshot 2025-06-09 alle 14.11.10.png",
      vibrate: [100, 50, 100],
    });

    // Invia la notifica push
    await webpush.sendNotification(subscription, payload);

    // Restituisci una risposta di successo
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Errore nell'invio della notifica push:", error);

    // Restituisci una risposta di errore
    return new Response(
      JSON.stringify({
        error: "Errore nell'invio della notifica push",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});