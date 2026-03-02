import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, location, contactName, contactPhone, incidentType, latitude, longitude } = body

    // Validate required fields
    if (!description || !location || !contactName || !contactPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use provided coordinates or default to Tamil Nadu center
    const lat = latitude && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : 11.1271
    const lng = longitude && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : 78.6569
    const locationConfidence = (latitude && longitude) ? 1.0 : 0.5 // High confidence if provided

    // Insert incident into database
    const { data, error } = await supabaseAdmin
      .from('incidents')
      .insert([
        {
          title: `${incidentType} disaster in ${location}`,
          description,
          type: incidentType,
          address: location,
          latitude: lat,
          longitude: lng,
          location_confidence: locationConfidence,
          reported_by: contactName,
          reporter_phone: contactPhone,
          report_source: 'manual',
          urgency: 'high', // Default urgency
          urgency_score: 7, // Will be updated by AI later
          status: 'pending',
          people_affected: 1,
          ai_summary: null,
          ai_confidence: null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create incident', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        incident: data[0],
        message: 'Natural disaster report submitted successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query
    let query = supabaseAdmin
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch incidents' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        incidents: data,
        count: data.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
