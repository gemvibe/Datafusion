export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  context: {
    location?: string;
    emergencyType?: string;
    severity?: string;
  };
  escalated: boolean;
  incidentId?: string;
  createdAt: Date;
  updatedAt: Date;
}
