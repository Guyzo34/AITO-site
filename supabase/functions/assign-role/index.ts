import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { email, role, userId } = await req.json()
    if ((!email && !userId) || !role) {
      return new Response(JSON.stringify({ error: 'email (ou userId) et role requis' }), { status: 400, headers: corsHeaders })
    }

    const validRoles = ['admin','president','vicepresident','secretaire','tresorier','membre']
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: 'Role invalide' }), { status: 400, headers: corsHeaders })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Vérifier que l'appelant est président ou admin
    const jwt = req.headers.get('Authorization')?.replace('Bearer ', '')
    const { data: { user: caller }, error: callerErr } = await supabaseAdmin.auth.getUser(jwt!)
    if (callerErr || !caller || !['president','admin'].includes(caller.user_metadata?.role)) {
      return new Response(JSON.stringify({ error: 'Non autoris\u00e9' }), { status: 403, headers: corsHeaders })
    }

    // Trouver l'userId par email si nécessaire
    let targetUserId = userId
    if (!targetUserId && email) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      const target = users?.users?.find((u: { email: string }) => u.email === email)
      if (!target) {
        return new Response(JSON.stringify({ error: `Aucun compte trouv\u00e9 pour ${email}. Le membre doit d\u2019abord cr\u00e9er un compte.` }), { status: 404, headers: corsHeaders })
      }
      targetUserId = target.id
    }

    // Assigner le rôle
    const { error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      user_metadata: { role }
    })
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })

    return new Response(JSON.stringify({ success: true, userId: targetUserId, role }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
  }
})
