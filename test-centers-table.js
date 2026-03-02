// Test rescue_shelters table connection
// Run with: node test-centers-table.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://fwptmspvyazjbvcnfvsp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cHRtc3B2eWF6amJ2Y25mdnNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MzQ1MDEsImV4cCI6MjA4ODAxMDUwMX0.D7iKjsEhwjUa4soVhHwpAMrx8kgZGASLhFUXkSOcouE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testCentersTable() {
  console.log('\n🏥 Testing rescue_shelters table...\n')

  try {
    const { data, error } = await supabase
      .from('rescue_shelters')
      .select('*')
      .limit(5)

    if (error) {
      console.error('❌ Error querying rescue_shelters:')
      console.error('   Message:', error.message || 'No message')
      console.error('   Details:', error.details || 'No details')
      console.error('   Hint:', error.hint || 'No hint')
      console.error('   Code:', error.code || 'No code')
      
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        console.log('\n⚠️  The rescue_shelters table does not exist!')
        console.log('📝 Solution: Run the check-and-create-centers.sql script')
        console.log('   Location: supabase/check-and-create-centers.sql')
        console.log('   Open Supabase SQL Editor and run the script')
      } else if (error.message?.includes('policy') || error.message?.includes('permission')) {
        console.log('\n⚠️  Row Level Security (RLS) is blocking the query!')
        console.log('📝 Solution: The script will disable RLS for this table')
      }
      
      return false
    }

    console.log('✅ rescue_shelters table exists and is accessible!')
    console.log(`📊 Found ${data?.length || 0} centers:`)
    
    if (data && data.length > 0) {
      data.forEach((center, index) => {
        console.log(`   ${index + 1}. ${center.name} (${center.type || 'N/A'}) - ${center.operational_status}`)
      })
    } else {
      console.log('   ⚠️  Table is empty - run the SQL script to add sample data')
    }
    
    return true

  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    return false
  }
}

testCentersTable().then(success => {
  if (!success) {
    console.log('\n🔧 Next steps:')
    console.log('   1. Open Supabase dashboard')
    console.log('   2. Go to SQL Editor')
    console.log('   3. Run the check-and-create-centers.sql script')
    console.log('   4. Run this test again\n')
  } else {
    console.log('\n✅ Everything looks good!\n')
  }
  process.exit(success ? 0 : 1)
})
