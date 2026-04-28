import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let body: {
    email: string;
    password: string;
    full_name?: string;
    specialty?: string;
    role?: string;
    phone?: string;
    license_number?: string;
    clinic?: string;
    permissions?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { email, password, full_name, specialty, role, phone, license_number, clinic, permissions } = body;
  const userRole = role || "provider";

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name || "" },
  });

  if (createError) {
    return new Response(JSON.stringify({ error: createError.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error: roleError } = await supabase
    .from("user_roles")
    .insert({ user_id: user.user.id, role: userRole });

  if (roleError) {
    return new Response(JSON.stringify({ error: roleError.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Update profile with additional fields
  const profileUpdate: Record<string, string | null> = {};
  if (specialty) profileUpdate.specialty = specialty;
  if (phone) profileUpdate.phone = phone;
  if (license_number) profileUpdate.license_number = license_number;
  if (clinic) profileUpdate.clinic = clinic;

  if (Object.keys(profileUpdate).length > 0) {
    await supabase.from("profiles").update(profileUpdate).eq("user_id", user.user.id);
  }

  // Insert admin permissions if role is admin
  if (userRole === 'admin' && permissions && permissions.length > 0) {
    const permRows = permissions.map(p => ({ admin_user_id: user.user.id, permission: p }));
    await supabase.from("admin_permissions").insert(permRows);
  }

  return new Response(JSON.stringify({ success: true, userId: user.user.id }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
