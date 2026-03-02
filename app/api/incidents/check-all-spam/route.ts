import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase credentials not configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    // Get all unchecked incidents
    const { data: incidents, error } = await supabase
      .from('incidents')
      .select('id')
      .is('spam_checked_at', null)
      .limit(50) // Process in batches of 50

    if (error) {
      console.error('Error fetching incidents:', error)
      throw error
    }

    if (!incidents || incidents.length === 0) {
      return NextResponse.json({
        success: true,
        checked: 0,
        message: 'No unchecked incidents found',
        results: [],
      })
    }

    const results = []
    let successCount = 0
    let failCount = 0
    
    // Check each incident sequentially to avoid rate limits
    for (const incident of incidents) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/incidents/check-spam`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ incidentId: incident.id }),
        })
        
        const result = await response.json()
        
        if (response.ok) {
          successCount++
          results.push({
            id: incident.id,
            success: true,
            analysis: result.analysis,
          })
        } else {
          failCount++
          results.push({
            id: incident.id,
            success: false,
            error: result.error,
          })
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (err: any) {
        failCount++
        results.push({
          id: incident.id,
          success: false,
          error: err.message || 'Failed to check spam',
        })
      }
    }

    return NextResponse.json({
      success: true,
      checked: incidents.length,
      successCount,
      failCount,
      results,
    })

  } catch (error: any) {
    console.error('Bulk spam check error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to perform bulk spam check' },
      { status: 500 }
    )
  }
}
