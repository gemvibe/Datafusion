import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

// Weather validation helper
async function validateWeather(lat: number, lon: number, disasterType: string) {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY
  
  if (!apiKey) {
    return { validated: false, reason: 'Weather API not configured' }
  }

  try {
    // Get current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    )
    const current = await currentResponse.json()

    // Get 16-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=7&appid=${apiKey}&units=metric`
    )
    const forecast = await forecastResponse.json()

    // Validate disaster type against weather
    const validation = {
      location: current.name || 'Unknown',
      country: current.sys?.country || '',
      state: current.sys?.state || '',
      temperature: current.main?.temp || 0,
      condition: current.weather?.[0]?.main || '',
      description: current.weather?.[0]?.description || '',
      rain: current.rain?.['1h'] || 0,
      wind: current.wind?.speed || 0,
      humidity: current.main?.humidity || 0,
    }

    // Check if disaster type matches weather conditions
    let weatherMatches = false
    let weatherReason = ''

    switch (disasterType.toLowerCase()) {
      case 'flood':
        weatherMatches = validation.rain > 10 || validation.humidity > 80 || validation.condition === 'Rain'
        weatherReason = weatherMatches 
          ? `Heavy rain detected (${validation.rain}mm/h) with ${validation.humidity}% humidity`
          : `No heavy rain detected (${validation.rain}mm/h, ${validation.humidity}% humidity). Current: ${validation.description}`
        break

      case 'heatwave':
        weatherMatches = validation.temperature > 35
        weatherReason = weatherMatches
          ? `High temperature confirmed: ${validation.temperature}°C`
          : `Temperature is normal: ${validation.temperature}°C (heatwave requires >35°C)`
        break

      case 'cyclone':
      case 'storm':
        weatherMatches = validation.wind > 15 || validation.condition === 'Thunderstorm'
        weatherReason = weatherMatches
          ? `Stormy conditions detected: ${validation.wind}m/s wind, ${validation.condition}`
          : `No storm detected: ${validation.wind}m/s wind, ${validation.condition}`
        break

      case 'drought':
        weatherMatches = validation.humidity < 30 && validation.rain === 0
        weatherReason = weatherMatches
          ? `Dry conditions: ${validation.humidity}% humidity, no rain`
          : `Not drought conditions: ${validation.humidity}% humidity`
        break

      default:
        // For earthquakes, tsunamis, etc. - weather doesn't apply
        weatherMatches = true
        weatherReason = `Weather validation not applicable for ${disasterType}`
    }

    return {
      validated: true,
      inIndia: validation.country === 'IN',
      location: validation.location,
      weatherMatches,
      weatherReason,
      weatherData: validation,
    }
  } catch (error) {
    console.error('Weather validation error:', error)
    return { validated: false, reason: 'Weather API error' }
  }
}

const SPAM_DETECTION_PROMPT = `You are a spam detection system for a disaster response platform in Tamil Nadu, India.

Analyze the following incident report and determine if it's spam or legitimate.

SPAM INDICATORS:
- Irrelevant content (advertisements, jokes, random text)
- Gibberish or nonsensical text
- Repeated characters or words (e.g., "aaaaa", "test test test")
- Marketing or promotional content
- Abusive or offensive language without real emergency
- Test submissions (e.g., "test", "testing123", "sample")
- Duplicate reports with identical wording
- Impossible scenarios or exaggerated claims
- No specific location or vague details
- Wrong location (outside Tamil Nadu/India)
- **Weather mismatch** (e.g., flood report but no rain in area)

LEGITIMATE INDICATORS:
- Specific location details (city, district, landmark in Tamil Nadu)
- Clear disaster type (flood, earthquake, cyclone, tsunami, landslide, heatwave)
- Realistic description of situation
- Specific details about damage or impact
- Urgent tone appropriate for emergency
- Proper contact information
- Tamil Nadu locations (Chennai, Coimbatore, Madurai, Salem, Trichy, etc.)
- **Weather conditions match disaster type**

Respond in JSON format:
{
  "isSpam": true/false,
  "confidence": 0-100,
  "reason": "brief explanation in 1-2 sentences",
  "category": "spam_type or legitimate"
}

Categories:
- For spam: "test_data", "advertisement", "gibberish", "offensive", "duplicate", "irrelevant", "impossible", "weather_mismatch"
- For legitimate: "legitimate"`

