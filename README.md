# Hope Link - AI-Powered Disaster Response Platform

Tamil Nadu's comprehensive disaster response platform with AI-powered emergency assistance, smart dispatch system, and real-time coordination capabilities.

## 🚀 Features

### Intelligence & Intake
- Multi-source distress ingestion (SMS, voice, social media, manual)
- Gemini-powered AI triage and classification
- Automatic need type extraction
- Urgency scoring (1-10)
- Landmark-based location parsing
- AI confidence scoring
- Credibility & fake signal detection

### AI Emergency Chatbot 🤖
- Conversational emergency guidance
- Real-time victim assistance
- Safety instructions based on disaster type
- Guided SOS form filling
- Multi-language support
- Escalation to dispatch tickets

### Smart Dispatch
- Nearest rescue shelter routing
- Load-aware center selection  
- Priority queue management
- Critical medical fast-track
- ETA prediction
- Duplicate incident detection
- Smart request batching

### Command Center
- Live incident map with real-time updates
- Hotspot heatmap visualization
- Rescue shelter status monitoring
- Real-time incident feed
- AI explanation panel
- System analytics dashboard
- Advanced filtering & search

### Field Operations
- Mobile-optimized responder mode
- Mission tracking
- Navigation-ready incidents
- Status updates (En Route, On Scene, Completed)
- Victim status tracking
- Photo/voice note uploads

### Resilience & Accessibility
- Low-network awareness
- Offline data storage
- Store-and-forward message queue
- Multi-language support
- Screen reader compatible
- High contrast mode

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Maps**: Mapbox / Google Maps
- **Real-time**: Socket.io / Supabase Realtime
- **Authentication**: Supabase Auth
- **Communication**: Twilio (SMS/Voice)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/gemvibe/Datafusion.git
cd Datafusion
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create project at https://supabase.com
   - Run SQL from `supabase/schema.sql` in SQL Editor
   - Copy your credentials to `.env`

4. **Configure environment variables**
```bash
cp .env.example .env
```
Edit `.env` and add your Supabase URL, keys, and other API keys.

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## � Authentication & Roles

DataFusion features **automatic role-based authentication** that assigns user roles based on email addresses.

### Automatic Role Assignment

When users sign up, their role is automatically determined:

- **Admin Role**: Assigned to specific emails
  - `sakthivelanss02@gmail.com`
  - `admin@datafusion.com`
  - Any email with `@admin.` domain (e.g., `user@admin.company.com`)

- **Command Center**: Assigned to emails with
  - `@command.` domain
  - `@ops.` domain

- **Responder**: Default role for all other users

### Adding Admin Users

To add more admin emails, edit `app/(auth)/signup/page.tsx`:

```typescript
const ADMIN_EMAILS = [
  'admin@datafusion.com',
  'sakthivelanss02@gmail.com',
  'your-email@here.com',  // Add your admin email
]
```

### User Experience

1. **Sign Up**: Users enter name, email, and password only (no role selection)
2. **Auto-Role**: System assigns role based on email automatically
3. **Smart Redirect**: 
   - Admins → `/admin` (Admin Dashboard)
   - Others → `/dashboard` (User Dashboard)

### First Admin Setup

1. Visit `/signup`
2. Use email: `sakthivelanss02@gmail.com` (or add your own to ADMIN_EMAILS)
3. Create password
4. You'll be automatically redirected to the admin dashboard

## �📁 Project Structure

```
datafusion/
├── app/                      # Next.js App Router
│   ├── (dashboard)/         # Main application routes
│   │   ├── dashboard/       # Overview dashboard
│   │   ├── map/            # Live incident map
│   │   ├── incidents/      # Incident management
│   │   ├── dispatch/       # Dispatch system
│   │   ├── centers/        # Rescue shelters
│   │   ├── teams/          # Responder teams
│   │   ├── analytics/      # Analytics & reports
│   │   ├── chatbot/        # AI Emergency Assistant
│   │   ├── reports/        # Report generation
│   │   └── settings/       # System settings
│   ├── api/                # API routes
│   │   ├── incidents/      # Incident endpoints
│   │   ├── dispatch/       # Dispatch endpoints
│   │   ├── chatbot/        # Chatbot API
│   │   └── ai/            # AI processing
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # shadcn components
│   ├── dashboard/          # Dashboard components
│   ├── map/               # Map components
│   ├── chatbot/           # Chatbot UI
│   ├── dispatch/          # Dispatch components
│   └── shared/            # Shared components
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── ...
├── lib/
│   ├── ai/                # Gemini integration
│   │   ├── triage.ts
│   │   ├── chatbot.ts
│   │   └── prompts.ts
│   ├── db/                # Prisma client
│   ├── supabase/          # Supabase client
│   │   └── client.tsions
│   └── hooks/             # Custom React hooks
├── types/
│   ├── incident.ts
│   ├── dispatch.ts
│   supabase/
│   └── schema.sql   
│   └── schema.prisma      # Database schema
└── public/
```
Tables

```
- users           // Responders, admins, command center
- incidents       // SOS reports with AI analysis
- rescue_shelters  // Emergency response shelters
- dispatch_tickets // Dispatch assignments
- chat_sessions   // Chatbot conversations
- chat_messages   // Chat history
- center_resources // Available resources
- ticket_resources // Dispatch resourcees
- Location      // Geocoded locations
```

## 🔑 Environment Variables

See `.env.example` for a complete list. Key variables:
NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GOOGLE_GEMINI_API_KEY` - For AI processing
- `NEXT_PUBLIC_MAPBOX_TOKEN` - For maps
- `NEXTAUTH_SECRET` - For authentication
- `TWILIO_ACCOUNT_SID` - For SMS/voice

## 🚦 Development Phases

### ✅ Phase 1: Foundation (Current)
- [x] Project setup
- [x] Basic Next.js structure
- [ ] Database schema
- [ ] Authentication

### 🔄 Phase 2-4: Core Features (In Progress)
- [ ] AI triage system
- [ ] Emergency chatbot
- [ ] Dispatch system
- [ ] Live incident map

### 📅 Phase 5-12: Advanced Features (Planned)
- [ ] Multi-source ingestion
- [ ] Field operations
- [ ] Advanced analytics
- [ ] Offline mode
- [ ] Testing & deployment

See [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) for detailed timeline.

## 🎯 Quick Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
# Use Supabase Dashboard for database management
# Or install Supabase CLI: npm install -g supabasedio
npx prisma migrate dev  # Create migration
npx prisma generate  # Generate client

# Testing (once set up)
npm test            # Run tests
npm run test:e2e    # Run E2E tests
```

## 📊 API Endpoints (Planned)

```
POST   /api/incidents        # Create incident
GET    /api/incidents        # List incidents
POST   /api/ai/triage       # AI triage processing
POST   /api/chatbot         # Chatbot conversation
POST   /api/dispatch        # Create dispatch
GET    /api/centers         # List rescue shelters
POST   /api/responders      # Update responder status
```

## 🤝 Contributing

This is a disaster management platform under active development. Contributions are welcome!

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For questions or issues:
- Open an issue on GitHub
- Check the [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)

---

**Built with ❤️ for disaster response and emergency management**

Last Updated: March 2, 2026
