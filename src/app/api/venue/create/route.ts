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

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const body = await request.json();
    const { adminId } = body;

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // Create default venue for admin
    const { data: venue, error: venueError } = await supabaseAdmin
      .from('venues')
      .insert({
        owner_admin_id: adminId,
        name: 'My Sports Venue',
        description: 'A premium sports facility',
        location: 'Mumbai, India',
        operating_hours: {
          opening_time: '06:00',
          closing_time: '23:00'
        },
        rating: 0,
        cancellation_cutoff_hours: 2,
        amenities: ['parking', 'changing-room', 'water', 'first-aid']
      })
      .select()
      .single();

    if (venueError) throw venueError;

    // Create default courts
    const courts = [
      {
        venue_id: venue.id,
        sport_type: 'basketball',
        court_number: 1,
        name: 'Basketball - Court 1',
        icon: '🏀',
        is_active: true
      },
      {
        venue_id: venue.id,
        sport_type: 'basketball',
        court_number: 2,
        name: 'Basketball - Court 2',
        icon: '🏀',
        is_active: true
      }
    ];

    const { error: courtsError } = await supabaseAdmin
      .from('courts')
      .insert(courts);

    if (courtsError) throw courtsError;

    // Create default pricing rules
    const pricingRules = [
      { venue_id: venue.id, time_period: 'morning', day_type: 'weekday', price_per_hour: 800 },
      { venue_id: venue.id, time_period: 'afternoon', day_type: 'weekday', price_per_hour: 1000 },
      { venue_id: venue.id, time_period: 'evening', day_type: 'weekday', price_per_hour: 1500 },
      { venue_id: venue.id, time_period: 'morning', day_type: 'weekend', price_per_hour: 1000 },
      { venue_id: venue.id, time_period: 'afternoon', day_type: 'weekend', price_per_hour: 1200 },
      { venue_id: venue.id, time_period: 'evening', day_type: 'weekend', price_per_hour: 1800 },
    ];

    const { error: pricingError } = await supabaseAdmin
      .from('pricing_rules')
      .insert(pricingRules);

    if (pricingError) throw pricingError;

    // Fetch complete venue with relations
    const { data: completeVenue, error: fetchError } = await supabaseAdmin
      .from('venues')
      .select('*, courts(*), pricing_rules(*)')
      .eq('id', venue.id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json({ venue: completeVenue });
  } catch (error: any) {
    console.error('Create venue API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
