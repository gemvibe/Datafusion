import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    console.log('🧪 Testing Supabase connection...')
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // Test connection by querying incidents table
    const { data, error, count } = await supabase
      .from('incidents')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 })
    }
    
    console.log('✅ Supabase connected successfully')
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      incidentsCount: count,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL
    })
    
  } catch (error: any) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      type: error.constructor.name
    }, { status: 500 })
  }
}
