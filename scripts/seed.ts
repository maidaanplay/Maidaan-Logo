import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedData() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Create or get admin user
    console.log('Creating admin user...');
    let { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@maidaan.com',
      password: 'admin123',
      email_confirm: true,
    });

    // If user already exists, fetch it
    if (authError && authError.message.includes('already been registered')) {
      console.log('Admin user already exists, fetching...');
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users?.users.find(u => u.email === 'admin@maidaan.com');

      if (!existingUser) {
        throw new Error('Could not find existing admin user');
      }

      authData = { user: existingUser } as any;
      console.log('✅ Admin user found:', existingUser.id);
    } else if (authError) {
      console.error('Error creating admin user:', authError);
      throw authError;
    } else {
      console.log('✅ Admin user created:', authData.user.id);
    }

    const adminUserId = authData.user.id;

    // 2. Create admin profile (or update if exists)
    console.log('\nCreating admin profile...');

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', adminUserId)
      .single();

    if (existingProfile) {
      console.log('✅ Admin profile already exists');
    } else {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: adminUserId,
          contact_number: '9999999999',
          profile_type: 'admin',
          name: 'Admin User',
          email: 'admin@maidaan.com',
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }
      console.log('✅ Admin profile created');
    }

    // 3. Create venue
    console.log('\nCreating venue...');
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .insert({
        owner_admin_id: adminUserId,
        name: 'Velocity Sports Hub',
        description: 'Premier sports facility with multiple courts and modern amenities',
        location: 'Andheri West, Mumbai, India',
        operating_hours: {
          opening_time: '06:00',
          closing_time: '23:00'
        },
        amenities: ['parking', 'changing-room', 'water', 'first-aid', 'wifi'],
        rating: 4.5,
      })
      .select()
      .single();

    if (venueError) {
      console.error('Error creating venue:', venueError);
      throw venueError;
    }
    console.log('✅ Venue created:', venue.id);

    // 4. Create courts
    console.log('\nCreating courts...');
    const courts = [
      {
        venue_id: venue.id,
        sport_type: 'basketball',
        court_number: 1,
        name: 'Basketball - Court 1',
        icon: '🏀',
        is_active: true,
      },
      {
        venue_id: venue.id,
        sport_type: 'basketball',
        court_number: 2,
        name: 'Basketball - Court 2',
        icon: '🏀',
        is_active: true,
      },
      {
        venue_id: venue.id,
        sport_type: 'volleyball',
        court_number: 1,
        name: 'Volleyball - Court 1',
        icon: '🏐',
        is_active: true,
      },
      {
        venue_id: venue.id,
        sport_type: 'badminton',
        court_number: 1,
        name: 'Badminton - Court 1',
        icon: '🏸',
        is_active: true,
      },
    ];

    const { error: courtsError } = await supabase
      .from('courts')
      .insert(courts);

    if (courtsError) {
      console.error('Error creating courts:', courtsError);
      throw courtsError;
    }
    console.log('✅ Courts created:', courts.length);

    // 5. Create pricing rules
    console.log('\nCreating pricing rules...');
    const pricingRules = [
      // Weekday pricing
      { venue_id: venue.id, time_period: 'morning', day_type: 'weekday', price_per_hour: 800 },
      { venue_id: venue.id, time_period: 'afternoon', day_type: 'weekday', price_per_hour: 1000 },
      { venue_id: venue.id, time_period: 'evening', day_type: 'weekday', price_per_hour: 1500 },
      // Weekend pricing
      { venue_id: venue.id, time_period: 'morning', day_type: 'weekend', price_per_hour: 1000 },
      { venue_id: venue.id, time_period: 'afternoon', day_type: 'weekend', price_per_hour: 1200 },
      { venue_id: venue.id, time_period: 'evening', day_type: 'weekend', price_per_hour: 1800 },
    ];

    const { error: pricingError } = await supabase
      .from('pricing_rules')
      .insert(pricingRules);

    if (pricingError) {
      console.error('Error creating pricing rules:', pricingError);
      throw pricingError;
    }
    console.log('✅ Pricing rules created:', pricingRules.length);

    // 6. Create a few player accounts
    console.log('\nCreating player accounts...');
    const players = [
      { email: 'player1@test.com', password: 'player123', name: 'John Doe', contact: '9876543210' },
      { email: 'player2@test.com', password: 'player123', name: 'Jane Smith', contact: '9876543211' },
    ];

    for (const player of players) {
      const { data: playerAuth, error: playerAuthError } = await supabase.auth.admin.createUser({
        email: player.email,
        password: player.password,
        email_confirm: true,
      });

      if (playerAuthError) {
        console.error(`Error creating player ${player.email}:`, playerAuthError);
        continue;
      }

      const { error: playerProfileError } = await supabase
        .from('profiles')
        .insert({
          id: playerAuth.user.id,
          contact_number: player.contact,
          profile_type: 'player',
          name: player.name,
          email: player.email,
          skill_level: 'bronze',
          points: 0,
          streak: 0,
        });

      if (playerProfileError) {
        console.error(`Error creating profile for ${player.email}:`, playerProfileError);
      } else {
        console.log(`✅ Player created: ${player.email}`);
      }
    }

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('Login credentials:');
    console.log('==================');
    console.log('Admin:');
    console.log('  Email: admin@maidaan.com');
    console.log('  Password: admin123');
    console.log('\nPlayers:');
    console.log('  Email: player1@test.com / Password: player123');
    console.log('  Email: player2@test.com / Password: player123');
    console.log('==================\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
