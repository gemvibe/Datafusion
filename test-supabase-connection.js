// Quick test to verify Supabase connection
// Run with: node test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js')

// Hardcode the values from .env.local for testing
const supabaseUrl = 'https://fwptmspvyazjbvcnfvsp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cHRtc3B2eWF6amJ2Y25mdnNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MzQ1MDEsImV4cCI6MjA4ODAxMDUwMX0.D7iKjsEhwjUa4soVhHwpAMrx8kgZGASLhFUXkSOcouE'

console.log('\n🔍 Testing Supabase Connection...\n')
console.log('Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('\n📊 Testing incidents table...')
    
    // Try to query incidents
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('❌ Error querying incidents:')
      console.error('   Message:', error.message || 'No message')
      console.error('   Details:', error.details || 'No details')
      console.error('   Hint:', error.hint || 'No hint')
      console.error('   Code:', error.code || 'No code')
      
      // Check if it's an RLS issue
      if (error.message.includes('policy') || error.message.includes('permission')) {
        console.log('\n⚠️  This looks like a Row Level Security (RLS) issue!')
        console.log('📝 Solution: Run the disable-rls.sql script in your Supabase SQL Editor')
        console.log('   Location: supabase/disable-rls.sql')
      } else if (error.message.includes('SSL') || error.message.includes('fetch') || error.message.includes('<!DOCTYPE')) {
        console.log('\n⚠️  This looks like a network/SSL connectivity issue!')
        console.log('📝 Possible solutions:')
        console.log('   1. Check your internet connection')
        console.log('   2. Check Supabase status: https://status.supabase.com')
        console.log('   3. Try disabling VPN or proxy if you\'re using one')
        console.log('   4. Wait a few minutes and try again')
      }
    } else {
      console.log('✅ Successfully connected to incidents table')
      console.log(`📈 Found ${data?.length || 0} incidents`)
      if (data && data.length > 0) {
        console.log('\n📋 Sample incident:')
        console.log('   Title:', data[0].title)
        console.log('   Type:', data[0].type)
        console.log('   Status:', data[0].status)
        console.log('   Urgency:', data[0].urgency)
      } else {
        console.log('\n💡 No incidents in database yet.')
        console.log('📝 Run populate-sample-data.sql to add sample data')
      }
    }
    
    // Test rescue_shelters
    console.log('\n🏥 Testing rescue_shelters table...')
    const { data: centers, error: centersError } = await supabase
      .from('rescue_shelters')
      .select('*')
      .limit(3)
    
    if (centersError) {
      console.error('❌ Error querying rescue_shelters:', centersError.message)
    } else {
      console.log(`✅ Found ${centers?.length || 0} rescue shelters`)
      if (centers && centers.length > 0) {
        console.log('   Example:', centers[0].name)
      } else {
        console.log('💡 No rescue shelters yet. Run populate-sample-data.sql')
      }
    }
    
    // Test UPDATE capability
    console.log('\n🔄 Testing UPDATE permissions...')
    const testIncident = data && data.length > 0 ? data[0] : null
    if (testIncident) {
      const { error: updateError } = await supabase
        .from('incidents')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', testIncident.id)
      
      if (updateError) {
        console.error('❌ Cannot update incidents:', updateError.message)
        if (updateError.message.includes('policy') || updateError.message.includes('permission')) {
          console.log('⚠️  RLS is blocking updates! Run disable-rls.sql')
        }
      } else {
        console.log('✅ Update permissions working')
      }
    } else {
      console.log('⏭️  Skipping update test (no incidents to test with)')
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    console.error('Full error:', err)
  }
}

testConnection().then(() => {
  console.log('\n✨ Test complete\n')
  process.exit(0)
})
