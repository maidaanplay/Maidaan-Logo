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
  }
});

async function resetDatabase() {
  console.log('🗑️  Resetting database...\n');

  try {
    // Drop all existing tables
    console.log('Dropping existing tables...');

    const dropTablesSQL = `
      -- Drop all tables in correct order (respecting foreign keys)
      DROP TABLE IF EXISTS match_players CASCADE;
      DROP TABLE IF EXISTS venue_amenities CASCADE;
      DROP TABLE IF EXISTS matches CASCADE;
      DROP TABLE IF EXISTS pricing_rules CASCADE;
      DROP TABLE IF EXISTS courts CASCADE;
      DROP TABLE IF EXISTS venues CASCADE;
      DROP TABLE IF EXISTS profiles CASCADE;
      DROP TABLE IF EXISTS amenities CASCADE;
      DROP TABLE IF EXISTS sports CASCADE;
    `;

    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: dropTablesSQL
    });

    // If RPC doesn't exist, use direct SQL execution
    // Note: This requires running the drop commands via SQL Editor manually
    // or having the exec_sql function created in Supabase

    console.log('✅ Existing tables dropped\n');

    // Read and execute the new schema
    console.log('Running new schema...');
    const schemaPath = join(process.cwd(), 'supabase-schema.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf-8');

    // Split by statement and execute
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`Executing ${statements.length} SQL statements...`);

    // Note: Supabase client doesn't support executing raw SQL directly
    // We need to output the SQL for manual execution

    console.log('\n⚠️  Cannot execute raw SQL via client. Please run the following:\n');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Run this SQL to drop tables:\n');
    console.log(dropTablesSQL);
    console.log('\n3. Then run the entire supabase-schema.sql file\n');
    console.log('4. After that, run: npm run seed\n');

  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();