export async function POST(request: NextRequest) {
  try {
    const { incidentId } = await request.json()

    if (!incidentId) {
      return NextResponse.json(
        { error: 'Incident ID is required' },
        { status: 400 }
      )
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase credentials not configured' },
        { status: 500 }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Fetch incident details from Supabase
    const { data: incident, error: fetchError } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .single()

    if (fetchError || !incident) {
      console.error('Error fetching incident:', fetchError)
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      )
    }

    // Step 1: Validate weather conditions
    const weatherValidation = await validateWeather(
      incident.latitude,
      incident.longitude,
      incident.type
    )

    // Step 2: Prepare enhanced incident data with weather validation
    const incidentData = `
INCIDENT REPORT:
Type: ${incident.type || 'Not specified'}
Location: ${incident.address || 'Not specified'}
Landmark: ${incident.landmark || 'Not specified'}
Urgency: ${incident.urgency || 'Not specified'} (Score: ${incident.urgency_score || 'N/A'}/10)
Description: ${incident.description || 'No description'}
Reported By: ${incident.reported_by || 'Anonymous'}
Contact: ${incident.reporter_phone || 'Not provided'}
Source: ${incident.report_source || 'Unknown'}
Coordinates: ${incident.latitude || 'N/A'}, ${incident.longitude || 'N/A'}
Reported At: ${incident.created_at || 'Unknown'}

WEATHER VALIDATION (OpenWeatherMap):
${weatherValidation.validated ? `
✓ Weather Data Retrieved: Yes
✓ Location Name: ${weatherValidation.location || 'Unknown'}
✓ Country: ${weatherValidation.inIndia ? 'India ✓' : weatherValidation.weatherData?.country || 'Unknown ✗'}
✓ Temperature: ${weatherValidation.weatherData?.temperature || 'N/A'}°C
✓ Condition: ${weatherValidation.weatherData?.condition || 'N/A'} - ${weatherValidation.weatherData?.description || ''}
✓ Rain: ${weatherValidation.weatherData?.rain || 0}mm/h
✓ Wind: ${weatherValidation.weatherData?.wind || 0}m/s
✓ Humidity: ${weatherValidation.weatherData?.humidity || 0}%

WEATHER MATCH ANALYSIS:
${weatherValidation.weatherMatches ? '✓' : '✗'} Disaster Type vs Weather: ${weatherValidation.weatherReason}
${!weatherValidation.inIndia ? '⚠️ WARNING: Location is outside India!' : ''}
` : `
✗ Weather validation failed: ${weatherValidation.reason}
`}

IMPORTANT: Consider weather data when determining spam. If disaster type doesn't match current weather conditions, it may be spam UNLESS it's a developing situation or weather-independent disaster (earthquake, tsunami).
`

    // Use Gemini to analyze
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent results
        responseMimeType: 'application/json',
      },
    })

    const result = await model.generateContent(
      SPAM_DETECTION_PROMPT + '\n\n' + incidentData
    )
    const response = await result.response
    const text = response.text()
    
    let analysis
    try {
      analysis = JSON.parse(text)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      )
    }

    // Update incident in database with weather validation data
    const { error: updateError } = await supabase
      .from('incidents')
      .update({
        is_spam: analysis.isSpam,
        spam_score: analysis.confidence,
        spam_reason: analysis.reason,
        spam_checked_at: new Date().toISOString(),
        weather_validated: weatherValidation.validated,
        weather_matches: weatherValidation.weatherMatches,
        weather_data: weatherValidation.validated ? JSON.stringify(weatherValidation.weatherData) : null,
      })
      .eq('id', incidentId)

    if (updateError) {
      console.error('Error updating incident:', updateError)
      throw updateError
    }

    return NextResponse.json({
      success: true,
      incidentId,
      analysis,
      weatherValidation,
    })

  } catch (error: any) {
    console.error('Spam detection error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check spam' },
      { status: 500 }
    )
  }
}
