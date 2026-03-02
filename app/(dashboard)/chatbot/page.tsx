"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: string;
  content: string;
}

interface IncidentData {
  incidentType?: string;
  description?: string;
  location?: string;
  contactName?: string;
  contactPhone?: string;
  latitude?: string;
  longitude?: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "🙏 Vanakkam! I'm your AI Emergency Assistant for Tamil Nadu. I can help you with natural disaster emergencies, safety guidance, and reporting incidents. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReportSuggestion, setShowReportSuggestion] = useState(false);
  const [incidentMode, setIncidentMode] = useState(false);
  const [incidentData, setIncidentData] = useState<IncidentData>({});
  const [creatingIncident, setCreatingIncident] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Extract incident data from user responses
  const extractIncidentData = (userMessage: string, currentData: IncidentData): IncidentData => {
    const newData = { ...currentData };
    const lowerMsg = userMessage.toLowerCase();

    // Extract incident type
    if (!newData.incidentType) {
      if (lowerMsg.includes('flood')) newData.incidentType = 'flood';
      else if (lowerMsg.includes('earthquake') || lowerMsg.includes('quake')) newData.incidentType = 'earthquake';
      else if (lowerMsg.includes('cyclone') || lowerMsg.includes('storm')) newData.incidentType = 'cyclone';
      else if (lowerMsg.includes('tsunami')) newData.incidentType = 'tsunami';
      else if (lowerMsg.includes('landslide') || lowerMsg.includes('land slide')) newData.incidentType = 'landslide';
      else if (lowerMsg.includes('heatwave') || lowerMsg.includes('heat wave') || lowerMsg.includes('drought')) newData.incidentType = 'heatwave';
    }

    // Extract contact name (look for name patterns when description is already set but name isn't)
    if (!newData.contactName && newData.description && newData.location) {
      // Simple heuristic: if the message is short (< 50 chars) and has 2-4 words, might be a name
      const words = userMessage.trim().split(/\s+/);
      if (words.length >= 1 && words.length <= 4 && userMessage.length < 50) {
        // Check if it doesn't look like a phone number or description
        if (!userMessage.match(/\d{5,}/) && !lowerMsg.includes('street') && !lowerMsg.includes('road')) {
          newData.contactName = userMessage.trim();
        }
      }
    }

    // Extract phone number
    const phoneMatch = userMessage.match(/(\+?91)?[\s-]?[6-9]\d{9}/);
    if (phoneMatch && !newData.contactPhone) {
      newData.contactPhone = phoneMatch[0].trim();
    }

    // Extract location (look for location indicators)
    if (!newData.location && newData.description) {
      if (lowerMsg.includes('street') || lowerMsg.includes('road') || lowerMsg.includes('area') || 
          lowerMsg.includes('district') || lowerMsg.includes('near') || lowerMsg.includes('at ') ||
          lowerMsg.includes('chennai') || lowerMsg.includes('coimbatore') || lowerMsg.includes('madurai') ||
          lowerMsg.includes('salem') || lowerMsg.includes('trichy') || lowerMsg.includes('tirunelveli') ||
          userMessage.length > 10) {
        newData.location = userMessage.trim();
      }
    }

    // Extract description (after incident type but before location)
    if (!newData.description && newData.incidentType && userMessage.length > 20) {
      // Make sure it's not a location
      if (!lowerMsg.includes('street') && !lowerMsg.includes('road') && 
          !lowerMsg.includes('near') && !lowerMsg.includes('district')) {
        newData.description = userMessage.trim();
      }
    }

    // Extract coordinates if present
    const latMatch = userMessage.match(/lat(?:itude)?[\s:=]+(-?\d+\.?\d*)/i);
    const lngMatch = userMessage.match(/lon(?:g|gitude)?[\s:=]+(-?\d+\.?\d*)/i);
    if (latMatch) newData.latitude = latMatch[1];
    if (lngMatch) newData.longitude = lngMatch[1];

    return newData;
  };

  // Check if all required data is collected
  const isIncidentDataComplete = (data: IncidentData): boolean => {
    return !!(data.incidentType && data.description && data.location && data.contactName && data.contactPhone);
  };

