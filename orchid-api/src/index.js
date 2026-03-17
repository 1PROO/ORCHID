const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Helper function to trigger Pusher event
    async function triggerPusher(event, data) {
      const pusherConfig = {
        appId: "2129129",
        key: "c5a1bdf3dd3a80627a6b",
        secret: "64b80d73de9ef9980dad",
        cluster: "us3"
      };

      const path = `/apps/${pusherConfig.appId}/events`;
      const body = JSON.stringify({
        name: event,
        channels: ["bookings-channel"],
        data: JSON.stringify(data)
      });

      const timestamp = Math.floor(Date.now() / 1000);
      const authQuery = `auth_key=${pusherConfig.key}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${await md5(body)}`;
      const authSignature = await hmacSha256(pusherConfig.secret, `POST\n${path}\n${authQuery}`);
      
      const url = `https://api-${pusherConfig.cluster}.pusher.com${path}?${authQuery}&auth_signature=${authSignature}`;

      await fetch(url, {
        method: "POST",
        body: body,
        headers: { "Content-Type": "application/json" }
      });
    }

    // MD5 helper for Pusher auth
    async function md5(str) {
      const msgUint8 = new TextEncoder().encode(str);
      const hashBuffer = await crypto.subtle.digest("MD5", msgUint8);
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
    }

    // HMAC-SHA256 helper for Pusher auth
    async function hmacSha256(key, message) {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(key);
      const messageData = encoder.encode(message);
      const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
      return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, "0")).join("");
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Endpoint: Create new booking (Public)
    if (path === "/api/bookings" && request.method === "POST") {
      try {
        const data = await request.json();
        const stmt = env.DB.prepare(`
          INSERT INTO bookings (
            category, service, sub_type, duration, date, time, 
            weight, height, goal, injuries, experience, 
            name, phone, gender, notes
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
        `).bind(
          data.categoryId || null, data.serviceId || null, data.subType || null, data.duration || null,
          data.date || null, data.time || null, data.weight || null, data.height || null, 
          data.goal || null, data.injuries || null, data.experience || null,
          data.name || null, data.phone || null, data.gender || null, data.notes || null
        );
        await stmt.run();

        // Trigger Real-time update via Pusher
        await triggerPusher("new-booking", { message: "New booking received!", name: data.name });

        return new Response(JSON.stringify({ success: true }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { 
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
    }

    // --- Authentication Middleware for Admin Routes ---
    const authHeader = request.headers.get("Authorization");
    const expectedToken = `Bearer ${env.ADMIN_PASSWORD}`;
    
    // Protect GET, PATCH, and DELETE on admin routes
    const isAdminMethod = ["GET", "PATCH", "DELETE"].includes(request.method);
    if (path.startsWith("/api/bookings") && isAdminMethod) {
      if (!authHeader || authHeader !== expectedToken) {
        return new Response(JSON.stringify({ error: "Unauthorized: Invalid or missing Bearer token" }), { 
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
    }

    // 2. Endpoint: Get all bookings (Admin only)
    if (path === "/api/bookings" && request.method === "GET") {
      try {
        const { results } = await env.DB.prepare("SELECT * FROM bookings ORDER BY created_at DESC").all();
        return new Response(JSON.stringify({ bookings: results }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      } catch (e) {
         return new Response(JSON.stringify({ error: e.message }), { 
           status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
         });
      }
    }

    // 3. Endpoint: Update booking status (Admin only)
    if (path.match(/^\/api\/bookings\/\d+\/status$/) && request.method === "PATCH") {
      const id = path.split("/")[3];
      try {
        const { status } = await request.json();
        const stmt = env.DB.prepare(`
          UPDATE bookings SET status = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2
        `).bind(status, id);
        await stmt.run();
        return new Response(JSON.stringify({ success: true }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      } catch (e) {
         return new Response(JSON.stringify({ error: e.message }), { 
           status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
         });
      }
    }

    // 4. Endpoint: Delete booking (Admin only)
    if (path.match(/^\/api\/bookings\/\d+$/) && request.method === "DELETE") {
      const id = path.split("/")[3];
      try {
        const stmt = env.DB.prepare("DELETE FROM bookings WHERE id = ?1").bind(id);
        await stmt.run();
        return new Response(JSON.stringify({ success: true }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      } catch (e) {
         return new Response(JSON.stringify({ error: e.message }), { 
           status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
         });
      }
    }

    // Return 404 for unknown routes
    return new Response(JSON.stringify({ error: "Not Found" }), { 
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
}
