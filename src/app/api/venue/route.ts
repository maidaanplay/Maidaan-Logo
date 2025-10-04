import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase admin client lazily
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

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const searchParams = request.nextUrl.searchParams;
    const adminId = searchParams.get('adminId');
    const venueId = searchParams.get('venueId');

    if (adminId) {
      // Load venue by admin ID
      const { data: venue, error } = await supabaseAdmin
        .from('venues')
        .select('*, courts(*), pricing_rules(*)')
        .eq('owner_admin_id', adminId)
        .maybeSingle();

      if (error) throw error;

      return NextResponse.json({ venue });
    }

    if (venueId) {
      // Load venue by ID
      const { data: venue, error } = await supabaseAdmin
        .from('venues')
        .select('*, courts(*), pricing_rules(*)')
        .eq('id', venueId)
        .maybeSingle();

      if (error) throw error;

      return NextResponse.json({ venue });
    }

    // Load all venues
    const { data: venues, error } = await supabaseAdmin
      .from('venues')
      .select('*, courts(*), pricing_rules(*)');

    if (error) throw error;

    return NextResponse.json({ venues });
  } catch (error: any) {
    console.error('Venue API error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: error.message || error.hint || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const searchParams = request.nextUrl.searchParams;
    const venueId = searchParams.get('venueId');

    if (!venueId) {
      return NextResponse.json(
        { error: 'Venue ID is required' },
        { status: 400 }
      );
    }

    const updates = await request.json();

    // Update venue
    const { data: venue, error } = await supabaseAdmin
      .from('venues')
      .update(updates)
      .eq('id', venueId)
      .select('*, courts(*), pricing_rules(*)')
      .single();

    if (error) throw error;

    return NextResponse.json({ venue });
  } catch (error: any) {
    console.error('Venue update error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: error.message || error.hint || 'Internal server error' },
      { status: 500 }
    );
  }
}