  // Create incident in the system
  const createIncident = async (data: IncidentData) => {
    try {
      setCreatingIncident(true);
      
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create incident');
      }

      // Success message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ **Incident Created Successfully!**\n\nYour ${data.incidentType} incident report has been submitted to our response team.\n\n**Incident ID:** ${result.incident.id}\n**Location:** ${data.location}\n**Status:** Pending\n\nOur team will be notified immediately and will respond as soon as possible. You can view all incidents on the [Incidents page](/incidents).\n\nIs there anything else I can help you with?`,
        },
      ]);

      // Reset incident mode
      setIncidentMode(false);
      setIncidentData({});
      
    } catch (error: any) {
      console.error('Error creating incident:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ I'm sorry, there was an error creating the incident: ${error.message}\n\nPlease try again or contact emergency services at 112 if this is urgent.`,
        },
      ]);
    } finally {
      setCreatingIncident(false);
    }
  };

  const handleSend = async (messageText?: string, action?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend && !action) return;
    
    setError(null);
    setShowReportSuggestion(false);
    
    // Handle confirmation/cancellation in incident mode
    if (incidentMode && isIncidentDataComplete(incidentData)) {
      const lowerText = textToSend.toLowerCase();
      if (lowerText.includes('confirm') || lowerText.includes('yes') || lowerText.includes('submit')) {
        await createIncident(incidentData);
        return;
      } else if (lowerText.includes('cancel') || lowerText.includes('no') || lowerText.includes('start over')) {
        setIncidentMode(false);
        setIncidentData({});
        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            content: textToSend,
          },
          {
            role: "assistant",
            content: "Incident reporting cancelled. How else can I help you today?",
          },
        ]);
        return;
      }
    }
    
    // Add user message
    const userMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    
    // Extract incident data if in incident mode
    let updatedIncidentData = incidentData;
    if (incidentMode) {
      updatedIncidentData = extractIncidentData(textToSend, incidentData);
      setIncidentData(updatedIncidentData);
    }
    
    try {
      // Send only messages after the initial welcome message (exclude first assistant message)
      const conversationHistory = messages.slice(1); // Skip the welcome message
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...conversationHistory, userMessage],
          action: action,
          incidentMode: incidentMode,
          incidentData: updatedIncidentData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get response');
      }

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
        },
      ]);

      // Check if AI wants to start incident reporting mode
      if (data.startIncidentMode && !incidentMode) {
        setIncidentMode(true);
        // Note: Don't add another message here - the AI response already activated the mode
      }

      // Show report suggestion if AI recommends it (only in normal mode)
      if (data.suggestReport && !incidentMode) {
        setShowReportSuggestion(true);
      }

      // Check if we have all required data to create incident
      if (incidentMode && isIncidentDataComplete(updatedIncidentData)) {
        // Ask for confirmation
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `📋 **Please Confirm Incident Details:**\n\n` +
              `**Type:** ${updatedIncidentData.incidentType}\n` +
              `**Description:** ${updatedIncidentData.description}\n` +
              `**Location:** ${updatedIncidentData.location}\n` +
              `**Your Name:** ${updatedIncidentData.contactName}\n` +
              `**Phone:** ${updatedIncidentData.contactPhone}\n` +
              (updatedIncidentData.latitude && updatedIncidentData.longitude ? 
                `**Coordinates:** ${updatedIncidentData.latitude}, ${updatedIncidentData.longitude}\n\n` : '\n') +
              `Type "confirm" to submit this report, or "cancel" to start over.`,
          },
        ]);
      }

    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to connect to AI assistant');
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ I'm having trouble connecting right now. Please ensure the Gemini API key is configured, or try calling emergency services: 112 (Emergency) or 1077 (State Disaster Helpline).",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startIncidentReporting = () => {
    setIncidentMode(true);
    setIncidentData({});
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "📋 **Incident Reporting Mode Activated**\n\nI'll help you report this incident step by step. Let's start:\n\nWhat type of natural disaster are you experiencing?\n• 🌊 Flood\n• 🏚️ Earthquake\n• 🌀 Cyclone\n• 🌊 Tsunami\n• ⛰️ Landslide\n• 🌡️ Heatwave",
      },
    ]);
  };

  const handleQuickAction = (action: string, label: string) => {
    handleSend(label, action);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🤖 Tamil Nadu AI Emergency Assistant</h1>
          <p className="text-gray-600 mt-1">
            {incidentMode 
              ? "📋 Incident Reporting Mode - Collecting information step by step" 
              : "Powered by Google Gemini AI - Get instant disaster response guidance"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {incidentMode && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 border-2 border-blue-400 rounded-lg">
              <span className="text-sm font-semibold text-blue-900">📋 Collecting Data</span>
              <div className="flex gap-1 text-xs">
                <span className={incidentData.incidentType ? "text-green-600" : "text-gray-400"}>●</span>
                <span className={incidentData.description ? "text-green-600" : "text-gray-400"}>●</span>
                <span className={incidentData.location ? "text-green-600" : "text-gray-400"}>●</span>
                <span className={incidentData.contactName ? "text-green-600" : "text-gray-400"}>●</span>
                <span className={incidentData.contactPhone ? "text-green-600" : "text-gray-400"}>●</span>
              </div>
            </div>
          )}
          {!incidentMode && (
            <button
              onClick={startIncidentReporting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
            >
              📝 Report Incident
            </button>
          )}
          <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm ${loading || creatingIncident ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
            <span className="mr-1">{loading || creatingIncident ? '⏳' : '●'}</span>
            {creatingIncident ? 'Creating...' : loading ? 'Thinking...' : 'Online'}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <div className="font-semibold text-red-900">Connection Error</div>
              <div className="text-sm text-red-700">{error}</div>
              <div className="text-xs text-red-600 mt-2">
                💡 Make sure you have added <code className="bg-red-100 px-1 rounded">GOOGLE_GEMINI_API_KEY</code> to your .env.local file.
                Get a free key at <a href="https://makersuite.google.com/app/apikey" target="_blank" className="underline font-semibold">Google AI Studio</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {incidentMode ? '📋' : '🤖'}
              </div>
              <div className="ml-3">
                <div className="font-semibold text-gray-900">
                  {incidentMode ? 'Incident Reporting Assistant' : 'First72 Emergency AI'}
                </div>
                <div className="text-xs text-gray-600">
                  {incidentMode 
                    ? 'Guiding you through the reporting process' 
                    : 'Specialized in Tamil Nadu disasters • Gemini-powered'}
                </div>
              </div>
            </div>
            {incidentMode && (
              <button
                onClick={() => {
                  setIncidentMode(false);
                  setIncidentData({});
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: "assistant",
                      content: "Incident reporting cancelled. How else can I help you today?",
                    },
                  ]);
                }}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ✕ Cancel
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md px-4 py-3 rounded-lg shadow-sm ${
                  message.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-md px-4 py-3 rounded-lg bg-white border border-gray-200 rounded-bl-none shadow-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                  </div>
                  <span className="text-sm">AI is analyzing...</span>
                </div>
              </div>
            </div>
          )}

          {/* Incident Mode Progress Indicator */}
          {incidentMode && !isIncidentDataComplete(incidentData) && (
            <div className="flex justify-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md w-full">
                <div className="text-sm font-semibold text-blue-900 mb-2">📋 Collecting Incident Information:</div>
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center gap-2 ${incidentData.incidentType ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{incidentData.incidentType ? '✅' : '⬜'}</span>
                    <span>Disaster Type {incidentData.incidentType ? `(${incidentData.incidentType})` : ''}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${incidentData.description ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{incidentData.description ? '✅' : '⬜'}</span>
                    <span>Description {incidentData.description ? '(✓)' : ''}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${incidentData.location ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{incidentData.location ? '✅' : '⬜'}</span>
                    <span>Location {incidentData.location ? '(✓)' : ''}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${incidentData.contactName ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{incidentData.contactName ? '✅' : '⬜'}</span>
                    <span>Your Name {incidentData.contactName ? `(${incidentData.contactName})` : ''}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${incidentData.contactPhone ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{incidentData.contactPhone ? '✅' : '⬜'}</span>
                    <span>Phone Number {incidentData.contactPhone ? `(${incidentData.contactPhone})` : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Report Suggestion */}
          {showReportSuggestion && (
            <div className="flex justify-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md">
                <div className="text-sm text-green-900 mb-3">
                  <span className="font-semibold">📋 Ready to file an official report?</span>
                  <p className="text-green-700 mt-1">Based on our conversation, you may want to submit an incident report to alert response teams.</p>
                </div>
                <Link 
                  href="/incidents/new"
                  className="block text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                >
                  🚨 File Incident Report Now
                </Link>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-t bg-white">
          <div className="text-xs text-gray-500 mb-2 font-semibold">
            {incidentMode ? 'Quick Responses:' : 'Quick Actions:'}
          </div>
          {incidentMode ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {!incidentData.incidentType && (
                <>
                  <button 
                    onClick={() => handleSend('Flood')}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50 font-medium"
                  >
                    🌊 Flood
                  </button>
                  <button 
                    onClick={() => handleSend('Earthquake')}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm bg-orange-50 text-orange-700 border border-orange-200 rounded-full hover:bg-orange-100 transition-colors disabled:opacity-50 font-medium"
                  >
                    🏚️ Earthquake
                  </button>
                  <button 
                    onClick={() => handleSend('Cyclone')}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 border border-purple-200 rounded-full hover:bg-purple-100 transition-colors disabled:opacity-50 font-medium"
                  >
                    🌀 Cyclone
                  </button>
                </>
              )}
              {isIncidentDataComplete(incidentData) && (
                <>
                  <button 
                    onClick={() => handleSend('confirm')}
                    disabled={loading || creatingIncident}
                    className="px-4 py-1.5 text-sm bg-green-600 text-white border border-green-700 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    ✅ Confirm & Submit
                  </button>
                  <button 
                    onClick={() => handleSend('cancel')}
                    disabled={loading || creatingIncident}
                    className="px-3 py-1.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50 font-medium"
                  >
                    ❌ Cancel
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              <button 
                onClick={() => handleQuickAction('flood', 'Flood emergency guidance')}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50 font-medium"
              >
                🌊 Flood
              </button>
              <button 
                onClick={() => handleQuickAction('earthquake', 'Earthquake safety steps')}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-orange-50 text-orange-700 border border-orange-200 rounded-full hover:bg-orange-100 transition-colors disabled:opacity-50 font-medium"
              >
                🏚️ Earthquake
              </button>
              <button 
                onClick={() => handleQuickAction('cyclone', 'Cyclone preparation')}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 border border-purple-200 rounded-full hover:bg-purple-100 transition-colors disabled:opacity-50 font-medium"
              >
                🌀 Cyclone
              </button>
              <button 
                onClick={() => handleQuickAction('safety', 'General safety tips')}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-green-50 text-green-700 border border-green-200 rounded-full hover:bg-green-100 transition-colors disabled:opacity-50 font-medium"
              >
                💡 Safety Tips
              </button>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
              disabled={loading}
              placeholder="Ask about any disaster emergency in Tamil Nadu..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? '⏳' : '📤'} Send
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            💬 Powered by Gemini AI • Responses based on Tamil Nadu disaster protocols
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <span>🤖</span> AI Emergency Assistant Capabilities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <span>✓</span>
            <span><strong>Real-time guidance</strong> for floods, earthquakes, cyclones, tsunamis, landslides, heatwaves</span>
          </div>
          <div className="flex items-start gap-2">
            <span>✓</span>
            <span><strong>Tamil Nadu-specific</strong> advice based on local geography and patterns</span>
          </div>
          <div className="flex items-start gap-2">
            <span>✓</span>
            <span><strong>Safety checklists</strong> and step-by-step emergency protocols</span>
          </div>
          <div className="flex items-start gap-2">
            <span>✓</span>
            <span><strong>Incident reporting</strong> assistance with location and severity assessment</span>
          </div>
          <div className="flex items-start gap-2">
            <span>✓</span>
            <span><strong>Emergency hotlines</strong>: 112 (Emergency), 1077 (State Disaster)</span>
          </div>
          <div className="flex items-start gap-2">
            <span>✓</span>
            <span><strong>Calm & clear communication</strong> designed for crisis situations</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="text-sm text-blue-700">
            <strong>⚠️ Important:</strong> For life-threatening emergencies, always call <strong>112</strong> first. This AI assistant provides guidance but does not replace emergency services.
          </div>
        </div>
      </div>
    </div>
  );
}
