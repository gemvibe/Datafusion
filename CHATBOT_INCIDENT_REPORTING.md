# Chatbot Incident Reporting Feature

## Overview

The chatbot has been enhanced to collect incident information conversationally and automatically create entries in the incidents system. Users can now report disasters through natural conversation without filling out forms.

## How It Works

### 1. Starting Incident Mode

Users can start incident reporting in three ways:

1. **Click the "Report Incident" button** in the chatbot header
2. **Say phrases like:**
   - "I want to report an incident"
   - "File a report"
   - "Create incident"
   - "Submit report"
3. **Use the AI's suggestion** when it detects an emergency situation

### 2. Data Collection Process

Once in incident mode, the chatbot collects the following information step-by-step:

#### Required Fields:
1. **Disaster Type** - flood, earthquake, cyclone, tsunami, landslide, or heatwave
2. **Description** - What's happening? Details about the situation
3. **Location** - Full address or landmark (must include city/district)
4. **Contact Name** - Reporter's full name
5. **Contact Phone** - Reporter's phone number (10-digit format)

#### Optional Fields:
- **Latitude** - GPS coordinate
- **Longitude** - GPS coordinate

### 3. Conversational Flow Example

```
Bot: What type of natural disaster are you experiencing?
User: Flood

Bot: Can you describe what's happening? Please provide details about the flooding situation.
User: Water is rising rapidly near my house, already 2 feet high

Bot: Thank you. Can you tell me your exact location? Please include street name and district.
User: 123 Anna Nagar Main Road, Chennai

Bot: May I have your full name?
User: Raj Kumar

Bot: And your phone number so our response team can reach you?
User: 9876543210

Bot: [Shows confirmation with all details]
Type "confirm" to submit this report, or "cancel" to start over.

User: confirm

Bot: ✅ Incident Created Successfully!
```

### 4. Smart Features

#### Automatic Data Extraction
The chatbot intelligently extracts information from natural language:
- Recognizes disaster types mentioned anywhere in the message
- Detects location keywords (street, road, area, district, city names)
- Extracts phone numbers automatically
- Identifies GPS coordinates if provided

#### Visual Progress Tracking
- **Header Indicator:** Shows "Incident Reporting Mode" status
- **Progress Dots:** 5 dots showing which fields are collected (green = collected, gray = pending)
- **Live Checklist:** Displays what information has been collected and what's still needed

#### Quick Action Buttons
- In incident mode, shows relevant quick buttons (e.g., disaster type options)
- Shows "Confirm & Submit" and "Cancel" buttons when all data is collected

#### Cancel Anytime
- Click the "✕ Cancel" button in the chat header
- Say "cancel" or "start over" in the conversation
- Resets all collected data and returns to normal mode

## Technical Implementation

### API Changes ([route.ts](app/api/chat/route.ts))

1. **New System Prompt:** Added `INCIDENT_PROMPT` for incident collection mode
2. **Mode Parameter:** Added `incidentMode` flag to switch between normal and incident modes
3. **Data Tracking:** Added `incidentData` parameter to track collected information
4. **Trigger Detection:** Automatically detects when user wants to report an incident

### UI Changes ([page.tsx](app/(dashboard)/chatbot/page.tsx))

1. **State Management:**
   - `incidentMode` - Boolean flag for incident reporting mode
   - `incidentData` - Object storing collected incident fields
   - `creatingIncident` - Loading state when submitting

2. **New Functions:**
   - `extractIncidentData()` - Parses user responses to extract incident info
   - `isIncidentDataComplete()` - Checks if all required fields are collected
   - `createIncident()` - Submits the incident to the API
   - `startIncidentReporting()` - Initiates incident mode

3. **Visual Enhancements:**
   - Header shows incident mode status
   - Progress indicator with checkmarks
   - Different quick action buttons in incident mode
   - Chat header icon changes to 📋 in incident mode

### Data Flow

```
User Message → Extract Data → Update State → Send to AI → Get Response
                    ↓
              Check if Complete
                    ↓
         Show Confirmation → User Confirms → Create Incident → Success Message
```

## User Benefits

1. **Natural Conversation:** No need to remember field names or form structure
2. **Step-by-Step Guidance:** AI asks for information in a logical order
3. **Error Prevention:** Visual feedback shows what's collected
4. **Fast Submission:** Quick action buttons for common responses
5. **Transparent Process:** Always know what information is needed and what's been provided
6. **Safety First:** AI can still provide emergency guidance during the process

## Emergency Protocol

- If user mentions immediate danger, the AI reminds them to call 112 first
- Incident mode can be cancelled anytime without losing safety guidance capability
- All reported incidents are immediately marked as "pending" with high urgency
- Response teams are notified through the incidents system

## Integration

The chatbot directly integrates with:
- **Incidents API** (`/api/incidents`) - Creates incident records
- **Incidents Database** - Stores all incident data
- **Incidents Page** - Users can view their submitted reports
- **Response System** - Teams receive notifications

## Testing the Feature

1. Start the dev server: `npm run dev`
2. Navigate to the Chatbot page
3. Click "Report Incident" button
4. Follow the conversational prompts
5. Answer each question naturally
6. Review the confirmation
7. Type "confirm" to submit
8. Check the Incidents page to see the created entry

## Future Enhancements

Potential improvements:
- [ ] Image upload support for damage photos
- [ ] Voice input for hands-free reporting
- [ ] Multi-language support (Tamil, Hindi, etc.)
- [ ] Real-time location detection (browser geolocation)
- [ ] SMS integration for offline reporting
- [ ] WhatsApp bot integration
- [ ] AI-powered severity assessment
- [ ] Automatic duplicate detection

## Notes

- The chatbot uses Google Gemini AI for natural language understanding
- All conversations are stored in the chat history
- Incident data is validated before submission
- Phone numbers must be 10-digit Indian mobile numbers (6-9 prefix)
- Location must include enough detail for response teams to find the location
