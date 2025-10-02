import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Lazy initialization of Supabase client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    const updates = await request.json();

    const supabaseAdmin = getSupabaseAdmin();

    // Update profile
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
