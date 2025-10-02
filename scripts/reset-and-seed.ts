import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function executeSQL(sql: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${error}`);
  }

  return response.json();
}

async function resetAndSeed() {
  console.log('🔄 Resetting and seeding database...\n');

  try {
    // Read the SQL file
    const schemaPath = join(process.cwd(), 'supabase-reset-and-schema.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf-8');

    console.log('📄 Read schema file');
    console.log('📤 Executing SQL via Supabase API...\n');

    // Try to execute via API
    try {
      await executeSQL(schemaSQL);
      console.log('✅ Schema reset and created successfully!\n');
    } catch (error: any) {
      console.log('⚠️  Direct SQL execution not available.');
      console.log('This is normal - Supabase requires SQL to be run via the dashboard.\n');
      console.log('Please follow these steps:\n');
      console.log('1. Go to: https://supabase.com/dashboard/project/phnvrgxurctcnyuajqwo/sql');
      console.log('2. Click "New query"');
      console.log('3. Copy the contents of: supabase-reset-and-schema.sql');
      console.log('4. Paste into the SQL Editor');
      console.log('5. Click "Run" (or press Cmd+Enter)\n');
      console.log('After running the schema, run this script again.\n');
      process.exit(1);
    }

    // Now seed the data
    console.log('🌱 Seeding database...\n');

    // 1. Get admin user
    console.log('Fetching admin user...');
    const { data: users } = await supabase.auth.admin.listUsers();
    const adminUser = users?.users.find(u => u.email === 'admin@maidaan.com');

    if (!adminUser) {
      throw new Error('Admin user not found. Please create one first.');
    }

    const adminUserId = adminUser.id;
    console.log('✅ Admin user found:', adminUserId);

    // 2. Create admin profile
    console.log('\nCreating admin profile...');
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
    const { data: existingVenue } = await supabase
      .from('venues')
      .select('id')
      .eq('owner_admin_id', adminUserId)
      .single();

    let venueId: string;

    if (existingVenue) {
      venueId = existingVenue.id;
      console.log('✅ Venue already exists:', venueId);
    } else {
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

      venueId = venue.id;
      console.log('✅ Venue created:', venueId);
    }

    // 4. Create courts
    console.log('\nCreating courts...');
    const { data: existingCourts } = await supabase
      .from('courts')
      .select('id')
      .eq('venue_id', venueId);

    if (existingCourts && existingCourts.length > 0) {
      console.log('✅ Courts already exist:', existingCourts.length);
    } else {
      const courts = [
        {
          venue_id: venueId,
          sport_type: 'basketball',
          court_number: 1,
          name: 'Basketball - Court 1',
          icon: '🏀',
          is_active: true,
        },
        {
          venue_id: venueId,
          sport_type: 'basketball',
          court_number: 2,
          name: 'Basketball - Court 2',
          icon: '🏀',
          is_active: true,
        },
        {
          venue_id: venueId,
          sport_type: 'volleyball',
          court_number: 1,
          name: 'Volleyball - Court 1',
          icon: '🏐',
          is_active: true,
        },
        {
          venue_id: venueId,
          sport_type: 'badminton',
          court_number: 1,
          name: 'Badminton - Court 1',
          icon: '🏸',
          is_active: true,
        },
      ];

      const { error: courtsError } = await supabase.from('courts').insert(courts);

      if (courtsError) {
        console.error('Error creating courts:', courtsError);
        throw courtsError;
      }
      console.log('✅ Courts created:', courts.length);
    }

    // 5. Create pricing rules
    console.log('\nCreating pricing rules...');
    const { data: existingPricing } = await supabase
      .from('pricing_rules')
      .select('id')
      .eq('venue_id', venueId);

    if (existingPricing && existingPricing.length > 0) {
      console.log('✅ Pricing rules already exist:', existingPricing.length);
    } else {
      const pricingRules = [
        { venue_id: venueId, time_period: 'morning', day_type: 'weekday', price_per_hour: 800 },
        { venue_id: venueId, time_period: 'afternoon', day_type: 'weekday', price_per_hour: 1000 },
        { venue_id: venueId, time_period: 'evening', day_type: 'weekday', price_per_hour: 1500 },
        { venue_id: venueId, time_period: 'morning', day_type: 'weekend', price_per_hour: 1000 },
        { venue_id: venueId, time_period: 'afternoon', day_type: 'weekend', price_per_hour: 1200 },
        { venue_id: venueId, time_period: 'evening', day_type: 'weekend', price_per_hour: 1800 },
      ];

      const { error: pricingError } = await supabase.from('pricing_rules').insert(pricingRules);

      if (pricingError) {
        console.error('Error creating pricing rules:', pricingError);
        throw pricingError;
      }
      console.log('✅ Pricing rules created:', pricingRules.length);
    }

    // 6. Create player accounts
    console.log('\nCreating player accounts...');
    const players = [
      { email: 'player1@test.com', password: 'player123', name: 'John Doe', contact: '9876543210' },
      { email: 'player2@test.com', password: 'player123', name: 'Jane Smith', contact: '9876543211' },
    ];

    for (const player of players) {
      let playerAuth = users?.users.find(u => u.email === player.email);

      if (!playerAuth) {
        const { data, error } = await supabase.auth.admin.createUser({
          email: player.email,
          password: player.password,
          email_confirm: true,
        });

        if (error) {
          console.log(`⚠️  Skipping ${player.email}:`, error.message);
          continue;
        }
        playerAuth = data.user;
      }

      const { data: existingPlayerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', playerAuth.id)
        .single();

      if (existingPlayerProfile) {
        console.log(`✅ Player ${player.email} already has profile`);
      } else {
        const { error: playerProfileError } = await supabase
          .from('profiles')
          .insert({
            id: playerAuth.id,
            contact_number: player.contact,
            profile_type: 'player',
            name: player.name,
            email: player.email,
            skill_level: 'bronze',
            points: 0,
            streak: 0,
          });

        if (playerProfileError) {
          console.log(`⚠️  Error creating profile for ${player.email}:`, playerProfileError.message);
        } else {
          console.log(`✅ Player created: ${player.email}`);
        }
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
    console.error('\n❌ Operation failed:', error);
    process.exit(1);
  }
}

resetAndSeed();
