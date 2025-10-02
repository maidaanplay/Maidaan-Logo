import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
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
