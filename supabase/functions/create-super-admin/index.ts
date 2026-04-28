import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email: "admin@dietpadi.com",
    password: "Admin123!",
    email_confirm: true,
    user_metadata: { full_name: "Super Admin" },
  });

  if (createError) {
    return new Response(JSON.stringify({ error: createError.message }), { status: 400 });
  }

  const { error: roleError } = await supabase
    .from("user_roles")
    .insert({ user_id: user.user.id, role: "super_admin" });

  if (roleError) {
    return new Response(JSON.stringify({ error: roleError.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ success: true, userId: user.user.id }), { status: 200 });
});
