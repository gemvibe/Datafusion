export type IncidentStatus = 
  | "pending"
  | "assigned"
  | "en_route"
  | "on_scene"
  | "resolved"
  | "cancelled";

export type IncidentUrgency = "critical" | "high" | "medium" | "low";

export type IncidentType =
  | "medical"
  | "fire"
  | "flood"
  | "earthquake"
  | "accident"
  | "violence"
  | "missing_person"
  | "other";

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  urgency: IncidentUrgency;
  urgencyScore: number; // 1-10
  status: IncidentStatus;
  location: {
    address: string;
    landmark?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    confidence: number; // 0-1
  };
  peopleAffected: number;
  reportedBy: {
    name?: string;
    phone?: string;
    source: "manual" | "sms" | "voice" | "social" | "chatbot";
  };
  aiAnalysis: {
    summary: string;
    needTypes: string[];
    confidence: number;
    credibilityScore: number;
    isFakeSignal: boolean;
    reasoning: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
