import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function categorizeReferrer(referrer: string): string {
  if (!referrer) return "direct";
  const r = referrer.toLowerCase();
  if (r.includes("google.")) return "google";
  if (r.includes("bing.")) return "bing";
  if (r.includes("yahoo.")) return "yahoo";
  if (r.includes("duckduckgo.")) return "duckduckgo";
  if (r.includes("baidu.")) return "baidu";
  if (r.includes("facebook.") || r.includes("fb.")) return "facebook";
  if (r.includes("twitter.") || r.includes("x.com") || r.includes("t.co")) return "twitter";
  if (r.includes("linkedin.")) return "linkedin";
  if (r.includes("instagram.")) return "instagram";
  if (r.includes("pinterest.")) return "pinterest";
  if (r.includes("reddit.")) return "reddit";
  if (r.includes("youtube.")) return "youtube";
  if (r.includes("tiktok.")) return "tiktok";
  if (r.includes("whatsapp.")) return "whatsapp";
  if (r.includes("telegram.")) return "telegram";
  return "other";
}

function detectDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|android.*mobile|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("chrome/") && !ua.includes("edg/")) return "Chrome";
  if (ua.includes("firefox/")) return "Firefox";
  if (ua.includes("safari/") && !ua.includes("chrome/")) return "Safari";
  if (ua.includes("msie") || ua.includes("trident/")) return "IE";
  return "Other";
}

function detectOS(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac os")) return "macOS";
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "iOS";
  if (ua.includes("linux")) return "Linux";
  if (ua.includes("chrome os")) return "Chrome OS";
  return "Other";
}

function guessCountry(headers: Headers): string {
  const lang = headers.get("accept-language") || "";
  const parts = lang.split(",");
  if (parts.length > 0) {
    const primary = parts[0].trim();
    const region = primary.match(/-([A-Z]{2})/);
    if (region) return region[1];
  }
  return "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const body = await req.json();
    const { type, payload } = body;

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabaseKey}`,
      "apikey": supabaseKey,
      "Prefer": "return=minimal",
    };

    if (type === "pageview") {
      const { path, referrer, sessionId, postId } = payload;
      const userAgent = req.headers.get("user-agent") || "";
      const refSource = categorizeReferrer(referrer);
      const device = detectDevice(userAgent);
      const browser = detectBrowser(userAgent);
      const os = detectOS(userAgent);
      const country = guessCountry(req.headers);

      await fetch(`${supabaseUrl}/rest/v1/page_views`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          path,
          post_id: postId || null,
          referrer: referrer || "",
          referrer_source: refSource,
          country,
          device_type: device,
          browser,
          os,
          session_id: sessionId,
          is_unique: true,
        }),
      });

      const sessionRes = await fetch(`${supabaseUrl}/rest/v1/visitor_sessions?id=eq.${sessionId}&select=id,page_count`, {
        headers,
      });
      const sessionData = await sessionRes.json();

      if (sessionData.length === 0) {
        await fetch(`${supabaseUrl}/rest/v1/visitor_sessions`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            id: sessionId,
            country,
            device_type: device,
            browser,
            os,
            referrer_source: refSource,
            landing_page: path,
            page_count: 1,
            last_activity: new Date().toISOString(),
          }),
        });
      } else {
        await fetch(`${supabaseUrl}/rest/v1/visitor_sessions?id=eq.${sessionId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            page_count: (sessionData[0].page_count || 0) + 1,
            last_activity: new Date().toISOString(),
          }),
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "click") {
      const { sessionId, elementType, elementId, path } = payload;

      await fetch(`${supabaseUrl}/rest/v1/click_events`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          session_id: sessionId,
          element_type: elementType,
          element_id: elementId || "",
          path: path || "",
        }),
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown event type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
