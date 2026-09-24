import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

serve(async (request) => {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization) return new Response(JSON.stringify({ error: 'Authentication required.' }), { status: 401 });
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const client = createClient(supabaseUrl, serviceRoleKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) return new Response(JSON.stringify({ error: 'Authentication required.' }), { status: 401 });
    const { error } = await client.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return new Response(JSON.stringify({ deleted: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Unable to delete account.' }), { status: 400 });
  }
});
