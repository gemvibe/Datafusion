import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

// System prompt for emergency assistant
const SYSTEM_PROMPT = `You are an AI Emergency Assistant for Tamil Nadu's First72 disaster response system. Your role is to:

1. **Provide immediate emergency guidance** for natural disasters (floods, earthquakes, cyclones, tsunamis, landslides, heatwaves)
2. **Stay calm and reassuring** - people are in distress
3. **Give actionable safety instructions** specific to Tamil Nadu
4. **Help users report incidents** by gathering: location, disaster type, severity, people affected
5. **Direct to emergency services** when life-threatening: 112 (Emergency), 1077 (State Disaster Helpline)
6. **Keep responses short and clear** - 2-3 sentences max unless asked for details
7. **Use simple language** - avoid technical jargon
8. **Be culturally aware** - understand Tamil Nadu geography, cities, and monsoon patterns

**Important Guidelines:**
- If someone is in immediate danger → Tell them to call 112 first, then assist
- For floods → Move to higher ground, avoid water, don't touch electrical lines
- For earthquakes → Drop, Cover, Hold On, then evacuate if safe
- For cyclones → Stay indoors, away from windows, in interior rooms
- Always ask for their location (city/district) to give specific advice
- Offer to help them file an incident report through the system

**Response Format:**
- Start with immediate safety action if urgent
- Then provide next steps
- End by asking what else they need

Remember: You're here to save lives and coordinate disaster response across Tamil Nadu.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, action } = body

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Gemini API key not configured',
          message: 'Please add GOOGLE_GEMINI_API_KEY to your .env.local file'
        },
        { status: 500 }
      )
    }

    // Get the Gemini model with system instruction
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    })

    // Handle quick action buttons
    let userMessage = messages[messages.length - 1]?.content || ''
    
    if (action) {
      switch (action) {
        case 'flood':
          userMessage = 'I need help with a flood emergency. What should I do?'
          break
        case 'earthquake':
          userMessage = 'There was an earthquake. What are the safety steps?'
          break
        case 'cyclone':
          userMessage = 'A cyclone is approaching. How should I prepare?'
          break
        case 'safety':
          userMessage = 'Can you give me general safety tips for disasters?'
          break
      }
    }

    // Build conversation history (excluding the current message)
    const conversationHistory = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))

    // Start chat with history
    const chat = model.startChat({
      history: conversationHistory,
    })

    // Send just the user message (system prompt is in systemInstruction)
    const result = await chat.sendMessage(userMessage)
    const response = await result.response
    const text = response.text()

    // Check if the response suggests filing a report
    const shouldFileReport = text.toLowerCase().includes('report') || 
                            text.toLowerCase().includes('incident') ||
                            text.toLowerCase().includes('file')

    return NextResponse.json({
      success: true,
      message: text,
      suggestReport: shouldFileReport,
      metadata: {
        model: 'gemini-2.5-flash',
        timestamp: new Date().toISOString(),
      }
    })

  } catch (error: any) {
    console.error('❌ Chat API Error:', error)
    
    // Handle specific Gemini errors
    if (error.message?.includes('API_KEY_INVALID')) {
      return NextResponse.json(
        { 
          error: 'Invalid Gemini API key',
          message: 'Please check your GOOGLE_GEMINI_API_KEY in .env.local'
        },
        { status: 401 }
      )
    }

    if (error.message?.includes('QUOTA_EXCEEDED')) {
      return NextResponse.json(
        { 
          error: 'API quota exceeded',
          message: 'Gemini API quota exceeded. Please check your Google AI Studio dashboard.'
        },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Chat service error',
        message: error.message || 'Failed to generate response. Please try again.'
      },
      { status: 500 }
    )
  }
}

// GET endpoint for testing
export async function GET() {
  const hasApiKey = !!process.env.GOOGLE_GEMINI_API_KEY
  
  return NextResponse.json({
    service: 'First72 Tamil Nadu Chat API',
    status: hasApiKey ? 'configured' : 'missing_api_key',
    model: 'gemini-1.5-flash',
    message: hasApiKey 
      ? 'Chat API is ready to assist with emergencies'
      : 'Please add GOOGLE_GEMINI_API_KEY to .env.local file'
  })
}
