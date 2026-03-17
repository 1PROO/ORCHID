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
