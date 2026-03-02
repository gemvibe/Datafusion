"use client";

import { useState } from "react";

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "Hello! I'm your AI Emergency Assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I understand you need help. This is a demo response. The AI integration will be added in Phase 4.",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Emergency Assistant</h1>
          <p className="text-gray-600 mt-1">Get instant guidance during emergencies</p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              AI
            </div>
            <div className="ml-3">
              <div className="font-semibold">Emergency Assistant</div>
              <div className="text-sm text-green-600">● Online</div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t bg-gray-50">
          <div className="flex flex-wrap gap-2 mb-2">
            <button className="px-3 py-1 text-sm bg-white border rounded-full hover:bg-gray-50">
              🚑 Medical Emergency
            </button>
            <button className="px-3 py-1 text-sm bg-white border rounded-full hover:bg-gray-50">
              🔥 Fire
            </button>
            <button className="px-3 py-1 text-sm bg-white border rounded-full hover:bg-gray-50">
              🌊 Flood
            </button>
            <button className="px-3 py-1 text-sm bg-white border rounded-full hover:bg-gray-50">
              💡 Safety Tips
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your emergency question..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              onClick={handleSend}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Chatbot Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
          <div>✓ Emergency Q&A and guidance</div>
          <div>✓ Guided SOS form filling</div>
          <div>✓ Safety checklists</div>
          <div>✓ Multi-language support</div>
          <div>✓ Situation summarization</div>
          <div>✓ Escalation to SOS ticket</div>
        </div>
      </div>
    </div>
  );
}
