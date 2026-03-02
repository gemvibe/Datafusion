"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: string;
  content: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (messageText?: string, action?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend && !action) return;
    
    setError(null);
    setShowReportSuggestion(false);
    
    // Add user message
    const userMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    
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

      // Show report suggestion if AI recommends it
      if (data.suggestReport) {
        setShowReportSuggestion(true);
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

  const handleQuickAction = (action: string, label: string) => {
    handleSend(label, action);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🤖 Tamil Nadu AI Emergency Assistant</h1>
          <p className="text-gray-600 mt-1">Powered by Google Gemini AI - Get instant disaster response guidance</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={`inline-flex items-center px-3 py-1 rounded-full ${loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
            <span className="mr-1">{loading ? '⏳' : '●'}</span>
            {loading ? 'Thinking...' : 'Online'}
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
                🤖
              </div>
              <div className="ml-3">
                <div className="font-semibold text-gray-900">First72 Emergency AI</div>
                <div className="text-xs text-gray-600">Specialized in Tamil Nadu disasters • Gemini-powered</div>
              </div>
            </div>
            <Link 
              href="/incidents/new"
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              📝 File Report
            </Link>
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
          <div className="text-xs text-gray-500 mb-2 font-semibold">Quick Actions:</div>
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
